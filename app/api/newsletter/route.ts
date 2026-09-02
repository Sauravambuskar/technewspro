import { fail, handler, ok, readJson, requireString } from "@/lib/api";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { EMAIL_RE, subscribe } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  if (!rateLimit(clientKey(request, "newsletter"), { limit: 5, windowMs: 60_000 }).allowed) {
    return fail("Too many sign-up attempts. Try again in a minute.", 429);
  }

  const payload = await readJson<{ email?: string; source?: string }>(request);
  const email = requireString(payload.email, "email", { max: 200 });
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.");

  const result = await subscribe(email, typeof payload.source === "string" ? payload.source : "website");
  // No confirmation email is sent — nothing here talks to an SMTP provider yet,
  // so don't promise the reader one.
  const message =
    result.status === "already-subscribed"
      ? "You're already on the list — see you Tuesday."
      : `You're in — ${result.subscriber.email} will get the next brief.`;

  return ok({ status: result.status, message }, { status: result.status === "created" ? 201 : 200 });
});
