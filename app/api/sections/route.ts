import { handler, HttpError, ok, readJson, requireUser, requireString } from "@/lib/api";
import { createSection, listSections, replaceSections } from "@/lib/sections";
import type { Section } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => ok(await listSections()));

export const POST = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);
  const label = requireString(payload.label, "label", { max: 80 });

  try {
    const section = await createSection({
      label,
      id: typeof payload.id === "string" ? payload.id : undefined,
      eyebrow: typeof payload.eyebrow === "string" ? payload.eyebrow : undefined,
      heading: typeof payload.heading === "string" ? payload.heading : undefined,
      cta: typeof payload.cta === "string" ? payload.cta : undefined,
      showInNav: typeof payload.showInNav === "boolean" ? payload.showInNav : undefined,
      showOnHome: typeof payload.showOnHome === "boolean" ? payload.showOnHome : undefined
    });
    return ok(section, { status: 201 });
  } catch (error) {
    throw new HttpError((error as Error).message, 409);
  }
});

/** Bulk replace — used by the admin ordering UI. */
export const PUT = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<{ sections?: Section[] }>(request);
  if (!Array.isArray(payload.sections)) throw new HttpError('"sections" must be an array.');
  return ok(await replaceSections(payload.sections));
});
