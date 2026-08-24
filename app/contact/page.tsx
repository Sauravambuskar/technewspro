import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import ContactForm from "../components/ContactForm";
import { getSettings } from "@/lib/settings";
import { getSiteChrome } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Contact | ${settings.siteName}`,
    description: `Story tips, corrections and press enquiries for ${settings.siteName}.`
  };
}

export default async function ContactPage() {
  const { settings, nav, menu } = await getSiteChrome();

  return (
    <main>
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} />

      <section className="contact-page">
        <div className="contact-intro">
          <p className="eyebrow">GET IN TOUCH</p>
          <h1>Tell us<br /><em>what&rsquo;s next.</em></h1>
          <p>
            Story tips, corrections, press enquiries or a note about something we got wrong &mdash; it all
            reaches the same inbox, and a person reads every one.
          </p>
        </div>
        <ContactForm />
      </section>

      <SiteFooter nav={nav} settings={settings} />
    </main>
  );
}
