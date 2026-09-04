import { handler, ok } from "@/lib/api";
import { recordAdImpression } from "@/lib/ads";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

/** Public beacon. The client already de-dupes per session; this caps the rest. */
export const POST = handler(async (request: Request, { params }: Ctx) => {
  if (!rateLimit(clientKey(request, `ad:${params.id}`), { limit: 10, windowMs: 60_000 }).allowed) {
    return ok({ counted: false });
  }
  await recordAdImpression(params.id);
  return ok({ counted: true });
});
