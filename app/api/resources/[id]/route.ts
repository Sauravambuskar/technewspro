import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deleteResource, getResourceById, updateResource } from "@/lib/resources";
import { isResourceType, type ArticleStatus } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const GET = handler(async (_request: Request, { params }: Ctx) => {
  const resource = await getResourceById(params.id);
  if (!resource) return fail("Resource not found.", 404);
  if (resource.status !== "published") await requireUser();
  return ok(resource);
});

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);

  if (payload.status && payload.status !== "draft" && payload.status !== "published") {
    return fail('"status" must be either "draft" or "published".');
  }
  if (payload.type !== undefined && !isResourceType(payload.type)) {
    return fail('"type" must be whitepaper, ebook, case-study or press-release.');
  }

  const resource = await updateResource(params.id, {
    title: typeof payload.title === "string" ? payload.title : undefined,
    slug: typeof payload.slug === "string" ? payload.slug : undefined,
    type: isResourceType(payload.type) ? payload.type : undefined,
    category: typeof payload.category === "string" ? payload.category : undefined,
    summary: typeof payload.summary === "string" ? payload.summary : undefined,
    image: typeof payload.image === "string" ? payload.image : undefined,
    body: payload.body as string | string[] | undefined,
    highlights: payload.highlights as string | string[] | undefined,
    pages: typeof payload.pages === "number" ? payload.pages : undefined,
    fileUrl: typeof payload.fileUrl === "string" ? payload.fileUrl : undefined,
    gated: typeof payload.gated === "boolean" ? payload.gated : undefined,
    status: payload.status as ArticleStatus | undefined,
    featured: typeof payload.featured === "boolean" ? payload.featured : undefined,
    author: typeof payload.author === "string" ? payload.author : undefined,
    date: typeof payload.date === "string" ? payload.date : undefined
  });

  if (!resource) return fail("Resource not found.", 404);
  return ok(resource);
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deleteResource(params.id);
  if (!removed) return fail("Resource not found.", 404);
  return ok({ id: params.id, deleted: true });
});
