import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ArticleCard from "../../components/ArticleCard";
import ResourceCard from "../../components/ResourceCard";
import JsonLd from "../../components/JsonLd";
import { listArticles } from "@/lib/articles";
import { listResources } from "@/lib/resources";
import { getSection, listSections } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { section: string } }): Promise<Metadata> {
  const [section, settings] = await Promise.all([getSection(params.section), getSettings()]);
  if (!section) return {};
  return {
    title: `${section.label} | ${settings.siteName}`,
    description: section.intro || `${section.eyebrow} — analysis, benchmarks and industry updates from ${settings.siteName}.`,
    alternates: { canonical: siteUrl(`/category/${section.id}`) }
  };
}

export default async function SectionPage({ params }: { params: { section: string } }) {
  const section = await getSection(params.section);
  if (!section) notFound();

  const [{ settings, nav, menu, footerPages, ads }, sections, articles, resources] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listArticles({ section: section.id, status: "published" }),
    listResources({ category: section.id, status: "published", limit: 3 })
  ]);

  // A sub-category only earns a place in the nav/internal-linking once it has
  // real content behind it, so thin, empty archive pages never get promoted.
  const liveSubcategories = [...section.subcategories]
    .sort((a, b) => a.order - b.order)
    .map((sub) => ({ ...sub, count: articles.filter((a) => a.subcategory === sub.id).length }))
    .filter((sub) => sub.count > 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Categories", item: siteUrl("/category") },
          { "@type": "ListItem", position: 3, name: section.label, item: siteUrl(`/category/${section.id}`) }
        ]
      },
      {
        "@type": "CollectionPage",
        name: section.label,
        description: section.intro || section.eyebrow,
        url: siteUrl(`/category/${section.id}`)
      }
    ]
  };

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} ad={ads.header} />
      <JsonLd data={jsonLd} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span>/</span> <Link href="/category">Categories</Link> <span>/</span>{" "}
        <b>{section.label}</b>
      </nav>

      <section className="page-hero">
        <p className="eyebrow">{section.eyebrow}</p>
        <h1>{section.label}.</h1>
        {section.intro && <p className="page-hero-lede">{section.intro}</p>}
        <p className="page-hero-lede">
          {articles.length} published {articles.length === 1 ? "analysis" : "analyses"} from this desk.
        </p>
        <div className="chip-row">
          {sections.map((other) => (
            <Link
              className={`chip${other.id === section.id ? " chip-active" : ""}`}
              href={`/category/${other.id}`}
              key={other.id}
            >
              {other.label}
            </Link>
          ))}
        </div>

        {liveSubcategories.length > 0 && (
          <div className="subcat-row">
            <p>SUB-CATEGORIES</p>
            <div className="chip-row">
              {liveSubcategories.map((sub) => (
                <Link className="chip chip-sub" href={`/category/${section.id}/${sub.id}`} key={sub.id}>
                  {sub.label}
                  <b>{sub.count}</b>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="reviews">
        {articles.length === 0 ? (
          <p className="resource-empty">Nothing published in this section yet.</p>
        ) : (
          <div className="review-grid">
            {articles.map((article) => <ArticleCard key={article.id} article={article} showDate />)}
          </div>
        )}
      </section>

      {resources.length > 0 && (
        <section className="resource-strip">
          <div className="section-heading">
            <p>RELATED RESEARCH</p>
            <h2>Go deeper.</h2>
            <Link href="/resources">Resource center <span>&rarr;</span></Link>
          </div>
          <div className="resource-grid">
            {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
          </div>
        </section>
      )}

      <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    </main>
  );
}
