import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ArticleRow from "../components/ArticleRow";
import ResourceCard from "../components/ResourceCard";
import { listArticles } from "@/lib/articles";
import { sectionLabels } from "@/lib/sections";
import { listPages } from "@/lib/pages";
import { listResources } from "@/lib/resources";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const settings = await getSettings();
  const query = searchParams.q?.trim() ?? "";

  return {
    title: query ? `Search: ${query} | ${settings.siteName}` : `Search | ${settings.siteName}`,
    description: `Search articles, research and pages across ${settings.siteName}.`,
    alternates: { canonical: siteUrl("/search") },
    // Search result pages are thin and endless — never worth indexing.
    robots: { index: false, follow: true }
  };
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const query = searchParams.q?.trim() ?? "";

  const [{ settings, nav, menu, footerPages, ads }, articles, resources, pages, labels] = await Promise.all([
    getSiteChrome(),
    query ? listArticles({ search: query, status: "published" }) : Promise.resolve([]),
    query ? listResources({ search: query, status: "published" }) : Promise.resolve([]),
    query ? listPages("published") : Promise.resolve([]),
    sectionLabels()
  ]);

  // Pages have no search in their repository, so match them here.
  const term = query.toLowerCase();
  const matchedPages = pages.filter((page) =>
    [page.title, page.summary, page.body.join(" ")].some((field) => field.toLowerCase().includes(term))
  );

  const total = articles.length + resources.length + matchedPages.length;

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} ad={ads.header} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span>/</span> <b>Search</b>
      </nav>

      <section className="page-hero">
        <p className="eyebrow">SEARCH</p>
        <h1>{query ? `“${query}”` : "Search."}</h1>
        <p className="page-hero-lede">
          {!query
            ? "Type a word or two below to search every article, resource and page."
            : total === 0
              ? `Nothing matches “${query}”. Try a broader word, or browse the categories.`
              : `${total} result${total === 1 ? "" : "s"} across articles, research and pages.`}
        </p>

        <form className="search-page-form" action="/search" method="get" role="search">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search insights, research and resources…"
            aria-label="Search the site"
          />
          <button type="submit">Search</button>
        </form>
      </section>

      {articles.length > 0 && (
        <section className="reviews">
          <div className="section-heading">
            <p>ARTICLES</p>
            <h2>{articles.length} {articles.length === 1 ? "story" : "stories"}.</h2>
          </div>
          <div className="article-list">
            {articles.map((article) => (
              <ArticleRow key={article.id} article={article} sectionLabel={labels[article.section]} />
            ))}
          </div>
        </section>
      )}

      {resources.length > 0 && (
        <section className="resource-strip">
          <div className="section-heading">
            <p>RESEARCH</p>
            <h2>{resources.length} {resources.length === 1 ? "resource" : "resources"}.</h2>
            <Link href="/resources">Resource center <span>&rarr;</span></Link>
          </div>
          <div className="resource-grid">
            {resources.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
          </div>
        </section>
      )}

      {matchedPages.length > 0 && (
        <section className="reviews">
          <div className="section-heading">
            <p>PAGES</p>
            <h2>{matchedPages.length} {matchedPages.length === 1 ? "page" : "pages"}.</h2>
          </div>
          <div className="search-page-list">
            {matchedPages.map((page) => (
              <Link href={`/${page.slug}`} key={page.id}>
                <b>{page.title}</b>
                {page.summary && <span>{page.summary}</span>}
              </Link>
            ))}
          </div>
        </section>
      )}

      {query && total === 0 && (
        <section className="reviews">
          <p className="resource-empty">
            No matches. <Link href="/category">Browse the categories</Link> or{" "}
            <Link href="/resources">the resource centre</Link> instead.
          </p>
        </section>
      )}

      <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    </main>
  );
}
