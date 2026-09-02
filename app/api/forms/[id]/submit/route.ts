import { fail, handler, ok, readJson } from "@/lib/api";
import { getFormById, recordSubmission } from "@/lib/forms";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

/** Public: anyone filling in a published form on the site. */
export const POST = handler(async (request: Request, { params }: Ctx) => {
  if (!rateLimit(clientKey(request, `form:${params.id}`), { limit: 5, windowMs: 60_000 }).allowed) {
    return fail("Too many submissions. Try again in a minute.", 429);
  }

  const form = await getFormById(params.id);
  // Draft forms are not open to the public, and a missing form says nothing more.
  if (!form || form.status !== "published") return fail("Form not found.", 404);

  const payload = await readJson<Record<string, unknown>>(request);
  const { submission, errors } = await recordSubmission(form, payload);
  if (!submission) return fail(errors[0] ?? "Please check the form and try again.", 400, errors);

  return ok({ id: submission.id, message: form.successMessage }, { status: 201 });
});
