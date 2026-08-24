"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "../../apiClient";
import type { Article, Settings, SocialLink } from "@/lib/types";

export default function SettingsForm({
  settings,
  featurable
}: {
  settings: Settings;
  featurable: Pick<Article, "slug" | "title">[];
}) {
  const router = useRouter();
  const [form, setForm] = useState<Settings>(settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setNote("");
  }

  function setSocial(id: string, patch: Partial<SocialLink>) {
    set(
      "socials",
      form.socials.map((social) => (social.id === id ? { ...social, ...patch } : social))
    );
  }

  function addSocial() {
    set("socials", [...form.socials, { id: `social-${Date.now()}`, label: "New link", href: "https://", glyph: "→" }]);
  }

  function removeSocial(id: string) {
    set("socials", form.socials.filter((social) => social.id !== id));
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNote("");
    try {
      await send("/api/settings", "PUT", form);
      setNote("Settings saved — the public site picks them up on the next request.");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const text = (key: keyof Settings, label: string, hint?: string) => (
    <label className="adm-field">
      <span>{label}</span>
      <input type="text" value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value as never)} />
      {hint && <small>{hint}</small>}
    </label>
  );

  const area = (key: keyof Settings, label: string, rows = 3, hint?: string) => (
    <label className="adm-field">
      <span>{label}</span>
      <textarea
        rows={rows}
        style={{ minHeight: rows * 26 }}
        value={String(form[key] ?? "")}
        onChange={(e) => set(key, e.target.value as never)}
      />
      {hint && <small>{hint}</small>}
    </label>
  );

  return (
    <form onSubmit={save}>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}
      {note && <p className="adm-note adm-note-ok" role="status">{note}</p>}

      <div className="adm-card">
        <h2>Identity &amp; metadata</h2>
        <p className="adm-card-note">Used in the browser tab, search results and social previews.</p>
        <div className="adm-grid-2">
          {text("siteName", "SITE NAME")}
          {text("metaTitle", "META TITLE")}
        </div>
        {area("metaDescription", "META DESCRIPTION", 2)}
      </div>

      <div className="adm-card">
        <h2>Homepage hero</h2>
        <p className="adm-card-note">The opening statement above the fold.</p>
        <div className="adm-grid-2">
          {text("heroEyebrow", "EYEBROW")}
          {text("heroFootnote", "FOOTNOTE")}
          {text("heroTitle", "HEADLINE — LINE 1")}
          {text("heroTitleAccent", "HEADLINE — LINE 2 (ACCENT)")}
        </div>
        {area("heroDescription", "INTRO PARAGRAPH", 3)}
        {text("heroCta", "CALL TO ACTION")}

        <label className="adm-field">
          <span>PINNED FEATURE STORY</span>
          <select value={form.featuredSlug} onChange={(e) => set("featuredSlug", e.target.value)}>
            <option value="">Newest story flagged as featured</option>
            {featurable.map((article) => (
              <option key={article.slug} value={article.slug}>{article.title}</option>
            ))}
          </select>
          <small>Fills the large feature panel between the brief and the manifesto.</small>
        </label>

        <label className="adm-check">
          <input
            type="checkbox"
            checked={form.tickerEnabled}
            onChange={(e) => set("tickerEnabled", e.target.checked)}
          />
          Show the scrolling news ticker
        </label>
      </div>

      <div className="adm-card">
        <h2>Manifesto panel</h2>
        <p className="adm-card-note">The acid-green statement block halfway down the homepage.</p>
        <div className="adm-grid-2">
          {text("manifestoEyebrow", "EYEBROW")}
          {text("manifestoTitle", "HEADLINE — LINE 1")}
          {text("manifestoTitleAccent", "HEADLINE — LINE 2 (ACCENT)")}
        </div>
        {area("manifestoBody", "BODY", 3)}
      </div>

      <div className="adm-card">
        <h2>Newsletter block</h2>
        <p className="adm-card-note">Sign-ups from this form land under Subscribers.</p>
        {text("newsletterEyebrow", "EYEBROW")}
        {area("newsletterTitle", "HEADLINE", 2, "Line breaks are preserved.")}
        {area("newsletterBlurb", "SUPPORTING COPY", 2)}
      </div>

      <div className="adm-card">
        <h2>Footer</h2>
        <p className="adm-card-note">Tagline, copyright line and social buttons.</p>
        <div className="adm-grid-2">
          {text("footerTagline", "TAGLINE")}
          {text("footerCopyright", "COPYRIGHT LINE")}
        </div>

        <div className="adm-list" style={{ marginTop: 8 }}>
          {form.socials.map((social) => (
            <div className="adm-list-row" key={social.id}>
              <input
                type="text"
                value={social.glyph}
                onChange={(e) => setSocial(social.id, { glyph: e.target.value })}
                aria-label="Icon"
                style={{ flex: "0 0 56px", textAlign: "center" }}
              />
              <input
                type="text"
                value={social.label}
                onChange={(e) => setSocial(social.id, { label: e.target.value })}
                aria-label="Label"
                style={{ flex: "0 0 130px" }}
              />
              <input
                type="text"
                value={social.href}
                onChange={(e) => setSocial(social.id, { href: e.target.value })}
                aria-label="URL"
              />
              <button
                type="button"
                className="adm-btn adm-btn-danger adm-btn-sm"
                onClick={() => removeSocial(social.id)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="adm-form-actions">
          <button type="button" className="adm-btn adm-btn-ghost" onClick={addSocial}>
            + Add social link
          </button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-form-actions" style={{ marginTop: 0, borderTop: 0, paddingTop: 0 }}>
          <button className="adm-btn adm-btn-accent" type="submit" disabled={busy}>
            {busy ? "Saving…" : "Save all settings"}
          </button>
        </div>
      </div>
    </form>
  );
}
