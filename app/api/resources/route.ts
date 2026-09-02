import { fail, handler, ok, readJson, requireUser, requireString } from "@/lib/api";
import { createResource, listResources } from "@/lib/resources";
import { isResourceType, type ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const requested = params.get("status") as ArticleStatus | "all" | null;

  const { getCurrentUser } = await import("@/lib/auth");
  const signedIn = Boolean(await getCurrentUser());
  const status = signedIn && requested ? requested : "published";

  const type = params.get("type");
  const resources = await listResources({
    status,
    type: isResourceType(type) ? type : undefined,
    category: params.get("category") || undefined,
    search: params.get("q") || undefined,
    limit: params.get("limit") ? Number(params.get("limit")) : undefined
  });
  return ok(resources);
});

export const POST = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);
  const title = requireString(payload.title, "title", { max: 300 });

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }
  if (payload.type !== undefined && !isResourceType(payload.type)) {
    return fail('"type" must be whitepaper, ebook, case-study or press-release.');
  }

  const resource = await createResource({
    title,
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    type: isResourceType(payload.type) ? payload.type : undefined,
    category: typeof payload.category === "string" ? payload.category : undefined,
    summary: typeof payload.summary === "string" ? payload.summary : undefined,
    image: typeof payload.image === "string" ? payload.image : undefined,
    imageAlt: typeof payload.imageAlt === "string" ? payload.imageAlt : undefined,
    body: payload.body as string | string[] | undefined,
    highlights: payload.highlights as string | string[] | undefined,
    pages: typeof payload.pages === "number" ? payload.pages : undefined,
    fileUrl: typeof payload.fileUrl === "string" ? payload.fileUrl : undefined,
    gated: typeof payload.gated === "boolean" ? payload.gated : undefined,
    status: payload.status as ArticleStatus | undefined,
    featured: Boolean(payload.featured),
    author: typeof payload.author === "string" ? payload.author : undefined,
    date: typeof payload.date === "string" ? payload.date : undefined,
    seo: payload.seo
  });

  return ok(resource, { status: 201 });
});
