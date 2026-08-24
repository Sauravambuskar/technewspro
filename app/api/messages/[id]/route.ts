import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deleteMessage, setMessageRead } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();
  const payload = await readJson<{ read?: boolean }>(request);
  if (typeof payload.read !== "boolean") return fail('"read" must be true or false.');
  const message = await setMessageRead(params.id, payload.read);
  if (!message) return fail("Message not found.", 404);
  return ok(message);
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deleteMessage(params.id);
  if (!removed) return fail("Message not found.", 404);
  return ok({ id: params.id, deleted: true });
});
