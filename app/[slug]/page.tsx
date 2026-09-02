import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import JsonLd from "../components/JsonLd";
import ViewBeacon from "../components/ViewBeacon";
import { getPageBySlug } from "@/lib/pages";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { buildMetadata, siteUrl } from "@/lib/seo";
import { formatDate } from "@/lib/types";

export const dynamic = "force-dynamic";

// Custom pages live at the site root. Next matches the static routes
// (/about, /category, /resources, …) before this one, so it only ever sees
// paths the app doesn't already own.

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [page, settings] = await Promise.all([getPageBySlug(params.slug), getSettings()]);
  if (!page) return {};

  return buildMetadata(page.seo, {
    title: page.title,
    description: page.summary || page.body[0] || page.title,
    path: `/${page.slug}`,
    siteName: settings.siteName
  });
}

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const page = await getPageBySlug(params.slug);
  if (!page) notFound();

  const { settings, nav, menu, footerPages } = await getSiteChrome();

  // Canvas is a deliberately blank page: no header, footer or breadcrumb.
  const canvas = page.layout === "canvas";
  const fullWidth = page.layout === "full-width";

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: page.title,
          description: page.summary || undefined,
          url: siteUrl(`/${page.slug}`),
          dateModified: page.updatedAt,
          publisher: { "@type": "Organization", name: settings.siteName }
        }}
      />

      {!canvas && (
        <>
          <div className="topline" />
          <SiteHeader menu={menu} siteName={settings.siteName} />
        </>
      )}

      <ViewBeacon slug={page.slug} kind="page" />

      {!canvas && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link> <span>/</span> <b>{page.title}</b>
        </nav>
      )}

      <article className={`article-page${canvas || fullWidth ? " page-wide" : ""}`}>
        {!page.hideTitle && (
          <div className="article-head">
            <h1>{page.title}</h1>
            {page.summary && <p className="article-dek">{page.summary}</p>}
            {!canvas && (
              <div className="article-meta">
                <span>Last updated {formatDate(page.updatedAt.slice(0, 10))}</span>
              </div>
            )}
          </div>
        )}

        <div className="article-body">
          {page.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>

        {!canvas && (
          <div className="article-back">
            <Link href="/">&larr; Back to the homepage</Link>
          </div>
        )}
      </article>

      {!canvas && <SiteFooter nav={nav} settings={settings} pages={footerPages} />}
    </main>
  );
}
