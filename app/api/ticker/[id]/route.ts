import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deleteTickerItem, updateTickerItem } from "@/lib/ticker";
import type { TickerItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();
  const item = await updateTickerItem(params.id, await readJson<Partial<TickerItem>>(request));
  if (!item) return fail("Ticker item not found.", 404);
  return ok(item);
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deleteTickerItem(params.id);
  if (!removed) return fail("Ticker item not found.", 404);
  return ok({ id: params.id, deleted: true });
});
