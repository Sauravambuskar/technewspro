"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, send, uploadFile } from "../../apiClient";
import {
  AD_PLACEMENTS,
  AD_PLACEMENT_LABELS,
  AD_TYPES,
  adBlockedReason,
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

  // The server component re-renders after every save; without this the list on
  // screen would keep showing whatever was in state when the page first loaded.
  useEffect(() => setDrafts(ads), [ads]);

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
        body: JSON.stringify({ name: "New ad", placement })
      });
      setDrafts((prev) => [created, ...prev]);
      setOpenId(created.id);
    }, "Ad added. Fill it in below, switch it on, then save.");
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

      <div className="adm-card" data-tour="ad-how">
        <h2>How ads work here</h2>
        <p className="adm-card-note">
          Three slots on the public site. Each one shows a single ad at a time — the newest that is switched
          on and inside its dates. A slot with nothing running renders nothing at all: no gap, no placeholder.
        </p>

        <ol className="adm-ad-steps">
          <li>
            <b>Add an ad</b> to a slot below.
          </li>
          <li>
            <b>Give it a creative</b> — upload a banner image and the link it should open, or paste the code
            your ad network gave you.
          </li>
          <li>
            <b>Switch it on</b> and save. Dates are optional; without them it runs until you turn it off.
          </li>
        </ol>

        <p className="adm-card-note" style={{ margin: 0 }}>
          Every ad shows its own impressions, clicks and click-through rate. Clicks are counted on the way out,
          so the reader still lands on the advertiser&rsquo;s page. Impressions count once per visitor per
          visit, not per page view.
        </p>
      </div>

      {AD_PLACEMENTS.map((placement) => {
        const meta = AD_PLACEMENT_LABELS[placement];
        const inSlot = drafts.filter((ad) => ad.placement === placement);
        const live = inSlot.find((ad) => adIsLive(ad));

        return (
          <div className="adm-card" key={placement} data-tour={`ad-${placement}`}>
            <h2>{meta.label}</h2>
            <p className="adm-card-note">{meta.hint}</p>

            <div className={`adm-ad-status ${live ? "adm-ad-on" : ""}`}>
              {live ? (
                <>
                  <b>On air:</b> “{live.name}” is showing in this slot right now.
                </>
              ) : (
                <>
                  <b>Empty:</b> nothing is running here, so the slot renders nothing on the site.
                </>
              )}
            </div>

            <p className="adm-ad-sizes">
              <b>Best size</b> — {meta.sizes}
            </p>

            {inSlot.map((ad) => {
              const open = openId === ad.id;
              const running = adIsLive(ad);
              // Either something about the ad itself keeps it off, or it is
              // complete and in-window but another ad already claimed the slot.
              const blocked = adBlockedReason(ad);

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
                      {running ? "on air" : "off air"}
                    </span>
                    <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => remove(ad)}>
                      Delete
                    </button>
                  </div>

                  {!running && (
                    <p className="adm-ad-why">
                      Not on the site: {blocked || `“${live?.name}” is ahead of it in this slot.`}
                    </p>
                  )}

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
                          <small>Only you see this — name it after the advertiser or the campaign.</small>
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
                          <small>
                            {ad.type === "image"
                              ? "A banner you were sent, linking to the advertiser."
                              : "A snippet from AdSense, Ad Manager or a partner."}
                          </small>
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
                            <small>{meta.sizes}</small>
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
                              <small>
                                {ad.href && !/^https?:\/\//i.test(ad.href)
                                  ? "Needs to start with https:// or the click won't go anywhere."
                                  : "Counted on the way out, then the reader is forwarded."}
                              </small>
                            </label>

                            <label className="adm-field">
                              <span>IMAGE ALT TEXT</span>
                              <input
                                type="text"
                                value={ad.imageAlt}
                                onChange={(e) => edit(ad.id, { imageAlt: e.target.value })}
                                placeholder="e.g. Acme Cloud — free 30-day trial"
                              />
                              <small>Read aloud by screen readers.</small>
                            </label>
                          </div>
                        </>
                      ) : (
                        <label className="adm-field">
                          <span>AD CODE</span>
                          <textarea
                            rows={7}
                            value={ad.html}
                            onChange={(e) => edit(ad.id, { html: e.target.value })}
                            placeholder='Paste the whole snippet, e.g. <ins class="adsbygoogle" …></ins><script>…</script>'
                            style={{ fontFamily: '"DM Mono", monospace', fontSize: 12.5 }}
                          />
                          <small>
                            Scripts in here run on the public site. Only paste code from a network you trust —
                            it can see and change the page like any other script you add.
                          </small>
                        </label>
                      )}

                      <div className="adm-ad-preview">
                        <p className="adm-subs-label">HOW IT WILL LOOK</p>
                        <div className="adm-ad-preview-frame">
                          <span className="adm-ad-preview-label">Advertisement</span>
                          {ad.type === "image" && ad.image ? (
                            <img src={ad.image} alt={ad.imageAlt} />
                          ) : ad.type === "html" && ad.html ? (
                            <em>Network code renders here on the live site — it can&rsquo;t be previewed safely.</em>
                          ) : (
                            <em>Nothing yet. Add {ad.type === "image" ? "a banner image" : "the ad code"} above.</em>
                          )}
                        </div>
                      </div>

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
                        Added {formatDate(ad.createdAt.slice(0, 10))} · {ad.impressions.toLocaleString()}{" "}
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
                        <small style={{ color: "#71737b", fontSize: 11.5 }}>
                          Nothing above is stored until you press this.
                        </small>
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
                Several in one slot: the newest one that is on air wins. Use the dates to hand over between
                advertisers without touching anything on the day.
              </small>
            )}
          </div>
        );
      })}
    </>
  );
}
