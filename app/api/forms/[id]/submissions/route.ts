import { fail, handler, ok, requireUser } from "@/lib/api";
import { getFormById, listSubmissions, submissionsToCsv } from "@/lib/forms";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const GET = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();

  const form = await getFormById(params.id);
  if (!form) return fail("Form not found.", 404);

  const submissions = await listSubmissions(form.id);

  if (new URL(request.url).searchParams.get("format") === "csv") {
    const filename = `${form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "form"}-responses`;
    return new Response(submissionsToCsv(form, submissions), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}-${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  }

  return ok(submissions);
});
