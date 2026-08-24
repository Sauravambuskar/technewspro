import { cookies } from "next/headers";
import { handler, ok } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async () => {
  cookies().delete(SESSION_COOKIE);
  return ok({ signedOut: true });
});
