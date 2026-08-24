"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { send } from "../../apiClient";
import { formatDate, type Subscriber } from "@/lib/types";

export default function SubscriberTable({ subscribers }: { subscribers: Subscriber[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | "subscribed" | "unsubscribed">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();
    return subscribers.filter((subscriber) => {
      if (status !== "all" && subscriber.status !== status) return false;
      return !term || subscriber.email.includes(term);
    });
  }, [subscribers, query, status]);

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

  function toggle(subscriber: Subscriber) {
    const next = subscriber.status === "subscribed" ? "unsubscribed" : "subscribed";
    return run(subscriber.id, () => send(`/api/subscribers/${subscriber.id}`, "PATCH", { status: next }));
  }

  function remove(subscriber: Subscriber) {
    if (!window.confirm(`Permanently delete ${subscriber.email}?`)) return;
    return run(subscriber.id, () => send(`/api/subscribers/${subscriber.id}`, "DELETE"));
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <div className="adm-toolbar">
        <input
          type="text"
          placeholder="Search email addresses…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search subscribers"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} aria-label="Filter by status">
          <option value="all">All</option>
          <option value="subscribed">Subscribed</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
        <span className="adm-table-sub">{visible.length} of {subscribers.length}</span>
      </div>

      <div className="adm-table-wrap">
        {visible.length === 0 ? (
          <p className="adm-empty">
            {subscribers.length === 0
              ? "No sign-ups yet. They land here the moment someone uses the homepage form."
              : "No subscribers match those filters."}
          </p>
        ) : (
          <table className="adm-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Status</th>
                <th>Source</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td><span className="adm-table-title">{subscriber.email}</span></td>
                  <td>
                    <span className={`adm-tag ${subscriber.status === "subscribed" ? "adm-tag-live" : ""}`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td>{subscriber.source}</td>
                  <td>{formatDate(subscriber.createdAt.slice(0, 10))}</td>
                  <td>
                    <div className="adm-row-actions">
                      <button
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        onClick={() => toggle(subscriber)}
                        disabled={busyId === subscriber.id}
                      >
                        {subscriber.status === "subscribed" ? "Unsubscribe" : "Resubscribe"}
                      </button>
                      <button
                        className="adm-btn adm-btn-danger adm-btn-sm"
                        onClick={() => remove(subscriber)}
                        disabled={busyId === subscriber.id}
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
