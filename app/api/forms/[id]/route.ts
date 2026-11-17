import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deleteForm, getFormById, updateForm } from "@/lib/forms";
import type { ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async (_request: Request, ctx: Ctx) => {
  const params = await ctx.params;
  const form = await getFormById(params.id);
  if (!form) return fail("Form not found.", 404);
  if (form.status !== "published") await requireUser();
  return ok(form);
});

export const PATCH = handler(async (request: Request, ctx: Ctx) => {
  const params = await ctx.params;
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }

  const form = await updateForm(params.id, {
    name: typeof payload.name === "string" ? payload.name : undefined,
    campaignName: typeof payload.campaignName === "string" ? payload.campaignName : undefined,
    campaignVariant: typeof payload.campaignVariant === "string" ? payload.campaignVariant : undefined,
    notificationEmails: Array.isArray(payload.notificationEmails) ? payload.notificationEmails : undefined,
    description: typeof payload.description === "string" ? payload.description : undefined,
    fields: payload.fields,
    submitLabel: typeof payload.submitLabel === "string" ? payload.submitLabel : undefined,
    successMessage: typeof payload.successMessage === "string" ? payload.successMessage : undefined,
    status: payload.status as ArticleStatus | undefined
  });

  if (!form) return fail("Form not found.", 404);
  return ok(form);
});

export const DELETE = handler(async (_request: Request, ctx: Ctx) => {
  const params = await ctx.params;
  await requireUser();
  const removed = await deleteForm(params.id);
  if (!removed) return fail("Form not found.", 404);
  return ok({ id: params.id, deleted: true });
});
