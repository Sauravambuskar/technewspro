import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../../../components/SiteHeader";
import SiteFooter from "../../../components/SiteFooter";
import LeadCaptureForm from "../../../components/LeadCaptureForm";
import ResourceCard from "../../../components/ResourceCard";
import JsonLd from "../../../components/JsonLd";
import ViewBeacon from "../../../components/ViewBeacon";
import { getResourceBySlug, listResources } from "@/lib/resources";
import { sectionLabels } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { RESOURCE_TYPE_LABELS, formatDate, isResourceType } from "@/lib/types";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Params = { params: { type: string; slug: string } };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const [resource, settings] = await Promise.all([getResourceBySlug(params.slug), getSettings()]);
  if (!resource) return {};
  return {
    title: `${resource.title} | ${settings.siteName}`,
    description: resource.summary,
    alternates: { canonical: siteUrl(`/resources/${resource.type}/${resource.slug}`) },
    openGraph: {
      title: resource.title,
      description: resource.summary,
      images: resource.image ? [resource.image] : undefined,
      type: "article",
      publishedTime: resource.date
    }
  };
}

export default async function ResourceDetail({ params }: Params) {
  if (!isResourceType(params.type)) notFound();

  const resource = await getResourceBySlug(params.slug);
  if (!resource) notFound();
  // Keep one canonical URL per resource even if the type in the path is stale.
  if (resource.type !== params.type) redirect(`/resources/${resource.type}/${resource.slug}`);

  const [{ settings, nav, menu }, labels, related] = await Promise.all([
    getSiteChrome(),
    sectionLabels(),
    listResources({ type: resource.type, status: "published", limit: 4 })
  ]);

  const label = RESOURCE_TYPE_LABELS[resource.type];
  const categoryLabel = labels[resource.category] ?? resource.category;
  const others = related.filter((r) => r.id !== resource.id).slice(0, 3);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": resource.type === "press-release" ? "NewsArticle" : "Report",
          headline: resource.title,
          description: resource.summary,
          datePublished: resource.date,
          author: { "@type": "Organization", name: resource.author },
          publisher: { "@type": "Organization", name: settings.siteName },
          image: resource.image || undefined,
          isAccessibleForFree: !resource.gated,
          url: siteUrl(`/resources/${resource.type}/${resource.slug}`)
        }}
      />

      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />
      <ViewBeacon slug={resource.slug} kind="resource" />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span>/</span> <Link href="/resources">Resources</Link> <span>/</span>{" "}
        <Link href={`/resources/${resource.type}`}>{label.plural}</Link> <span>/</span> <b>{resource.title}</b>
      </nav>

      <article className="resource-detail">
        <div className="resource-detail-main">
          <p className="eyebrow">
            <Link href={`/resources/${resource.type}`}>{label.singular}</Link> /{" "}
            <Link href={`/category/${resource.category}`}>{categoryLabel}</Link>
          </p>
          <h1>{resource.title}</h1>
          <p className="article-dek">{resource.summary}</p>

          <div className="article-meta">
            <span>{formatDate(resource.date)}</span><i />
            {resource.pages > 0 && <><span>{resource.pages} pages</span><i /></>}
            <span>{resource.author}</span>
          </div>

          {resource.image && (
            <div className="article-hero-image">
              <img src={resource.image} alt="" />
            </div>
          )}

          {resource.highlights.length > 0 && (
            <div className="resource-highlights">
              <h2>What&rsquo;s inside</h2>
              <ul>
                {resource.highlights.map((point) => <li key={point}>{point}</li>)}
              </ul>
            </div>
          )}

          <div className="article-body">
            {resource.body.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          </div>
        </div>

        <aside className="resource-detail-aside">
          <div className="resource-gate">
            <p className="eyebrow">{resource.gated ? "DOWNLOAD" : "FREE ACCESS"}</p>
            <h2>{resource.gated ? `Get the ${label.singular.toLowerCase()}` : "No form required"}</h2>

            {resource.gated ? (
              <>
                <p className="resource-gate-note">
                  Tell us where to send it. One form, and you&rsquo;ll have the full {resource.pages > 0 ? `${resource.pages}-page ` : ""}
                  {label.singular.toLowerCase()}.
                </p>
                <LeadCaptureForm
                  intent="download"
                  resourceId={resource.id}
                  submitLabel={`Get the ${label.singular.toLowerCase()}`}
                  fallbackHref="#top"
                />
              </>
            ) : (
              <>
                <p className="resource-gate-note">
                  This {label.singular.toLowerCase()} is open access — the full text is on this page.
                </p>
                {resource.fileUrl && (
                  <a className="lead-download" href={resource.fileUrl} target="_blank" rel="noreferrer">
                    Download the PDF <span>&#8599;</span>
                  </a>
                )}
                <Link className="btn-secondary" href="/resources">Browse more research</Link>
              </>
            )}
          </div>
        </aside>
      </article>

      {others.length > 0 && (
        <section className="resource-strip">
          <div className="section-heading">
            <p>MORE {label.plural.toUpperCase()}</p>
            <h2>Keep reading.</h2>
            <Link href={`/resources/${resource.type}`}>View all <span>&rarr;</span></Link>
          </div>
          <div className="resource-grid">
            {others.map((item) => <ResourceCard key={item.id} resource={item} />)}
          </div>
        </section>
      )}

      <SiteFooter nav={nav} settings={settings} />
    </main>
  );
}
