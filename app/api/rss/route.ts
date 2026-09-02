import { listArticles } from "@/lib/articles";
import { sectionLabels } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/seo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FEED_LIMIT = 30;

/** &, <, > and quotes all have meaning inside XML. */
function xml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function rfc822(date: string) {
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? new Date().toUTCString() : parsed.toUTCString();
}

export async function GET() {
  const [settings, articles, labels] = await Promise.all([
    getSettings(),
    listArticles({ status: "published", limit: FEED_LIMIT }),
    sectionLabels()
  ]);

  // Anything the author set to noindex shouldn't be syndicated either.
  const items = articles
    .filter((article) => article.seo.index)
    .map((article) => {
      const url = siteUrl(`/articles/${article.slug}`);
      return `    <item>
      <title>${xml(article.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <description>${xml(article.dek)}</description>
      <category>${xml(labels[article.section] ?? article.section)}</category>
      <dc:creator>${xml(article.author)}</dc:creator>
      <pubDate>${rfc822(article.date)}</pubDate>
    </item>`;
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(settings.siteName)}</title>
    <link>${xml(siteUrl("/"))}</link>
    <description>${xml(settings.metaDescription)}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xml(siteUrl("/api/rss"))}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(feed, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=600, s-maxage=600"
    }
  });
}
