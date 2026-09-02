import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ViewBeacon from "../../components/ViewBeacon";
import { getArticleBySlug, listArticles } from "@/lib/articles";
import { getSubcategory, sectionLabels } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { formatDate } from "@/lib/types";
import { buildMetadata, siteUrl } from "@/lib/seo";
import JsonLd from "../../components/JsonLd";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [article, settings] = await Promise.all([getArticleBySlug(params.slug), getSettings()]);
  if (!article) return {};

  return buildMetadata(
    article.seo,
    {
      title: article.title,
      description: article.dek,
      image: article.image,
      path: `/articles/${article.slug}`,
      siteName: settings.siteName
    },
    { openGraph: { type: "article", publishedTime: article.date } }
  );
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const [{ settings, nav, menu, footerPages }, labels, sectionArticles, subcategory] = await Promise.all([
    getSiteChrome(),
    sectionLabels(),
    listArticles({ section: article.section, status: "published" }),
    article.subcategory ? getSubcategory(article.section, article.subcategory) : Promise.resolve(undefined)
  ]);

  const label = labels[article.section] ?? article.section;
  const related = sectionArticles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: article.title,
          description: article.dek,
          datePublished: article.date,
          dateModified: article.updatedAt,
          author: { "@type": "Organization", name: article.author },
          publisher: { "@type": "Organization", name: settings.siteName },
          image: article.image || undefined,
          articleSection: label,
          keywords: article.tags.length ? article.tags.join(", ") : undefined,
          url: siteUrl(`/articles/${article.slug}`)
        }}
      />

      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />
      <ViewBeacon slug={article.slug} />

      <article className="article-page">
        <div className="article-head">
          <p className="eyebrow">
            <Link href={`/category/${article.section}`}>{label}</Link>
            {subcategory && (
              <> / <Link href={`/category/${article.section}/${subcategory.id}`}>{subcategory.label}</Link></>
            )}
            {" "}/ {article.tag}
          </p>
          <h1>{article.title}</h1>
          <p className="article-dek">{article.dek}</p>
          <div className="article-meta">
            <span>{formatDate(article.date)}</span><i />
            <span>{article.minutes} min read</span><i />
            <span>{article.author}</span>
          </div>
        </div>

        {article.image && <div className="article-hero-image"><img src={article.image} alt={article.imageAlt} /></div>}

        <div className="article-body">
          {article.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>

        {article.tags.length > 0 && (
          <div className="chip-row" aria-label="Tags">
            {article.tags.map((tag) => (
              <span className="chip chip-sub" key={tag}>{tag}</span>
            ))}
          </div>
        )}

        <div className="article-back">
          <Link href="/category">&larr; Back to all categories</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="reviews" aria-label="Related stories">
          <div className="section-heading">
            <p>KEEP READING</p>
            <h2>More {label}.</h2>
            <Link href={`/category/${article.section}`}>View all <span>&rarr;</span></Link>
          </div>
          <div className="review-grid">
            {related.map((r) => (
              <article className="review-card" key={r.slug}>
                <div className="review-image"><img src={r.image} alt={r.imageAlt} /><span>{r.tag}</span></div>
                <h3>{r.title}</h3>
                <p>{r.dek}</p>
                <Link href={`/articles/${r.slug}`}>Read story <b>&#8599;</b></Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <SiteFooter nav={nav} settings={settings} pages={footerPages} />
    </main>
  );
}
