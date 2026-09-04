"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, send, uploadFile } from "../../apiClient";
import {
  AD_PLACEMENTS,
  AD_PLACEMENT_LABELS,
  AD_TYPES,
  adIsLive,
  formatDate,
  type Ad,
  type AdPlacement
} from "@/lib/types";

const TYPE_LABELS: Record<(typeof AD_TYPES)[number], string> = {
  image: "Image banner",
  html: "Ad network code"
};

export default function AdManager({ ads }: { ads: Ad[] }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<Ad[]>(ads);
  const [openId, setOpenId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  function edit(id: string, patch: Partial<Ad>) {
    setDrafts((prev) => prev.map((ad) => (ad.id === id ? { ...ad, ...patch } : ad)));
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

  function addAd(placement: AdPlacement) {
    run(async () => {
      const created = await api<Ad>("/api/ads", {
        method: "POST",
        body: JSON.stringify({ name: `${AD_PLACEMENT_LABELS[placement].label} ad`, placement })
      });
      setDrafts((prev) => [created, ...prev]);
      setOpenId(created.id);
    }, "Ad created — it stays off until you switch it on.");
  }

  function save(ad: Ad) {
    run(() => send(`/api/ads/${ad.id}`, "PATCH", ad), `“${ad.name}” saved.`);
  }

  function remove(ad: Ad) {
    if (!window.confirm(`Delete “${ad.name}”? Its impression and click counts go with it.`)) return;
    run(async () => {
      await send(`/api/ads/${ad.id}`, "DELETE");
      setDrafts((prev) => prev.filter((a) => a.id !== ad.id));
    }, "Ad deleted.");
  }

  async function upload(ad: Ad, file: File | undefined) {
    if (!file) return;
    setUploadingId(ad.id);
    setError("");
    try {
      const uploaded = await uploadFile(file);
      edit(ad.id, { image: uploaded.url });
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}
      {note && <p className="adm-note adm-note-ok" role="status">{note}</p>}

      {AD_PLACEMENTS.map((placement) => {
        const inSlot = drafts.filter((ad) => ad.placement === placement);
        const live = inSlot.find((ad) => adIsLive(ad));

        return (
          <div className="adm-card" key={placement} data-tour={`ad-${placement}`}>
            <h2>{AD_PLACEMENT_LABELS[placement].label}</h2>
            <p className="adm-card-note">
              {AD_PLACEMENT_LABELS[placement].hint}
              {" "}
              {live ? (
                <b style={{ color: "#1f7a4d" }}>Showing “{live.name}” right now.</b>
              ) : (
                <b style={{ color: "#71737b" }}>Empty — this slot renders nothing at all.</b>
              )}
            </p>

            {inSlot.map((ad) => {
              const open = openId === ad.id;
              const running = adIsLive(ad);
              return (
                <div className={`adm-fb-field${open ? " adm-fb-open" : ""}`} key={ad.id}>
                  <div className="adm-fb-head">
                    <button
                      type="button"
                      className="adm-fb-summary"
                      onClick={() => setOpenId(open ? null : ad.id)}
                      aria-expanded={open}
                    >
                      <b>{ad.name || "Untitled ad"}</b>
                      <span>
                        {TYPE_LABELS[ad.type]} · {ad.impressions.toLocaleString()} impressions ·{" "}
                        {ad.clicks.toLocaleString()} clicks
                        {ad.impressions > 0 && ` · ${((ad.clicks / ad.impressions) * 100).toFixed(1)}% CTR`}
                      </span>
                    </button>
                    <span className={`adm-tag ${running ? "adm-tag-live" : "adm-tag-draft"}`}>
                      {running ? "live" : ad.enabled ? "scheduled" : "off"}
                    </span>
                    <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(ad)}>
                      Delete
                    </button>
                  </div>

                  {open && (
                    <div className="adm-fb-body">
                      <div className="adm-grid-2">
                        <label className="adm-field">
                          <span>NAME</span>
                          <input
                            type="text"
                            value={ad.name}
                            onChange={(e) => edit(ad.id, { name: e.target.value })}
                          />
                          <small>Only you see this — name it after the advertiser.</small>
                        </label>

                        <label className="adm-field">
                          <span>WHAT IT IS</span>
                          <select
                            value={ad.type}
                            onChange={(e) => edit(ad.id, { type: e.target.value as Ad["type"] })}
                          >
                            {AD_TYPES.map((type) => (
                              <option key={type} value={type}>{TYPE_LABELS[type]}</option>
                            ))}
                          </select>
                        </label>
                      </div>

                      {ad.type === "image" ? (
                        <>
                          <label className="adm-field">
                            <span>BANNER IMAGE</span>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <input
                                type="text"
                                value={ad.image}
                                onChange={(e) => edit(ad.id, { image: e.target.value })}
                                placeholder="Paste a URL, or upload"
                                style={{ flex: 1 }}
                              />
                              <label
                                className="adm-btn adm-btn-ghost adm-btn-sm"
                                style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                              >
                                {uploadingId === ad.id ? "Uploading…" : "Upload"}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  onChange={(e) => upload(ad, e.target.files?.[0])}
                                  disabled={uploadingId === ad.id}
                                  style={{ display: "none" }}
                                />
                              </label>
                            </div>
                          </label>

                          <div className="adm-grid-2">
                            <label className="adm-field">
                              <span>CLICKS GO TO</span>
                              <input
                                type="text"
                                value={ad.href}
                                onChange={(e) => edit(ad.id, { href: e.target.value })}
                                placeholder="https://advertiser.com/landing"
                              />
                              <small>Clicks are counted before the reader is forwarded.</small>
                            </label>

                            <label className="adm-field">
                              <span>IMAGE ALT TEXT</span>
                              <input
                                type="text"
                                value={ad.imageAlt}
                                onChange={(e) => edit(ad.id, { imageAlt: e.target.value })}
                                placeholder="e.g. Acme Cloud — free 30-day trial"
                              />
                            </label>
                          </div>

                          {ad.image && (
                            <img
                              src={ad.image}
                              alt={ad.imageAlt}
                              style={{ maxWidth: "100%", borderRadius: 4, marginBottom: 16, display: "block" }}
                            />
                          )}
                        </>
                      ) : (
                        <label className="adm-field">
                          <span>AD CODE</span>
                          <textarea
                            rows={7}
                            value={ad.html}
                            onChange={(e) => edit(ad.id, { html: e.target.value })}
                            placeholder="Paste the snippet from AdSense, Ad Manager or your ad partner."
                            style={{ fontFamily: '"DM Mono", monospace', fontSize: 12.5 }}
                          />
                          <small>
                            Scripts in here run on the public site. Only paste code from a network you trust —
                            it can see and change the page like any other script you add.
                          </small>
                        </label>
                      )}

                      <div className="adm-grid-2">
                        <label className="adm-field">
                          <span>START DATE (OPTIONAL)</span>
                          <input
                            type="date"
                            value={ad.startsAt}
                            onChange={(e) => edit(ad.id, { startsAt: e.target.value })}
                          />
                        </label>
                        <label className="adm-field">
                          <span>END DATE (OPTIONAL)</span>
                          <input
                            type="date"
                            value={ad.endsAt}
                            onChange={(e) => edit(ad.id, { endsAt: e.target.value })}
                          />
                          <small>Leave both empty to run until you switch it off.</small>
                        </label>
                      </div>

                      <label className="adm-check">
                        <input
                          type="checkbox"
                          checked={ad.enabled}
                          onChange={(e) => edit(ad.id, { enabled: e.target.checked })}
                        />
                        Switched on
                      </label>

                      <p className="adm-fb-key">
                        Created {formatDate(ad.createdAt.slice(0, 10))} · {ad.impressions.toLocaleString()}{" "}
                        impressions · {ad.clicks.toLocaleString()} clicks
                      </p>

                      <div className="adm-form-actions">
                        <button
                          type="button"
                          className="adm-btn adm-btn-accent"
                          onClick={() => save(ad)}
                          disabled={busy}
                        >
                          {busy ? "Saving…" : "Save this ad"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              className="adm-btn adm-btn-ghost adm-btn-sm"
              onClick={() => addAd(placement)}
              disabled={busy}
              style={{ marginTop: 12 }}
            >
              + Add an ad here
            </button>
            {inSlot.length > 1 && (
              <small style={{ display: "block", marginTop: 10, color: "#71737b", fontSize: 11.5 }}>
                With several in one slot, the newest live one wins — use the dates to hand over between
                advertisers.
              </small>
            )}
          </div>
        );
      })}
    </>
  );
}
