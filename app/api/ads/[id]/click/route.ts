import { NextResponse } from "next/server";
import { handler } from "@/lib/api";
import { recordAdClick } from "@/lib/ads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

/**
 * Public: counts the click, then forwards. The destination comes from the ad
 * record rather than the query string, so this can't be used as an open
 * redirect.
 */
export const GET = handler(async (request: Request, { params }: Ctx) => {
  const destination = await recordAdClick(params.id);
  const home = new URL("/", request.url).toString();

  if (!destination) return NextResponse.redirect(home, 302);
  // Only ever forward somewhere a browser can go on the open web.
  if (!/^https?:\/\//i.test(destination)) return NextResponse.redirect(home, 302);

  return NextResponse.redirect(destination, 302);
});
