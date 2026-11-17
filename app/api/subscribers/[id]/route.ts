import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deleteSubscriber, setSubscriberStatus } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = handler(async (request: Request, ctx: Ctx) => {
  const params = await ctx.params;
  await requireUser();
  const payload = await readJson<{ status?: string }>(request);
  if (payload.status !== "subscribed" && payload.status !== "unsubscribed") {
    return fail('"status" must be "subscribed" or "unsubscribed".');
  }
  const subscriber = await setSubscriberStatus(params.id, payload.status);
  if (!subscriber) return fail("Subscriber not found.", 404);
  return ok(subscriber);
});

export const DELETE = handler(async (_request: Request, ctx: Ctx) => {
  const params = await ctx.params;
  await requireUser();
  const removed = await deleteSubscriber(params.id);
  if (!removed) return fail("Subscriber not found.", 404);
  return ok({ id: params.id, deleted: true });
});
