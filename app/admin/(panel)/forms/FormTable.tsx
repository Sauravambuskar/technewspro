"use client";

import Link from "next/link";
import { formatDate, type FormDefinition } from "@/lib/types";

export default function FormTable({
  forms,
  counts
}: {
  forms: FormDefinition[];
  counts: Record<string, number>;
}) {
  if (forms.length === 0) {
    return (
      <div className="adm-card">
        <p className="adm-empty">
          No forms yet. Use <b>+ New form</b> to build one, then attach it to a page under Pages.
        </p>
      </div>
    );
  }

  return (
    <div className="adm-table-wrap" data-tour="table">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Form</th>
            <th>Status</th>
            <th>Fields</th>
            <th>Last edited</th>
            <th style={{ textAlign: "right" }}>Responses</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {forms.map((form) => (
            <tr key={form.id}>
              <td>
                <Link className="adm-table-title" href={`/admin/forms/${form.id}`}>{form.name}</Link>
                <span className="adm-table-sub">{form.fields.map((f) => f.label).join(" · ") || "no fields"}</span>
              </td>
              <td>
                <span className={`adm-tag ${form.status === "published" ? "adm-tag-live" : "adm-tag-draft"}`}>
                  {form.status}
                </span>
              </td>
              <td>{form.fields.length}</td>
              <td>{formatDate(form.updatedAt.slice(0, 10))}</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{(counts[form.id] ?? 0).toLocaleString()}</td>
              <td>
                <div className="adm-row-actions">
                  <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={`/admin/forms/${form.id}/submissions`}>
                    Responses
                  </Link>
                  <Link className="adm-btn adm-btn-ghost adm-btn-sm" href={`/admin/forms/${form.id}`}>
                    Edit
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
