import { handler, HttpError, ok, readJson, requireUser, requireString } from "@/lib/api";
import { createUser, listUsers } from "@/lib/auth";
import { EMAIL_RE } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireUser();
  return ok(await listUsers());
});

export const POST = handler(async (request: Request) => {
  const actor = await requireUser();
  if (actor.role !== "admin") throw new HttpError("Only an admin can add team members.", 403);

  const payload = await readJson<Record<string, unknown>>(request);
  const email = requireString(payload.email, "email", { max: 200 });
  const password = requireString(payload.password, "password", { max: 200 });
  if (!EMAIL_RE.test(email)) throw new HttpError("Enter a valid email address.");
  if (password.length < 8) throw new HttpError("Passwords must be at least 8 characters.");

  try {
    const user = await createUser({
      email,
      password,
      name: typeof payload.name === "string" ? payload.name : undefined,
      role: payload.role === "admin" ? "admin" : "editor"
    });
    return ok(user, { status: 201 });
  } catch (error) {
    throw new HttpError((error as Error).message, 409);
  }
});
