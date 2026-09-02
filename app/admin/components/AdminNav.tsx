"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavBadge = { articles?: number; resources?: number; messages?: number; leads?: number; subscribers?: number };

// `tour` is the data-tour hook the guided walkthrough targets for each link.
const LINKS = [
  { href: "/admin", label: "Dashboard", exact: true, tour: "dashboard" },
  { href: "/admin/articles", label: "Articles", badge: "articles" as const, tour: "articles" },
  { href: "/admin/resources", label: "Resources", badge: "resources" as const, tour: "resources" },
  { href: "/admin/sections", label: "Sections", tour: "sections" },
  { href: "/admin/ticker", label: "News ticker", tour: "ticker" },
  { href: "/admin/leads", label: "Leads", badge: "leads" as const, tour: "leads" },
  { href: "/admin/subscribers", label: "Subscribers", badge: "subscribers" as const, tour: "subscribers" },
  { href: "/admin/messages", label: "Inbox", badge: "messages" as const, tour: "messages" },
  { href: "/admin/settings", label: "Site settings", tour: "settings" },
  { href: "/admin/team", label: "Team", tour: "team" }
];

export default function AdminNav({ badges }: { badges: NavBadge }) {
  const pathname = usePathname();

  return (
    <nav className="adm-nav" data-tour="nav">
      {LINKS.map((link) => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        const count = link.badge ? badges[link.badge] : undefined;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={active ? "adm-active" : undefined}
            data-tour={`nav-${link.tour}`}
          >
            {link.label}
            {typeof count === "number" && count > 0 && <b>{count}</b>}
          </Link>
        );
      })}
    </nav>
  );
}
