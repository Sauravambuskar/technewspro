"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { send } from "../../apiClient";
import type { Message } from "@/lib/types";

function when(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(
    () => (filter === "unread" ? messages.filter((m) => !m.read) : messages),
    [messages, filter]
  );

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

  function toggleRead(message: Message) {
    return run(message.id, () => send(`/api/messages/${message.id}`, "PATCH", { read: !message.read }));
  }

  function remove(message: Message) {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    return run(message.id, () => send(`/api/messages/${message.id}`, "DELETE"));
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}

      <div className="adm-toolbar">
        <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)} aria-label="Filter messages">
          <option value="all">All messages</option>
          <option value="unread">Unread only</option>
        </select>
        <span className="adm-table-sub">{visible.length} of {messages.length}</span>
      </div>

      {visible.length === 0 ? (
        <div className="adm-card">
          <p className="adm-empty">
            {messages.length === 0
              ? "Nothing yet. Notes sent from the /contact page arrive here."
              : "No unread messages."}
          </p>
        </div>
      ) : (
        <div className="adm-list">
          {visible.map((message) => (
            <article className={`adm-message${message.read ? "" : " adm-message-unread"}`} key={message.id}>
              <div className="adm-message-head">
                <div>
                  <h3>{message.subject}</h3>
                  <span className="adm-message-meta">
                    {message.name} · <a href={`mailto:${message.email}`}>{message.email}</a>
                  </span>
                </div>
                <span className="adm-message-meta">{when(message.createdAt)}</span>
              </div>

              <p>{message.body}</p>

              <div className="adm-row-actions" style={{ justifyContent: "flex-start" }}>
                <a
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject}`)}`}
                >
                  Reply
                </a>
                <button
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => toggleRead(message)}
                  disabled={busyId === message.id}
                >
                  Mark as {message.read ? "unread" : "read"}
                </button>
                <button
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  onClick={() => remove(message)}
                  disabled={busyId === message.id}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
