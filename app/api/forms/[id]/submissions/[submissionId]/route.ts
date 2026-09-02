import { fail, handler, ok, requireUser } from "@/lib/api";
import { deleteSubmission } from "@/lib/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string; submissionId: string } };

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deleteSubmission(params.submissionId);
  if (!removed) return fail("Response not found.", 404);
  return ok({ id: params.submissionId, deleted: true });
});
