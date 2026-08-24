import { fail, handler, ok, readJson, requireString } from "@/lib/api";
import { createMessage } from "@/lib/messages";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { EMAIL_RE } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  if (!rateLimit(clientKey(request, "contact"), { limit: 3, windowMs: 60_000 }).allowed) {
    return fail("Too many messages sent. Try again shortly.", 429);
  }

  const payload = await readJson<Record<string, unknown>>(request);
  const name = requireString(payload.name, "name", { max: 120 });
  const email = requireString(payload.email, "email", { max: 200 });
  const body = requireString(payload.body ?? payload.message, "message", { max: 5000 });
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.");

  const message = await createMessage({
    name,
    email,
    body,
    subject: typeof payload.subject === "string" ? payload.subject : undefined
  });

  return ok({ id: message.id, message: "Thanks — your note is with the newsroom." }, { status: 201 });
});
