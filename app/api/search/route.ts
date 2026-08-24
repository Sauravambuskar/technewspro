import { handler, ok } from "@/lib/api";
import { listArticles } from "@/lib/articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  if (!query) return ok([]);

  const results = await listArticles({ search: query, status: "published", limit: Number(params.get("limit")) || 6 });
  return ok(results.map(({ slug, title, tag, section }) => ({ slug, title, tag, section })));
});
