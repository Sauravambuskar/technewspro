import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import WriteForUsForm from "../components/WriteForUsForm";
import JsonLd from "../components/JsonLd";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Write for us | ${settings.siteName}`,
    description: `Pitch a story to ${settings.siteName} and write for our readers.`,
    alternates: { canonical: siteUrl("/write-for-us") }
  };
}

export default async function WriteForUsPage() {
  const { settings, nav, menu, footerPages, ads } = await getSiteChrome();

  return (
    <main>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: siteUrl("/write-for-us"),
          name: `Write for ${settings.siteName}`,
          description: `Pitch a story to ${settings.siteName}.`
        }}
      />

      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} ad={ads.header} />

      <section className="contact-page">
        <div className="contact-intro">
          <p className="eyebrow">Contribute</p>
          <h1>Write for us</h1>
          <p>
            Got a story, an angle, or expertise our readers would value? Send us your pitch —
            topic, why it fits, and a sample of your writing — and our editors will get back to you.
          </p>
        </div>

        <WriteForUsForm />
      </section>

      <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    </main>
  );
}
