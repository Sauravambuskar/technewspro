import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ArticleCard from "../components/ArticleCard";
import { listArticles } from "@/lib/articles";
import { listSections } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `All insights | ${settings.siteName}`,
    description: `Analysis and industry updates across every ${settings.siteName} desk.`,
    alternates: { canonical: siteUrl("/insights") }
  };
}

export default async function InsightsIndex() {
  const [{ settings, nav, menu }, sections, published] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listArticles({ status: "published" })
  ]);

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />

      <section className="page-hero">
        <p className="eyebrow">LATEST INSIGHTS</p>
        <h1>All insights.</h1>
        <p className="page-hero-lede">
          Every piece of analysis across the {sections.length} SalesInfoPro desks, newest first.
        </p>
        <div className="chip-row">
          {sections.map((section) => (
            <Link className="chip" href={`/insights/${section.id}`} key={section.id}>{section.label}</Link>
          ))}
        </div>
      </section>

      {sections.map((section) => {
        const items = published.filter((article) => article.section === section.id);
        if (items.length === 0) return null;
        return (
          <section className="reviews" id={section.id} key={section.id}>
            <div className="section-heading">
              <p>{section.eyebrow}</p>
              <h2>{section.heading}</h2>
              <Link href={`/insights/${section.id}`}>{section.cta} <span>&rarr;</span></Link>
            </div>
            <div className="review-grid">
              {items.slice(0, 3).map((article) => <ArticleCard key={article.id} article={article} showDate />)}
            </div>
          </section>
        );
      })}

      <SiteFooter nav={nav} settings={settings} />
    </main>
  );
}
