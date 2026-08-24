import { handler, ok } from "@/lib/api";
import { listArticles } from "@/lib/articles";
import { listResources } from "@/lib/resources";
import { RESOURCE_TYPE_LABELS } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const query = params.get("q")?.trim() ?? "";
  if (!query) return ok([]);

  const limit = Number(params.get("limit")) || 8;
  const [articles, resources] = await Promise.all([
    listArticles({ search: query, status: "published", limit }),
    listResources({ search: query, status: "published", limit })
  ]);

  const hits = [
    ...articles.map((article) => ({
      href: `/articles/${article.slug}`,
      title: article.title,
      tag: article.tag
    })),
    ...resources.map((resource) => ({
      href: `/resources/${resource.type}/${resource.slug}`,
      title: resource.title,
      tag: RESOURCE_TYPE_LABELS[resource.type].singular.toUpperCase()
    }))
  ];

  return ok(hits.slice(0, limit));
});
