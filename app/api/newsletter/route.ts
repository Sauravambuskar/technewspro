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
  const message =
    result.status === "already-subscribed"
      ? "You're already on the list — see you Sunday."
      : `You're in — confirmation sent to ${result.subscriber.email}.`;

  return ok({ status: result.status, message }, { status: result.status === "created" ? 201 : 200 });
});
