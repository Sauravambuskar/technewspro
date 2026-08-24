import { cookies } from "next/headers";
import { fail, handler, ok, readJson, requireString } from "@/lib/api";
import { authenticate, createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  const payload = await readJson<{ email?: string; password?: string }>(request);
  const email = requireString(payload.email, "email", { max: 200 });
  const password = requireString(payload.password, "password", { max: 200 });

  const user = await authenticate(email, password);
  if (!user) return fail("That email and password combination doesn't match an account.", 401);

  cookies().set(SESSION_COOKIE, await createSessionToken(user.id), sessionCookieOptions());
  return ok(user);
});
