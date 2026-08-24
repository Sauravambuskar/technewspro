import Link from "next/link";
import { allArticles } from "@/lib/articles";
import { listMessages } from "@/lib/messages";
import { listSections } from "@/lib/sections";
import { listSubscribers } from "@/lib/subscribers";
import { listTicker } from "@/lib/ticker";
import { formatDate } from "@/lib/types";
import PageHead from "../components/PageHead";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [articles, subscribers, messages, sections, ticker] = await Promise.all([
    allArticles(),
    listSubscribers(),
    listMessages(),
    listSections(),
    listTicker()
  ]);

  const published = articles.filter((a) => a.status === "published");
  const drafts = articles.filter((a) => a.status === "draft");
  const views = articles.reduce((sum, a) => sum + a.views, 0);
  const activeSubscribers = subscribers.filter((s) => s.status === "subscribed");
  const unread = messages.filter((m) => !m.read);
  const topRead = [...published].sort((a, b) => b.views - a.views).slice(0, 5);
  const labels = new Map(sections.map((s) => [s.id, s.label]));

  return (
    <>
      <PageHead eyebrow="NEWSROOM OVERVIEW" title="Dashboard">
        <Link className="adm-btn adm-btn-accent" href="/admin/articles/new">+ New story</Link>
      </PageHead>

      <div className="adm-stats">
        <div className="adm-stat adm-stat-accent">
          <p>PUBLISHED</p>
          <strong>{published.length}</strong>
          <small>{drafts.length} draft{drafts.length === 1 ? "" : "s"} waiting</small>
        </div>
        <div className="adm-stat">
          <p>TOTAL READS</p>
          <strong>{views.toLocaleString()}</strong>
          <small>across every story</small>
        </div>
        <div className="adm-stat">
          <p>SUBSCRIBERS</p>
          <strong>{activeSubscribers.length}</strong>
          <small>{subscribers.length - activeSubscribers.length} unsubscribed</small>
        </div>
        <div className="adm-stat">
          <p>INBOX</p>
          <strong>{unread.length}</strong>
          <small>unread of {messages.length}</small>
        </div>
        <div className="adm-stat">
          <p>TICKER</p>
          <strong>{ticker.filter((t) => t.enabled).length}</strong>
          <small>live of {ticker.length} headlines</small>
        </div>
      </div>

      <div className="adm-card">
        <h2>Most read</h2>
        <p className="adm-card-note">Ranked by reads recorded on the public article pages.</p>
        {topRead.length === 0 ? (
          <p className="adm-empty">Nothing published yet.</p>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Story</th>
                  <th>Section</th>
                  <th>Published</th>
                  <th style={{ textAlign: "right" }}>Reads</th>
                </tr>
              </thead>
              <tbody>
                {topRead.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link className="adm-table-title" href={`/admin/articles/${article.id}`}>{article.title}</Link>
                      <span className="adm-table-sub">/{article.slug}</span>
                    </td>
                    <td>{labels.get(article.section) ?? article.section}</td>
                    <td>{formatDate(article.date)}</td>
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{article.views.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="adm-card">
        <h2>Stories by section</h2>
        <p className="adm-card-note">
          Sections drive the homepage blocks, the navigation and the all-stories index.
        </p>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>On homepage</th>
                <th>In navigation</th>
                <th style={{ textAlign: "right" }}>Stories</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((section) => (
                <tr key={section.id}>
                  <td>
                    <span className="adm-table-title">{section.label}</span>
                    <span className="adm-table-sub">{section.id}</span>
                  </td>
                  <td>{section.showOnHome ? "Yes" : "—"}</td>
                  <td>{section.showInNav ? "Yes" : "—"}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>
                    {articles.filter((a) => a.section === section.id).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {drafts.length > 0 && (
        <div className="adm-card">
          <h2>Drafts</h2>
          <p className="adm-card-note">Not visible on the site until you set them to published.</p>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Story</th>
                  <th>Section</th>
                  <th>Last edited</th>
                </tr>
              </thead>
              <tbody>
                {drafts.map((article) => (
                  <tr key={article.id}>
                    <td>
                      <Link className="adm-table-title" href={`/admin/articles/${article.id}`}>{article.title}</Link>
                      <span className="adm-table-sub">/{article.slug}</span>
                    </td>
                    <td>{labels.get(article.section) ?? article.section}</td>
                    <td>{formatDate(article.updatedAt.slice(0, 10))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
