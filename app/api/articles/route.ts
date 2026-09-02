import { fail, handler, ok, readJson, requireUser, requireString } from "@/lib/api";
import { createArticle, listArticles } from "@/lib/articles";
import type { ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const requestedStatus = params.get("status") as ArticleStatus | "all" | null;

  // Drafts are only listable by a signed-in editor.
  const { getCurrentUser } = await import("@/lib/auth");
  const signedIn = Boolean(await getCurrentUser());
  const status = signedIn && requestedStatus ? requestedStatus : "published";

  const articles = await listArticles({
    status,
    section: params.get("section") || undefined,
    search: params.get("q") || undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : undefined
  });
  return ok(articles);
});

export const POST = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);
  const title = requireString(payload.title, "title", { max: 300 });

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }

  const article = await createArticle({
    title,
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    section: typeof payload.section === "string" ? payload.section : undefined,
    subcategory: typeof payload.subcategory === "string" ? payload.subcategory : undefined,
    tag: typeof payload.tag === "string" ? payload.tag : undefined,
    tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : undefined,
    dek: typeof payload.dek === "string" ? payload.dek : undefined,
    image: typeof payload.image === "string" ? payload.image : undefined,
    imageAlt: typeof payload.imageAlt === "string" ? payload.imageAlt : undefined,
    minutes: typeof payload.minutes === "number" ? payload.minutes : undefined,
    date: typeof payload.date === "string" ? payload.date : undefined,
    body: payload.body as string | string[] | undefined,
    status: payload.status as ArticleStatus | undefined,
    featured: Boolean(payload.featured),
    author: typeof payload.author === "string" ? payload.author : undefined,
    seo: payload.seo
  });

  return ok(article, { status: 201 });
});
