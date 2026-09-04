import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ContactForm from "../components/ContactForm";
import JsonLd from "../components/JsonLd";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Contact us | ${settings.siteName}`,
    description: settings.contactBlurb,
    alternates: { canonical: siteUrl("/contact") }
  };
}

export default async function ContactPage() {
  const { settings, nav, menu, footerPages, ads } = await getSiteChrome();

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: siteUrl("/contact"),
          name: `Contact ${settings.siteName}`,
          description: settings.contactBlurb
        }}
      />

      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} ad={ads.header} />

      <section className="contact-page">
        <div className="contact-intro">
          <p className="eyebrow">{settings.contactEyebrow}</p>
          <h1>{settings.contactTitle}</h1>
          <p>{settings.contactBlurb}</p>

          <dl className="lead-details">
            <div>
              <dt>Email</dt>
              <dd><a href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href={`tel:${settings.contactPhone.replace(/[^+\d]/g, "")}`}>{settings.contactPhone}</a>
              </dd>
            </div>
            <div>
              <dt>Office</dt>
              <dd>{settings.contactAddress}</dd>
            </div>
          </dl>
        </div>

        <ContactForm />
      </section>

      <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    </main>
  );
}
