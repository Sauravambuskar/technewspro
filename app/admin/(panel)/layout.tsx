import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, usingDefaultPassword } from "@/lib/auth";
import { allArticles } from "@/lib/articles";
import { listLeads } from "@/lib/leads";
import { listMessages } from "@/lib/messages";
import { allForms } from "@/lib/forms";
import { allPages } from "@/lib/pages";
import { allResources } from "@/lib/resources";
import { listSubscribers } from "@/lib/subscribers";
import AdminNav from "../components/AdminNav";
import HelpTour from "../components/HelpTour";
import SignOutButton from "../components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const [articles, resources, pages, forms, messages, leads, subscribers, insecure] = await Promise.all([
    allArticles(),
    allResources(),
    allPages(),
    allForms(),
    listMessages(),
    listLeads(),
    listSubscribers(),
    usingDefaultPassword()
  ]);

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <img src="/logo.png" alt="Tech News Pro" />
          <span>
            <small>CONTROL PANEL</small>
          </span>
        </div>

        <AdminNav
          badges={{
            articles: articles.filter((a) => a.status === "draft").length,
            resources: resources.filter((r) => r.status === "draft").length,
            pages: pages.filter((p) => p.status === "draft").length,
            forms: forms.filter((f) => f.status === "draft").length,
            messages: messages.filter((m) => !m.read).length,
            leads: leads.length,
            subscribers: subscribers.filter((s) => s.status === "subscribed").length
          }}
        />

        <div className="adm-sidebar-foot" data-tour="account">
          <strong>{user.name}</strong>
          {user.email} · {user.role}
          <br />
          <Link href="/" target="_blank" rel="noreferrer" data-tour="view-site">View the live site ↗</Link>
          <SignOutButton />
        </div>
      </aside>

      <main className="adm-main">
        {insecure && (
          <p className="adm-note adm-note-warn">
            This account still uses the default password. Change it under{" "}
            <Link href="/admin/team">Team</Link> before putting the site online.
          </p>
        )}
        <div data-tour="page-body">{children}</div>
      </main>

      <HelpTour />
    </div>
  );
}
