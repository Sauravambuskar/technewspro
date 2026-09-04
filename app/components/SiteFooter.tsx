import Link from "next/link";
import type { NavItem } from "@/lib/site";
import type { Ad, Settings } from "@/lib/types";
import AdSlot from "./AdSlot";

export default function SiteFooter({
  nav,
  settings,
  pages = [],
  ad
}: {
  nav: NavItem[];
  settings: Settings;
  /** Custom pages that opted into the footer. */
  pages?: NavItem[];
  /** The live above-the-footer banner, when one is running. */
  ad?: Ad;
}) {
  return (
    <>
      <AdSlot ad={ad} />
    <footer id="about">
      <Link className="brand footer-brand" href="/">
        <img className="brand-logo" src="/logo.png" alt={settings.siteName} />
      </Link>
      <p>{settings.footerTagline}</p>
      <div className="footer-links">
        {nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        <Link href="/category">All categories</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/about">About us</Link>
        <Link href="/contact">Contact us</Link>
        <Link href="/#newsletter">Newsletter</Link>
        {pages.map((page) => <Link href={page.href} key={page.href}>{page.label}</Link>)}
      </div>
      <div className="socials">
        {settings.socials.map((social) => (
          <a key={social.id} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label}>
            {social.glyph}
          </a>
        ))}
      </div>
      <small>{settings.footerCopyright}</small>
    </footer>
    </>
  );
}
