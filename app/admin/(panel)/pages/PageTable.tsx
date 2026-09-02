"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { send } from "../../apiClient";
import { formatDate, type Page } from "@/lib/types";

export default function PageTable({ pages }: { pages: Page[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return pages.filter((page) => {
      if (status !== "all" && page.status !== status) return false;
      if (!term) return true;
      return [page.title, page.slug, page.summary].some((value) => value.toLowerCase().includes(term));
    });
  }, [pages, query, status]);

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

  function toggleStatus(page: Page) {
    const next = page.status === "published" ? "draft" : "published";
    return run(page.id, () => send(`/api/pages/${page.id}`, "PATCH", { status: next }));
  }

  function remove(page: Page) {
    if (!window.confirm(`Delete “${page.title}”? This cannot be undone.`)) return;
    return run(page.id, () => send(`/api/pages/${page.id}`, "DELETE"));
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <div className="adm-toolbar" data-tour="toolbar">
        <input
          type="text"
          placeholder="Search titles and slugs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search pages"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <span className="adm-table-sub">{visible.length} of {pages.length}</span>
      </div>

      {pages.length === 0 ? (
        <div className="adm-card">
          <p className="adm-empty">
            No pages yet. Use <b>+ New page</b> for standalone content like a privacy policy, terms, or an
            advertise-with-us page.
          </p>
        </div>
      ) : (
        <div className="adm-table-wrap" data-tour="table">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Page</th>
                <th>Status</th>
                <th>Menus</th>
                <th>Last edited</th>
                <th style={{ textAlign: "right" }}>Views</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((page) => (
                <tr key={page.id}>
                  <td>
                    <Link className="adm-table-title" href={`/admin/pages/${page.id}`}>{page.title}</Link>
                    <span className="adm-table-sub">/{page.slug}</span>
                  </td>
                  <td>
                    <span className={`adm-tag ${page.status === "published" ? "adm-tag-live" : "adm-tag-draft"}`}>
                      {page.status}
                    </span>
                  </td>
                  <td className="adm-table-sub">
                    {[page.showInNav && "nav", page.showInFooter && "footer"].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td>{formatDate(page.updatedAt.slice(0, 10))}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{page.views.toLocaleString()}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        onClick={() => toggleStatus(page)}
                        disabled={busyId === page.id}
                      >
                        {page.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        onClick={() => remove(page)}
                        disabled={busyId === page.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
