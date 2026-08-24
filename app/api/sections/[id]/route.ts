import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { listArticles } from "@/lib/articles";
import { deleteSection, updateSection } from "@/lib/sections";
import type { Section } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();
  const payload = await readJson<Partial<Section>>(request);
  const section = await updateSection(params.id, payload);
  if (!section) return fail("Section not found.", 404);
  return ok(section);
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();

  const inUse = await listArticles({ section: params.id, status: "all" });
  if (inUse.length > 0) {
    return fail(`This section still holds ${inUse.length} article(s). Move or delete them first.`, 409);
  }

  const removed = await deleteSection(params.id);
  if (!removed) return fail("Section not found.", 404);
  return ok({ id: params.id, deleted: true });
});
