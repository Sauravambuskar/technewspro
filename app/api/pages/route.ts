import { fail, handler, ok, readJson, requireString, requireUser } from "@/lib/api";
import { createPage, listPages } from "@/lib/pages";
import { isPageLayout, type ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  const requested = new URL(request.url).searchParams.get("status") as ArticleStatus | "all" | null;

  const { getCurrentUser } = await import("@/lib/auth");
  const signedIn = Boolean(await getCurrentUser());
  // Drafts are only ever listed for a signed-in editor.
  return ok(await listPages(signedIn && requested ? requested : "published"));
});

export const POST = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);
  const title = requireString(payload.title, "title", { max: 300 });

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }

  const page = await createPage({
    title,
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    summary: typeof payload.summary === "string" ? payload.summary : undefined,
    body: payload.body as string | string[] | undefined,
    status: payload.status as ArticleStatus | undefined,
    layout: isPageLayout(payload.layout) ? payload.layout : undefined,
    hideTitle: typeof payload.hideTitle === "boolean" ? payload.hideTitle : undefined,
    formId: typeof payload.formId === "string" ? payload.formId : undefined,
    showInNav: typeof payload.showInNav === "boolean" ? payload.showInNav : undefined,
    showInFooter: typeof payload.showInFooter === "boolean" ? payload.showInFooter : undefined,
    order: typeof payload.order === "number" ? payload.order : undefined,
    author: typeof payload.author === "string" ? payload.author : undefined,
    seo: payload.seo
  });

  return ok(page, { status: 201 });
});
