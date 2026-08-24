import Link from "next/link";
import type { NavItem } from "@/lib/site";
import type { Settings } from "@/lib/types";

export default function SiteFooter({ nav, settings }: { nav: NavItem[]; settings: Settings }) {
  return (
    <footer id="about">
      <Link className="brand footer-brand" href="/">
        <span className="brand-mark">T.</span>
        <span>tech<span>news</span><b>info</b>pro</span>
      </Link>
      <p>{settings.footerTagline}</p>
      <div className="footer-links">
        {nav.map((item) => <Link href={item.href} key={item.href}>{item.label}</Link>)}
        <Link href="/articles">All stories</Link>
        <Link href="/#newsletter">Newsletter</Link>
        <Link href="/contact">Contact</Link>
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
