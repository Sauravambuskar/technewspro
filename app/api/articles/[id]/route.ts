import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deleteArticle, getArticleById, updateArticle } from "@/lib/articles";
import type { ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const GET = handler(async (_request: Request, { params }: Ctx) => {
  const article = await getArticleById(params.id);
  if (!article) return fail("Article not found.", 404);
  if (article.status !== "published") await requireUser();
  return ok(article);
});

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }

  const article = await updateArticle(params.id, {
    title: typeof payload.title === "string" ? payload.title : undefined,
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    section: typeof payload.section === "string" ? payload.section : undefined,
    subcategory: typeof payload.subcategory === "string" ? payload.subcategory : undefined,
    tag: typeof payload.tag === "string" ? payload.tag : undefined,
    tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : undefined,
    dek: typeof payload.dek === "string" ? payload.dek : undefined,
    image: typeof payload.image === "string" ? payload.image : undefined,
    minutes: typeof payload.minutes === "number" ? payload.minutes : undefined,
    date: typeof payload.date === "string" ? payload.date : undefined,
    body: payload.body as string | string[] | undefined,
    status: payload.status as ArticleStatus | undefined,
    featured: typeof payload.featured === "boolean" ? payload.featured : undefined,
    author: typeof payload.author === "string" ? payload.author : undefined
  });

  if (!article) return fail("Article not found.", 404);
  return ok(article);
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deleteArticle(params.id);
  if (!removed) return fail("Article not found.", 404);
  return ok({ id: params.id, deleted: true });
});
