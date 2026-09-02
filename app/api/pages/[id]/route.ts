import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deletePage, getPageById, updatePage } from "@/lib/pages";
import { isPageLayout, type ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const GET = handler(async (_request: Request, { params }: Ctx) => {
  const page = await getPageById(params.id);
  if (!page) return fail("Page not found.", 404);
  if (page.status !== "published") await requireUser();
  return ok(page);
});

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }

  const page = await updatePage(params.id, {
    title: typeof payload.title === "string" ? payload.title : undefined,
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    summary: typeof payload.summary === "string" ? payload.summary : undefined,
    body: payload.body as string | string[] | undefined,
    status: payload.status as ArticleStatus | undefined,
    layout: isPageLayout(payload.layout) ? payload.layout : undefined,
    hideTitle: typeof payload.hideTitle === "boolean" ? payload.hideTitle : undefined,
    showInNav: typeof payload.showInNav === "boolean" ? payload.showInNav : undefined,
    showInFooter: typeof payload.showInFooter === "boolean" ? payload.showInFooter : undefined,
    order: typeof payload.order === "number" ? payload.order : undefined,
    author: typeof payload.author === "string" ? payload.author : undefined,
    seo: payload.seo
  });

  if (!page) return fail("Page not found.", 404);
  return ok(page);
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deletePage(params.id);
  if (!removed) return fail("Page not found.", 404);
  return ok({ id: params.id, deleted: true });
});
