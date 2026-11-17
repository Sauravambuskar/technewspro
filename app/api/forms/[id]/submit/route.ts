import { fail, handler, ok, readJson } from "@/lib/api";
import { notify } from "@/lib/email";
import { getFormById, recordSubmission } from "@/lib/forms";
import { getSettings } from "@/lib/settings";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** Public: anyone filling in a published form on the site. */
export const POST = handler(async (request: Request, ctx: Ctx) => {
  const params = await ctx.params;
  if (!rateLimit(clientKey(request, `form:${params.id}`), { limit: 5, windowMs: 60_000 }).allowed) {
    return fail("Too many submissions. Try again in a minute.", 429);
  }

  const form = await getFormById(params.id);
  // Draft forms are not open to the public, and a missing form says nothing more.
  if (!form || form.status !== "published") return fail("Form not found.", 404);

  const payload = await readJson<Record<string, unknown>>(request);
  const { submission, errors } = await recordSubmission(form, payload, {
    landingPage: typeof payload._landingPage === "string" ? payload._landingPage : undefined
  });
  if (!submission) return fail(errors[0] ?? "Please check the form and try again.", 400, errors);

  const settings = await getSettings();
  const recipients = form.notificationEmails.length > 0
    ? form.notificationEmails
    : settings.notifyEmail
      ? [settings.notifyEmail]
      : [];
  if (settings.notifyOnFormSubmission && recipients.length > 0) {
    const lines = form.fields
      .map((field) => `${field.label}: ${submission.values[field.name] || "—"}`)
      .join("\n");

    const attribution = [
      form.campaignName && `Campaign: ${form.campaignName}`,
      form.campaignVariant && `Variant: ${form.campaignVariant}`,
      submission.landingPage && `Landing page: ${submission.landingPage}`
    ].filter(Boolean).join("\n");

    recipients.forEach((to) => notify({
      to,
      subject: `New response: ${form.name}`,
      text: `${attribution ? `${attribution}\n\n` : ""}${lines}\n\nAll responses: /admin/forms/${form.id}/submissions`
    }));
  }

  return ok({ id: submission.id, message: form.successMessage }, { status: 201 });
});
