"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { send } from "../../apiClient";
import type { Article, Settings, SocialLink, ValueProp } from "@/lib/types";

const LINE_BREAK = "\n";

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

  function setPoint(id: string, patch: Partial<ValueProp>) {
    set("whyPoints", form.whyPoints.map((point) => (point.id === id ? { ...point, ...patch } : point)));
  }

  function addPoint() {
    set("whyPoints", [...form.whyPoints, { id: `point-${Date.now()}`, title: "New reason", body: "" }]);
  }

  function removePoint(id: string) {
    set("whyPoints", form.whyPoints.filter((point) => point.id !== id));
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

  async function sendTest() {
    setBusy(true);
    setError("");
    setNote("");
    try {
      const result = await send<{ to: string; from: string }>("/api/notifications/test", "POST");
      setNote(`Test sent to ${result.to} from ${result.from}. Check the inbox, and the spam folder.`);
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
          <small>Fills the editor&rsquo;s pick panel in the Trending Topics section.</small>
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
        <h2>Resource center</h2>
        <p className="adm-card-note">Headings for the homepage resource block and the /resources page.</p>
        {text("resourcesEyebrow", "EYEBROW")}
        {text("resourcesTitle", "HEADLINE")}
        {area("resourcesBlurb", "SUPPORTING COPY", 2)}
      </div>

      <div className="adm-card">
        <h2>Why {form.siteName}</h2>
        <p className="adm-card-note">Shown on the homepage and again on the About page.</p>
        {text("whyEyebrow", "EYEBROW")}
        {area("whyTitle", "HEADLINE", 2, "Line breaks are preserved.")}
        {area("whyBlurb", "SUPPORTING COPY", 2)}

        {form.whyPoints.map((point) => (
          <div key={point.id} style={{ borderTop: "1px solid #eeeee8", paddingTop: 16, marginTop: 8 }}>
            <label className="adm-field">
              <span>TITLE</span>
              <input type="text" value={point.title} onChange={(e) => setPoint(point.id, { title: e.target.value })} />
            </label>
            <label className="adm-field">
              <span>BODY</span>
              <textarea
                rows={3}
                style={{ minHeight: 76 }}
                value={point.body}
                onChange={(e) => setPoint(point.id, { body: e.target.value })}
              />
            </label>
            <button type="button" className="adm-btn adm-btn-danger adm-btn-sm" onClick={() => removePoint(point.id)}>
              Remove
            </button>
          </div>
        ))}

        <div className="adm-form-actions">
          <button type="button" className="adm-btn adm-btn-ghost" onClick={addPoint}>+ Add reason</button>
        </div>
      </div>

      <div className="adm-card">
        <h2>About us</h2>
        <p className="adm-card-note">Everything on the /about page.</p>
        {area("aboutOverview", "COMPANY OVERVIEW", 4)}
        {area("aboutMission", "MISSION", 3)}
        {area("aboutVision", "VISION", 3)}
        {area("aboutEditorialFocus", "EDITORIAL FOCUS", 4)}

        <label className="adm-field">
          <span>INDUSTRIES COVERED — ONE PER LINE</span>
          <textarea
            rows={8}
            value={form.aboutIndustries.join(LINE_BREAK)}
            onChange={(e) =>
              set(
                "aboutIndustries",
                e.target.value.split(LINE_BREAK).map((line) => line.trim()).filter(Boolean)
              )
            }
          />
          <small>{form.aboutIndustries.length} listed</small>
        </label>
      </div>

      <div className="adm-card">
        <h2>Contact &amp; lead generation</h2>
        <p className="adm-card-note">
          Used on the homepage lead section, the /contact page and the organisation schema.
        </p>
        {text("contactEyebrow", "EYEBROW")}
        {text("contactTitle", "HEADLINE")}
        {area("contactBlurb", "SUPPORTING COPY", 3)}
        <div className="adm-grid-2">
          {text("contactEmail", "BUSINESS EMAIL")}
          {text("contactPhone", "PHONE NUMBER")}
        </div>
        {text("contactAddress", "OFFICE ADDRESS")}
      </div>

      <div className="adm-card" data-tour="notifications">
        <h2>Notifications</h2>
        <p className="adm-card-note">
          Where to send an alert when a reader gets in touch. Everything is still stored in the panel either
          way — this only decides whether you also get an email about it.
        </p>

        {text(
          "notifyEmail",
          "SEND ALERTS TO",
          "Leave empty to turn every notification off."
        )}

        <label className="adm-check">
          <input
            type="checkbox"
            checked={form.notifyOnMessage}
            onChange={(e) => set("notifyOnMessage", e.target.checked)}
          />
          A message through the contact form
        </label>
        <label className="adm-check">
          <input type="checkbox" checked={form.notifyOnLead} onChange={(e) => set("notifyOnLead", e.target.checked)} />
          A new lead from a gated download or partnership form
        </label>
        <label className="adm-check">
          <input
            type="checkbox"
            checked={form.notifyOnFormSubmission}
            onChange={(e) => set("notifyOnFormSubmission", e.target.checked)}
          />
          A response to one of your built forms
        </label>
        <label className="adm-check">
          <input
            type="checkbox"
            checked={form.notifyOnSubscriber}
            onChange={(e) => set("notifyOnSubscriber", e.target.checked)}
          />
          A newsletter sign-up <span style={{ color: "#71737b", fontWeight: 400 }}>&nbsp;— noisy on a busy site</span>
        </label>

        <div className="adm-form-actions">
          <button className="adm-btn adm-btn-ghost" type="button" onClick={sendTest} disabled={busy}>
            Send a test email
          </button>
          <small style={{ color: "#71737b", fontSize: 11.5 }}>Save first — the test uses the saved address.</small>
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
