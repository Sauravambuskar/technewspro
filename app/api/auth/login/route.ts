import { cookies } from "next/headers";
import { fail, handler, ok, readJson, requireString } from "@/lib/api";
import { authenticate, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  // Slow password hashing protects each attempt; the IP bucket prevents an
  // attacker from turning that work into an unlimited login brute-force loop.
  if (!rateLimit(clientKey(request, "admin-login"), { limit: 8, windowMs: 15 * 60_000 }).allowed) {
    return fail("Too many sign-in attempts. Try again in 15 minutes.", 429);
  }

  const payload = await readJson<{ email?: string; password?: string }>(request);
  const email = requireString(payload.email, "email", { max: 200 });
  const password = requireString(payload.password, "password", { max: 200 });

  const user = await authenticate(email, password);
  if (!user) return fail("That email and password combination doesn't match an account.", 401);

  cookies().set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions());
  return ok(user);
});
