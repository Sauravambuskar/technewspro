"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "../../apiClient";
import type { TickerItem } from "@/lib/types";

export default function TickerManager({ items }: { items: TickerItem[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<TickerItem[]>(items);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  function edit(id: string, patch: Partial<TickerItem>) {
    setDrafts((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setNote("");
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= drafts.length) return;
    const next = [...drafts];
    [next[index], next[target]] = [next[target], next[index]];
    setDrafts(next.map((item, i) => ({ ...item, order: i + 1 })));
    setNote("");
  }

  async function run(action: () => Promise<unknown>, message?: string) {
    setBusy(true);
    setError("");
    setNote("");
    try {
      await action();
      if (message) setNote(message);
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const saveAll = () =>
    run(
      () => send("/api/ticker", "PUT", { items: drafts.map((item, i) => ({ ...item, order: i + 1 })) }),
      "Ticker saved."
    );

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    await run(async () => {
      const created = await send("/api/ticker", "POST", { text });
      setDrafts((prev) => [...prev, created as TickerItem]);
      setText("");
    }, "Headline added.");
  }

  function remove(item: TickerItem) {
    run(async () => {
      await send(`/api/ticker/${item.id}`, "DELETE");
      setDrafts((prev) => prev.filter((i) => i.id !== item.id));
    });
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}
      {note && <p className="adm-note adm-note-ok" role="status">{note}</p>}

      <div className="adm-card">
        <h2>Add a headline</h2>
        <p className="adm-card-note">
          These scroll in the black bar under the header. Keep them to a single line of news.
        </p>
        <form onSubmit={add} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Company X raises $100M to build…"
            maxLength={300}
            style={{ flex: 1, minWidth: 260, border: "1px solid #d5d5cd", borderRadius: 4, padding: "10px 12px", fontSize: 13.5, fontFamily: "inherit" }}
          />
          <button className="adm-btn" type="submit" disabled={busy || !text.trim()}>
            Add headline
          </button>
        </form>
      </div>

      <div className="adm-card">
        <h2>Running order</h2>
        <p className="adm-card-note">
          Uncheck a headline to pull it off the site without deleting it. Remember to save.
        </p>

        {drafts.length === 0 ? (
          <p className="adm-empty">No ticker headlines yet.</p>
        ) : (
          <div className="adm-list">
            {drafts.map((item, index) => (
              <div className="adm-list-row" key={item.id}>
                <span className="adm-handle">{String(index + 1).padStart(2, "0")}</span>
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => edit(item.id, { text: e.target.value })}
                  aria-label={`Headline ${index + 1}`}
                />
                <label className="adm-check" style={{ margin: 0, whiteSpace: "nowrap" }}>
                  <input
                    type="checkbox"
                    checked={item.enabled}
                    onChange={(e) => edit(item.id, { enabled: e.target.checked })}
                  />
                  Live
                </label>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-ghost adm-btn-sm"
                  onClick={() => move(index, 1)}
                  disabled={index === drafts.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="adm-btn adm-btn-danger adm-btn-sm"
                  onClick={() => remove(item)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="adm-form-actions">
          <button type="button" className="adm-btn adm-btn-accent" onClick={saveAll} disabled={busy}>
            {busy ? "Saving…" : "Save ticker"}
          </button>
        </div>
      </div>
    </>
  );
}
