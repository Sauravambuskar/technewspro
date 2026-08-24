import { handler, HttpError, ok, readJson, requireUser, requireString } from "@/lib/api";
import { createTickerItem, listTicker, replaceTicker } from "@/lib/ticker";
import type { TickerItem } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  const onlyEnabled = new URL(request.url).searchParams.get("enabled") === "true";
  return ok(await listTicker(onlyEnabled));
});

export const POST = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<{ text?: string }>(request);
  const text = requireString(payload.text, "text", { max: 300 });
  return ok(await createTickerItem(text), { status: 201 });
});

export const PUT = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<{ items?: TickerItem[] }>(request);
  if (!Array.isArray(payload.items)) throw new HttpError('"items" must be an array.');
  return ok(await replaceTicker(payload.items));
});
