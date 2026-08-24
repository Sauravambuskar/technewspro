import { handler, ok, readJson, requireUser } from "@/lib/api";
import { getSettings, saveSettings } from "@/lib/settings";
import type { Settings } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => ok(await getSettings()));

export const PUT = handler(async (request: Request) => {
  await requireUser();
  return ok(await saveSettings(await readJson<Partial<Settings>>(request)));
});
