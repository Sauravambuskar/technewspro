import { fail, handler, ok, readJson, requireString, requireUser } from "@/lib/api";
import { createForm, listForms } from "@/lib/forms";
import type { ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  const requested = new URL(request.url).searchParams.get("status") as ArticleStatus | "all" | null;

  const { getCurrentUser } = await import("@/lib/auth");
  const signedIn = Boolean(await getCurrentUser());
  return ok(await listForms(signedIn && requested ? requested : "published"));
});

export const POST = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);
  const name = requireString(payload.name, "name", { max: 200 });

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }

  const form = await createForm({
    name,
    description: typeof payload.description === "string" ? payload.description : undefined,
    fields: payload.fields,
    submitLabel: typeof payload.submitLabel === "string" ? payload.submitLabel : undefined,
    successMessage: typeof payload.successMessage === "string" ? payload.successMessage : undefined,
    status: payload.status as ArticleStatus | undefined
  });

  return ok(form, { status: 201 });
});
