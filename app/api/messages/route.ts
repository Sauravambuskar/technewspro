import { handler, ok, requireUser } from "@/lib/api";
import { listMessages } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireUser();
  return ok(await listMessages());
});
