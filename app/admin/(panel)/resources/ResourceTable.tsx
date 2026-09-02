"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { send } from "../../apiClient";
import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  formatDate,
  type Resource,
  type ResourceType,
  type Section
} from "@/lib/types";

export default function ResourceTable({
  resources,
  sections
}: {
  resources: Resource[];
  sections: Section[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [type, setType] = useState<ResourceType | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const labels = useMemo(() => new Map(sections.map((s) => [s.id, s.label])), [sections]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return resources.filter((resource) => {
      if (status !== "all" && resource.status !== status) return false;
      if (type !== "all" && resource.type !== type) return false;
      if (!term) return true;
      return [resource.title, resource.summary, resource.slug].some((v) => v.toLowerCase().includes(term));
    });
  }, [resources, query, status, type]);

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

  function toggleStatus(resource: Resource) {
    const next = resource.status === "published" ? "draft" : "published";
    return run(resource.id, () => send(`/api/resources/${resource.id}`, "PATCH", { status: next }));
  }

  function remove(resource: Resource) {
    if (!window.confirm(`Delete “${resource.title}”? This cannot be undone.`)) return;
    return run(resource.id, () => send(`/api/resources/${resource.id}`, "DELETE"));
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <div className="adm-toolbar" data-tour="toolbar">
        <input
          type="text"
          placeholder="Search titles, summaries, slugs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search resources"
        />
        <select value={type} onChange={(e) => setType(e.target.value as ResourceType | "all")} aria-label="Filter by format">
          <option value="all">All formats</option>
          {RESOURCE_TYPES.map((value) => (
            <option key={value} value={value}>{RESOURCE_TYPE_LABELS[value].plural}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Drafts</option>
        </select>
        <span className="adm-table-sub">{visible.length} of {resources.length}</span>
      </div>

      <div className="adm-table-wrap" data-tour="table">
        {visible.length === 0 ? (
          <p className="adm-empty">No resources match those filters.</p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Format</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Downloads</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((resource) => (
                <tr key={resource.id}>
                  <td>
                    <Link className="adm-table-title" href={`/admin/resources/${resource.id}`}>
                      {resource.title}
                    </Link>
                    <span className="adm-table-sub">
                      /{resource.slug}
                      {resource.gated ? " · gated" : " · open"}
                      {resource.featured ? " · featured" : ""}
                    </span>
                  </td>
                  <td>{RESOURCE_TYPE_LABELS[resource.type].singular}</td>
                  <td>{labels.get(resource.category) ?? resource.category}</td>
                  <td>
                    <span className={`adm-tag ${resource.status === "published" ? "adm-tag-live" : "adm-tag-draft"}`}>
                      {resource.status}
                    </span>
                  </td>
                  <td>{formatDate(resource.date)}</td>
                  <td style={{ textAlign: "right", fontWeight: 700 }}>{resource.downloads.toLocaleString()}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        onClick={() => toggleStatus(resource)}
                        disabled={busyId === resource.id}
                      >
                        {resource.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={`/admin/resources/${resource.id}`}>
                        Edit
                      </Link>
                      <button
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        onClick={() => remove(resource)}
                        disabled={busyId === resource.id}
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
