"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { send } from "../../apiClient";
import { formatDate, type Article, type Section } from "@/lib/types";

export default function ArticleTable({ articles, sections }: { articles: Article[]; sections: Section[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [section, setSection] = useState("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const labels = useMemo(() => new Map(sections.map((s) => [s.id, s.label])), [sections]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return articles.filter((article) => {
      if (status !== "all" && article.status !== status) return false;
      if (section !== "all" && article.section !== section) return false;
      if (!term) return true;
      return [article.title, article.dek, article.tag, article.author, article.slug].some((value) =>
        value.toLowerCase().includes(term)
      );
    });
  }, [articles, query, status, section]);

  async function run(id: string, action: () => Promise<unknown>) {
    setBusyId(id);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  function toggleStatus(article: Article) {
    const next = article.status === "published" ? "draft" : "published";
    return run(article.id, () => send(`/api/articles/${article.id}`, "PATCH", { status: next }));
  }

  function remove(article: Article) {
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;
    return run(article.id, () => send(`/api/articles/${article.id}`, "DELETE"));
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <div className="adm-toolbar">
        <input
          type="text"
          placeholder="Search titles, slugs, tags, authors…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search articles"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <select value={section} onChange={(e) => setSection(e.target.value)} aria-label="Filter by section">
          <option value="all">All sections</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </select>
        <span className="adm-table-sub">{visible.length} of {articles.length}</span>
      </div>

      <div className="adm-table-wrap">
        {visible.length === 0 ? (
          <p className="adm-empty">No stories match those filters.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Story</th>
                <th>Section</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Reads</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((article) => (
                <tr key={article.id}>
                  <td>
                    <Link className="adm-table-title" href={`/admin/articles/${article.id}`}>{article.title}</Link>
                    <span className="adm-table-sub">
                      /{article.slug}
                      {article.featured ? " · featured" : ""}
                    </span>
                  </td>
                  <td>{labels.get(article.section) ?? article.section}</td>
                  <td>
                    <span className={`adm-tag ${article.status === "published" ? "adm-tag-live" : "adm-tag-draft"}`}>
                      {article.status}
                    </span>
                  </td>
                  <td>{formatDate(article.date)}</td>
                  <td style={{ textAlign: "right" }}>{article.views.toLocaleString()}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        onClick={() => toggleStatus(article)}
                        disabled={busyId === article.id}
                      >
                        {article.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={`/admin/articles/${article.id}`}>
                        Edit
                      </Link>
                      <button
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        onClick={() => remove(article)}
                        disabled={busyId === article.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
