import { handler, HttpError, ok, readJson, requireUser, requireString } from "@/lib/api";
import { changePassword, deleteUser } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  const actor = await requireUser();
  if (actor.role !== "admin" && actor.id !== params.id) {
    throw new HttpError("You can only change your own password.", 403);
  }

  const payload = await readJson<{ password?: string }>(request);
  const password = requireString(payload.password, "password", { max: 200 });
  if (password.length < 8) throw new HttpError("Passwords must be at least 8 characters.");

  if (!(await changePassword(params.id, password))) throw new HttpError("Account not found.", 404);
  return ok({ id: params.id, updated: true });
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  const actor = await requireUser();
  if (actor.role !== "admin") throw new HttpError("Only an admin can remove team members.", 403);
  if (actor.id === params.id) throw new HttpError("You cannot delete the account you're signed in with.", 409);

  try {
    if (!(await deleteUser(params.id))) throw new HttpError("Account not found.", 404);
  } catch (error) {
    if (error instanceof HttpError) throw error;
    throw new HttpError((error as Error).message, 409);
  }
  return ok({ id: params.id, deleted: true });
});
