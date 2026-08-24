import Link from "next/link";
import type { NavItem } from "@/lib/site";
import type { Settings } from "@/lib/types";

export default function SiteFooter({ nav, settings }: { nav: NavItem[]; settings: Settings }) {
  return (
    <footer id="about">
      <Link className="brand footer-brand" href="/">
        <span className="brand-mark">S.</span>
        <span>sales<b>info</b>pro</span>
      </Link>
      <p>{settings.footerTagline}</p>
      <div className="footer-links">
        {nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        <Link href="/insights">All insights</Link>
        <Link href="/resources">Resources</Link>
        <Link href="/about">About us</Link>
        <Link href="/contact">Contact us</Link>
        <Link href="/#newsletter">Newsletter</Link>
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
  );
}
