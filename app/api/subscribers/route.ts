import { handler, ok, requireUser } from "@/lib/api";
import { listSubscribers, toCsv } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  await requireUser();
  const subscribers = await listSubscribers();

  if (new URL(request.url).searchParams.get("format") === "csv") {
    return new Response(toCsv(subscribers), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  }

  return ok(subscribers);
});
