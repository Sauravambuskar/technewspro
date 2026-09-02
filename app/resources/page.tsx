import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ResourceBrowser from "../components/ResourceBrowser";
import { listResources } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "@/lib/types";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Resource center | ${settings.siteName}`,
    description: settings.resourcesBlurb,
    alternates: { canonical: siteUrl("/resources") }
  };
}

export default async function ResourceCenter() {
  const [{ settings, nav, menu, footerPages }, sections, resources] = await Promise.all([
    getSiteChrome(),
    listSections(),
    listResources({ status: "published" })
  ]);

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />

      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> <span>/</span> <b>Resources</b>
      </nav>

      <section className="page-hero">
        <p className="eyebrow">{settings.resourcesEyebrow}</p>
        <h1>{settings.resourcesTitle}</h1>
        <p className="page-hero-lede">{settings.resourcesBlurb}</p>
        <div className="chip-row">
          {RESOURCE_TYPES.map((type) => {
            const count = resources.filter((r) => r.type === type).length;
            return (
              <Link className="chip" href={`/resources/${type}`} key={type}>
                {RESOURCE_TYPE_LABELS[type].plural} <b>{count}</b>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="resource-listing">
        <ResourceBrowser resources={resources} sections={sections} />
      </section>

      <SiteFooter nav={nav} settings={settings} pages={footerPages} />
    </main>
  );
}
