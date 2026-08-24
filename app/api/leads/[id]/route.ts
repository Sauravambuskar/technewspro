import { fail, handler, ok, requireUser } from "@/lib/api";
import { deleteLead } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const DELETE = handler(async (_request: Request, { params }: { params: { id: string } }) => {
  await requireUser();
  const removed = await deleteLead(params.id);
  if (!removed) return fail("Lead not found.", 404);
  return ok({ id: params.id, deleted: true });
});
