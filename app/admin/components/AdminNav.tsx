"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavBadge = { articles?: number; resources?: number; messages?: number; leads?: number; subscribers?: number };

const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/articles", label: "Articles", badge: "articles" as const },
  { href: "/admin/resources", label: "Resources", badge: "resources" as const },
  { href: "/admin/sections", label: "Sections" },
  { href: "/admin/ticker", label: "News ticker" },
  { href: "/admin/leads", label: "Leads", badge: "leads" as const },
  { href: "/admin/subscribers", label: "Subscribers", badge: "subscribers" as const },
  { href: "/admin/messages", label: "Inbox", badge: "messages" as const },
  { href: "/admin/settings", label: "Site settings" },
  { href: "/admin/team", label: "Team" }
];

export default function AdminNav({ badges }: { badges: NavBadge }) {
  const pathname = usePathname();

  return (
    <nav className="adm-nav" data-tour="nav">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const count = link.badge ? badges[link.badge] : undefined;
        return (
          <Link key={link.href} href={link.href} className={active ? "adm-active" : undefined}>
            {link.label}
            {typeof count === "number" && count > 0 && <b>{count}</b>}
          </Link>
        );
      })}
    </nav>
  );
}
