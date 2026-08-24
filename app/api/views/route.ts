import { handler, ok, readJson, requireString } from "@/lib/api";
import { getArticleBySlug, recordView } from "@/lib/articles";
import { getResourceBySlug, recordResourceView } from "@/lib/resources";
import { clientKey, rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  const payload = await readJson<{ slug?: string; kind?: string }>(request);
  const slug = requireString(payload.slug, "slug", { max: 120 });
  const kind = payload.kind === "resource" ? "resource" : "article";

  if (!rateLimit(clientKey(request, `views:${kind}:${slug}`), { limit: 3, windowMs: 60_000 }).allowed) {
    return ok({ counted: false });
  }

  if (kind === "resource") {
    if (!(await getResourceBySlug(slug))) return ok({ counted: false });
    await recordResourceView(slug);
  } else {
    if (!(await getArticleBySlug(slug))) return ok({ counted: false });
    await recordView(slug);
  }

  return ok({ counted: true });
});
