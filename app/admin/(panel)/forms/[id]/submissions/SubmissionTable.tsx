"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "../../../../apiClient";
import { formatDate, type FormDefinition, type FormSubmission } from "@/lib/types";

export default function SubmissionTable({
  form,
  submissions
}: {
  form: FormDefinition;
  submissions: FormSubmission[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function remove(submission: FormSubmission) {
    if (!window.confirm("Delete this response? This cannot be undone.")) return;
    setBusyId(submission.id);
    setError("");
    try {
      await send(`/api/forms/${form.id}/submissions/${submission.id}`, "DELETE");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  if (submissions.length === 0) {
    return (
      <div className="adm-card">
        <p className="adm-empty">
          Nothing yet. Responses land here as soon as someone fills the form in on the site.
        </p>
      </div>
    );
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Received</th>
              {form.fields.map((field) => <th key={field.id}>{field.label}</th>)}
              <th />
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td className="adm-table-sub" style={{ whiteSpace: "nowrap" }}>
                  {formatDate(submission.createdAt.slice(0, 10))}
                </td>
                {form.fields.map((field) => (
                  <td key={field.id}>{submission.values[field.name] || <span className="adm-table-sub">—</span>}</td>
                ))}
                <td>
                  <div className="adm-row-actions">
                    <button
                      className="adm-btn adm-btn-danger adm-btn-sm"
                      onClick={() => remove(submission)}
                      disabled={busyId === submission.id}
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
    </>
  );
}
