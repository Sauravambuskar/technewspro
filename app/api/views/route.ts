import { handler, ok, readJson, requireString } from "@/lib/api";
import { getArticleBySlug, recordView } from "@/lib/articles";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  const payload = await readJson<{ slug?: string }>(request);
  const slug = requireString(payload.slug, "slug", { max: 120 });

  if (!rateLimit(clientKey(request, `views:${slug}`), { limit: 3, windowMs: 60_000 }).allowed) {
    return ok({ counted: false });
  }
  if (!(await getArticleBySlug(slug))) return ok({ counted: false });

  await recordView(slug);
  return ok({ counted: true });
});
