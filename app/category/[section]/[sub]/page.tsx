import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import ArticleCard from "../../../components/ArticleCard";
import JsonLd from "../../../components/JsonLd";
import { listArticles } from "@/lib/articles";
import { getSection, getSubcategory } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = { params: { section: string; sub: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const [section, sub, settings] = await Promise.all([
    getSection(params.section),
    getSubcategory(params.section, params.sub),
    getSettings()
  ]);
  if (!section || !sub) return {};

  const articleCount = (await listArticles({ section: section.id, subcategory: sub.id, status: "published" })).length;

  return {
    title: `${sub.label} | ${section.label} | ${settings.siteName}`,
    description: sub.intro || `${sub.label} coverage from the ${section.label} desk at ${settings.siteName}.`,
    alternates: { canonical: siteUrl(`/category/${section.id}/${sub.id}`) },
    // A sub-category with no published articles yet isn't indexable content —
    // keep the page reachable for editors without offering it to search engines.
    robots: articleCount === 0 ? { index: false, follow: false } : undefined
  };
}

export default async function SubcategoryPage({ params }: Params) {
  const [section, sub] = await Promise.all([
    getSection(params.section),
    getSubcategory(params.section, params.sub)
  ]);
  if (!section || !sub) notFound();

  const [{ settings, nav, menu, footerPages, ads }, articles] = await Promise.all([
    getSiteChrome(),
    listArticles({ section: section.id, subcategory: sub.id, status: "published" })
  ]);

  const siblings = [...section.subcategories].sort((a, b) => a.order - b.order);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
          { "@type": "ListItem", position: 2, name: "Categories", item: siteUrl("/category") },
          { "@type": "ListItem", position: 3, name: section.label, item: siteUrl(`/category/${section.id}`) },
          { "@type": "ListItem", position: 4, name: sub.label, item: siteUrl(`/category/${section.id}/${sub.id}`) }
        ]
      },
      {
        "@type": "CollectionPage",
        name: `${sub.label} | ${section.label}`,
        description: sub.intro || section.intro,
        url: siteUrl(`/category/${section.id}/${sub.id}`)
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
        <Link href={`/category/${section.id}`}>{section.label}</Link> <span>/</span> <b>{sub.label}</b>
      </nav>

      <section className="page-hero">
        <p className="eyebrow">{section.label.toUpperCase()}</p>
        <h1>{sub.label}.</h1>
        {sub.intro && <p className="page-hero-lede">{sub.intro}</p>}
        <p className="page-hero-lede">
          {articles.length === 0
            ? `Nothing published under ${sub.label} yet.`
            : `${articles.length} published ${articles.length === 1 ? "analysis" : "analyses"} in this sub-category.`}
        </p>
        <div className="chip-row">
          {siblings.map((other) => (
            <Link
              className={`chip${other.id === sub.id ? " chip-active" : ""}`}
              href={`/category/${section.id}/${other.id}`}
              key={other.id}
            >
              {other.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="reviews">
        {articles.length === 0 ? (
          <p className="resource-empty">
            No articles here yet. <Link href={`/category/${section.id}`}>Browse all {section.label}</Link>.
          </p>
        ) : (
          <div className="review-grid">
            {articles.map((article) => <ArticleCard key={article.id} article={article} showDate />)}
          </div>
        )}
      </section>

      <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    </main>
  );
}
