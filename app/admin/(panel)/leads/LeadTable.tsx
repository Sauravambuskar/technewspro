"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { send } from "../../apiClient";
import type { Lead } from "@/lib/types";

function when(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const INTENTS: Array<Lead["intent"] | "all"> = ["all", "download", "syndication", "partnership", "general"];

export default function LeadTable({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<Lead["intent"] | "all">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return leads.filter((lead) => {
      if (intent !== "all" && lead.intent !== intent) return false;
      if (!term) return true;
      return [lead.name, lead.email, lead.company, lead.jobTitle, lead.resourceTitle].some((value) =>
        value.toLowerCase().includes(term)
      );
    });
  }, [leads, query, intent]);

  function remove(lead: Lead) {
    if (!window.confirm(`Delete the lead from ${lead.email}?`)) return;
    setBusyId(lead.id);
    setError("");
    send(`/api/leads/${lead.id}`, "DELETE")
      .then(() => router.refresh())
      .catch((caught: Error) => setError(caught.message))
      .finally(() => setBusyId(null));
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <div className="adm-toolbar">
        <input
          type="text"
          placeholder="Search name, email, company, resource…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search leads"
        />
        <select
          value={intent}
          onChange={(e) => setIntent(e.target.value as Lead["intent"] | "all")}
          aria-label="Filter by intent"
        >
          {INTENTS.map((value) => (
            <option key={value} value={value}>
              {value === "all" ? "All intents" : value}
            </option>
          ))}
        </select>
        <span className="adm-table-sub">{visible.length} of {leads.length}</span>
      </div>

      <div className="adm-table-wrap">
        {visible.length === 0 ? (
          <p className="adm-empty">
            {leads.length === 0
              ? "No leads yet. Gated resource downloads and partnership enquiries land here."
              : "No leads match those filters."}
          </p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Company</th>
                <th>Intent</th>
                <th>Resource</th>
                <th>Captured</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <span className="adm-table-title">{lead.name}</span>
                    <span className="adm-table-sub">
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      {lead.phone ? ` · ${lead.phone}` : ""}
                    </span>
                  </td>
                  <td>
                    {lead.company || "—"}
                    {lead.jobTitle && <span className="adm-table-sub">{lead.jobTitle}</span>}
                  </td>
                  <td><span className="adm-tag">{lead.intent}</span></td>
                  <td>{lead.resourceTitle || "—"}</td>
                  <td>{when(lead.createdAt)}</td>
                  <td>
                    <div className="adm-row-actions">
                      <a className="adm-btn adm-btn-ghost adm-btn-sm" href={`mailto:${lead.email}`}>Email</a>
                      <button
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        onClick={() => remove(lead)}
                        disabled={busyId === lead.id}
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

      {visible.some((lead) => lead.message) && (
        <div className="adm-card">
          <h2>Messages</h2>
          <p className="adm-card-note">Notes left on partnership and syndication enquiries.</p>
          <div className="adm-list">
            {visible
              .filter((lead) => lead.message)
              .map((lead) => (
                <div className="adm-message" key={lead.id}>
                  <div className="adm-message-head">
                    <div>
                      <h3>{lead.name}{lead.company ? ` · ${lead.company}` : ""}</h3>
                      <span className="adm-message-meta">
                        <a href={`mailto:${lead.email}`}>{lead.email}</a> · {lead.intent}
                      </span>
                    </div>
                    <span className="adm-message-meta">{when(lead.createdAt)}</span>
                  </div>
                  <p>{lead.message}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
