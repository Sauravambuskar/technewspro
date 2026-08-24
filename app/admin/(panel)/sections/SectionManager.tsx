"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "../../apiClient";
import type { Section } from "@/lib/types";

type Counts = Record<string, number>;

export default function SectionManager({ sections, counts }: { sections: Section[]; counts: Counts }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Section[]>(sections);
  const [newLabel, setNewLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  function edit(id: string, patch: Partial<Section>) {
    setDrafts((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
    setNote("");
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= drafts.length) return;
    const next = [...drafts];
    [next[index], next[target]] = [next[target], next[index]];
    setDrafts(next.map((section, i) => ({ ...section, order: i + 1 })));
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
      () => send("/api/sections", "PUT", { sections: drafts.map((s, i) => ({ ...s, order: i + 1 })) }),
      "Sections saved."
    );

  async function addSection(event: React.FormEvent) {
    event.preventDefault();
    if (!newLabel.trim()) return;
    await run(async () => {
      const created = await send("/api/sections", "POST", { label: newLabel });
      setDrafts((prev) => [...prev, created as Section]);
      setNewLabel("");
    }, "Section added.");
  }

  function remove(section: Section) {
    if (!window.confirm(`Delete the “${section.label}” section?`)) return;
    run(async () => {
      await send(`/api/sections/${section.id}`, "DELETE");
      setDrafts((prev) => prev.filter((s) => s.id !== section.id));
    }, "Section deleted.");
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}
      {note && <p className="adm-note adm-note-ok" role="status">{note}</p>}

      <div className="adm-card">
        <h2>Sections</h2>
        <p className="adm-card-note">
          Order controls the sequence of homepage blocks and the all-stories index. The <code>latest</code>{" "}
          section is rendered as the four-card brief at the top of the homepage.
        </p>

        {drafts.map((section, index) => (
          <div
            key={section.id}
            style={{ borderTop: index === 0 ? "none" : "1px solid #eeeee8", paddingTop: index === 0 ? 0 : 18 }}
          >
            <div className="adm-grid-2">
              <label className="adm-field">
                <span>LABEL</span>
                <input type="text" value={section.label} onChange={(e) => edit(section.id, { label: e.target.value })} />
                <small>
                  id: {section.id} · {counts[section.id] ?? 0} article{(counts[section.id] ?? 0) === 1 ? "" : "s"}
                </small>
              </label>

              <label className="adm-field">
                <span>EYEBROW</span>
                <input
                  type="text"
                  value={section.eyebrow}
                  onChange={(e) => edit(section.id, { eyebrow: e.target.value })}
                />
              </label>

              <label className="adm-field">
                <span>HEADING</span>
                <input
                  type="text"
                  value={section.heading}
                  onChange={(e) => edit(section.id, { heading: e.target.value })}
                />
              </label>

              <label className="adm-field">
                <span>LINK TEXT</span>
                <input type="text" value={section.cta} onChange={(e) => edit(section.id, { cta: e.target.value })} />
              </label>
            </div>

            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", alignItems: "center" }}>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={section.showOnHome}
                  onChange={(e) => edit(section.id, { showOnHome: e.target.checked })}
                />
                Show on homepage
              </label>
              <label className="adm-check">
                <input
                  type="checkbox"
                  checked={section.showInNav}
                  onChange={(e) => edit(section.id, { showInNav: e.target.checked })}
                />
                Show in navigation
              </label>
              <div className="adm-row-actions" style={{ marginLeft: "auto", marginBottom: 14 }}>
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
                  onClick={() => remove(section)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}

        <div className="adm-form-actions">
          <button type="button" className="adm-btn adm-btn-accent" onClick={saveAll} disabled={busy}>
            {busy ? "Saving…" : "Save sections"}
          </button>
        </div>
      </div>

      <div className="adm-card">
        <h2>Add a section</h2>
        <p className="adm-card-note">
          The id is derived from the label, so “Climate Tech” becomes <code>climate-tech</code>.
        </p>
        <form onSubmit={addSection} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Section name"
            style={{ flex: 1, minWidth: 220, border: "1px solid #d5d5cd", borderRadius: 4, padding: "10px 12px", fontSize: 13.5, fontFamily: "inherit" }}
          />
          <button className="adm-btn" type="submit" disabled={busy || !newLabel.trim()}>
            Add section
          </button>
        </form>
      </div>
    </>
  );
}
