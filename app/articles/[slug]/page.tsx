import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ViewBeacon from "../../components/ViewBeacon";
import { getArticleBySlug, listArticles } from "@/lib/articles";
import { sectionLabels } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { formatDate } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [article, settings] = await Promise.all([getArticleBySlug(params.slug), getSettings()]);
  if (!article) return {};
  return {
    title: `${article.title} | ${settings.siteName}`,
    description: article.dek,
    openGraph: {
      title: article.title,
      description: article.dek,
      images: article.image ? [article.image] : undefined,
      type: "article",
      publishedTime: article.date
    }
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) notFound();

  const [{ settings, nav, menu }, labels, sectionArticles] = await Promise.all([
    getSiteChrome(),
    sectionLabels(),
    listArticles({ section: article.section, status: "published" })
  ]);

  const label = labels[article.section] ?? article.section;
  const related = sectionArticles.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />
      <ViewBeacon slug={article.slug} />

      <article className="article-page">
        <div className="article-head">
          <p className="eyebrow"><Link href={`/#${article.section}`}>{label}</Link> / {article.tag}</p>
          <h1>{article.title}</h1>
          <p className="article-dek">{article.dek}</p>
          <div className="article-meta">
            <span>{formatDate(article.date)}</span><i />
            <span>{article.minutes} min read</span><i />
            <span>{article.author}</span>
          </div>
        </div>

        {article.image && <div className="article-hero-image"><img src={article.image} alt="" /></div>}

        <div className="article-body">
          {article.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
        </div>

        <div className="article-back">
          <Link href="/articles">&larr; Back to all stories</Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="reviews" aria-label="Related stories">
          <div className="section-heading">
            <p>KEEP READING</p>
            <h2>More {label}.</h2>
            <Link href="/articles">View all stories <span>&rarr;</span></Link>
          </div>
          <div className="review-grid">
            {related.map((r) => (
              <article className="review-card" key={r.slug}>
                <div className="review-image"><img src={r.image} alt="" /><span>{r.tag}</span></div>
                <h3>{r.title}</h3>
                <p>{r.dek}</p>
                <Link href={`/articles/${r.slug}`}>Read story <b>&#8599;</b></Link>
              </article>
            ))}
          </div>
        </section>
      )}

      <SiteFooter nav={nav} settings={settings} />
    </main>
  );
}
