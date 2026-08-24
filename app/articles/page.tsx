import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { listArticles } from "@/lib/articles";
import { listSections } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `All stories | ${settings.siteName}`,
    description: `Every briefing, feature, review and field guide from ${settings.siteName}.`
  };
}

export default async function ArticlesIndex() {
  const [{ settings, nav, menu }, sections, published] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listArticles({ status: "published" })
  ]);

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />

      <section className="quick-reads" id="top">
        <div className="section-heading">
          <p>EVERY STORY</p>
          <h2>All stories.</h2>
        </div>
      </section>

      {sections.map((section) => {
        const items = published.filter((article) => article.section === section.id);
        if (items.length === 0) return null;
        return (
          <section className="reviews" id={section.id} key={section.id}>
            <div className="section-heading"><p>SECTION</p><h2>{section.label}.</h2></div>
            <div className="review-grid">
              {items.map((article) => (
                <article className="review-card" key={article.slug}>
                  <div className="review-image"><img src={article.image} alt="" /><span>{article.tag}</span></div>
                  <h3>{article.title}</h3>
                  <p>{article.dek}</p>
                  <Link href={`/articles/${article.slug}`}>Read story <b>↗</b></Link>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      <SiteFooter nav={nav} settings={settings} />
    </main>
  );
}
