import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, usingDefaultPassword } from "@/lib/auth";
import { allArticles } from "@/lib/articles";
import { listMessages } from "@/lib/messages";
import { listSubscribers } from "@/lib/subscribers";
import AdminNav from "../components/AdminNav";
import SignOutButton from "../components/SignOutButton";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const [articles, messages, subscribers, insecure] = await Promise.all([
    allArticles(),
    listMessages(),
    listSubscribers(),
    usingDefaultPassword()
  ]);

  return (
    <div className="adm-shell">
      <aside className="adm-sidebar">
        <div className="adm-logo">
          <i>T.</i>
          <span>
            TechNewsInfoPro
            <small>NEWSROOM</small>
          </span>
        </div>

        <AdminNav
          badges={{
            articles: articles.filter((a) => a.status === "draft").length,
            messages: messages.filter((m) => !m.read).length,
            subscribers: subscribers.filter((s) => s.status === "subscribed").length
          }}
        />

        <div className="adm-sidebar-foot">
          <strong>{user.name}</strong>
          {user.email} · {user.role}
          <br />
          <Link href="/" target="_blank" rel="noreferrer">View the live site ↗</Link>
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
        {children}
      </main>
    </div>
  );
}
