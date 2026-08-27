import Link from "next/link";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import JsonLd from "../components/JsonLd";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { listSections } from "@/lib/sections";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `About us | ${settings.siteName}`,
    description: settings.aboutOverview.slice(0, 160),
    alternates: { canonical: siteUrl("/about") }
  };
}

export default async function AboutPage() {
  const [{ settings, nav, menu }, sections] = await Promise.all([getSiteChrome(), listSections()]);

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          name: `About ${settings.siteName}`,
          url: siteUrl("/about"),
          description: settings.aboutOverview
        }}
      />

      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />

      <section className="page-hero">
        <p className="eyebrow">ABOUT US</p>
        <h1>Intelligence for the people<br /><em>who sign the decision.</em></h1>
        <p className="page-hero-lede">{settings.aboutOverview}</p>
      </section>

      <section className="about-split">
        <div className="about-block">
          <p className="eyebrow">OUR MISSION</p>
          <h2>Mission</h2>
          <p>{settings.aboutMission}</p>
        </div>
        <div className="about-block">
          <p className="eyebrow">OUR VISION</p>
          <h2>Vision</h2>
          <p>{settings.aboutVision}</p>
        </div>
      </section>

      <section className="about-focus">
        <div className="section-heading"><p>EDITORIAL FOCUS</p><h2>How we work.</h2></div>
        <p className="about-focus-body">{settings.aboutEditorialFocus}</p>

        <div className="about-desks">
          {sections.map((section) => (
            <Link className="about-desk" href={`/category/${section.id}`} key={section.id}>
              <h3>{section.label}</h3>
              <p>{section.eyebrow}</p>
              <span>View coverage &#8599;</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="about-industries">
        <div className="section-heading"><p>INDUSTRIES COVERED</p><h2>Where our readers work.</h2></div>
        <ul className="industry-list">
          {settings.aboutIndustries.map((industry) => <li key={industry}>{industry}</li>)}
        </ul>
      </section>

      <section className="why" id="why">
        <div className="why-intro">
          <p className="eyebrow">{settings.whyEyebrow}</p>
          <h2>Why choose<br /><em>{settings.siteName}.</em></h2>
          <p>{settings.whyBlurb}</p>
          <Link href="/contact" className="read-link">Talk to the team <span>&rarr;</span></Link>
        </div>
        <div className="why-grid">
          {settings.whyPoints.map((point, i) => (
            <div className="why-card" key={point.id}>
              <span>0{i + 1}</span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter nav={nav} settings={settings} />
    </main>
  );
}
