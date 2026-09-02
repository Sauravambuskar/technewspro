import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";
import ResourceBrowser from "../../components/ResourceBrowser";
import { listResources } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS, isResourceType } from "@/lib/types";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { type: string } }): Promise<Metadata> {
  if (!isResourceType(params.type)) return {};
  const settings = await getSettings();
  const label = RESOURCE_TYPE_LABELS[params.type].plural;
  return {
    title: `${label} | ${settings.siteName}`,
    description: `${label} from the ${settings.siteName} research desk.`,
    alternates: { canonical: siteUrl(`/resources/${params.type}`) }
  };
}

export default async function ResourceTypePage({ params }: { params: { type: string } }) {
  if (!isResourceType(params.type)) notFound();
  const type = params.type;

  const [{ settings, nav, menu, footerPages }, sections, resources] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listResources({ type, status: "published" })
  ]);

  const label = RESOURCE_TYPE_LABELS[type];

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span>/</span> <Link href="/resources">Resources</Link> <span>/</span>{" "}
        <b>{label.plural}</b>
      </nav>

      <section className="page-hero">
        <p className="eyebrow">RESOURCE CENTER</p>
        <h1>{label.plural}.</h1>
        <p className="page-hero-lede">
          {resources.length} published {resources.length === 1 ? label.singular.toLowerCase() : label.plural.toLowerCase()} from the {settings.siteName} research desk.
        </p>
        <div className="chip-row">
          {RESOURCE_TYPES.map((other) => (
            <Link
              className={`chip${other === type ? " chip-active" : ""}`}
              href={`/resources/${other}`}
              key={other}
            >
              {RESOURCE_TYPE_LABELS[other].plural}
            </Link>
          ))}
        </div>
      </section>

      <section className="resource-listing">
        <ResourceBrowser resources={resources} sections={sections} lockedType={type} />
      </section>

      <SiteFooter nav={nav} settings={settings} pages={footerPages} />
    </main>
  );
}
