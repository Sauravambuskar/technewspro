"use client";

import { useState } from "react";
import { uploadFile } from "../apiClient";
import { ROBOTS_DIRECTIVES, TWITTER_CARDS, type RobotsDirective, type Seo } from "@/lib/types";

// The two SEO cards shared by the article and resource editors: a Yoast-style
// search-appearance box (snippet preview, focus keyphrase, on-page checks,
// indexing controls) and a social-appearance box for Open Graph / X.

const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;

const DIRECTIVE_LABELS: Record<RobotsDirective, string> = {
  noimageindex: "No image index — don't index images on this page",
  noarchive: "No archive — don't show a cached copy",
  nosnippet: "No snippet — don't show a text preview in results"
};

const CARD_LABELS: Record<(typeof TWITTER_CARDS)[number], string> = {
  summary_large_image: "Summary with large image",
  summary: "Summary (small thumbnail)"
};

/** What the page will actually render once the empty overrides fall back. */
export type SeoFallbacks = {
  title: string;
  description: string;
  image: string;
  /** Site-relative path, e.g. /articles/my-story. */
  path: string;
  siteName: string;
  /** Body text, used for the keyphrase checks. */
  body: string;
};

type Props = {
  seo: Seo;
  onChange: (patch: Partial<Seo>) => void;
  fallbacks: SeoFallbacks;
  onError: (message: string) => void;
};

function Counter({ value, limit }: { value: string; limit: number }) {
  const used = value.length;
  const pct = Math.min(100, (used / limit) * 100);
  // Green while there's room, amber as it fills, red once it will be truncated.
  const tone = used === 0 ? "#c9c9c2" : used > limit ? "#c1372c" : used > limit * 0.85 ? "#d19a12" : "#1f7a4d";
  return (
    <div className="adm-seo-meter">
      <div className="adm-seo-meter-bar">
        <i style={{ width: `${pct}%`, background: tone }} />
      </div>
      <span style={{ color: tone }}>
        {used}/{limit}
      </span>
    </div>
  );
}

function Check({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className={ok ? "adm-seo-pass" : "adm-seo-fail"}>
      <b>{ok ? "✓" : "•"}</b>
      {children}
    </li>
  );
}

/** Text input with an Upload button, matching the hero-image field. */
function ImageField({
  label,
  value,
  onChange,
  onError,
  hint,
  placeholder
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onError: (message: string) => void;
  hint: string;
  placeholder: string;
}) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      onChange((await uploadFile(file)).url);
    } catch (caught) {
      onError((caught as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <label className="adm-field">
      <span>{label}</span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1 }}
        />
        <label className="adm-btn adm-btn-ghost adm-btn-sm" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
          {uploading ? "Uploading…" : "Upload"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => upload(e.target.files?.[0])}
            disabled={uploading}
            style={{ display: "none" }}
          />
        </label>
      </div>
      <small>{hint}</small>
    </label>
  );
}

export default function SeoBoxes({ seo, onChange, fallbacks, onError }: Props) {
  const previewTitle = seo.metaTitle || `${fallbacks.title || "Untitled"} | ${fallbacks.siteName}`;
  const previewDescription = seo.metaDescription || fallbacks.description || "";
  const previewUrl = seo.canonicalUrl || `${fallbacks.siteName.toLowerCase().replace(/\s+/g, "")}.com${fallbacks.path}`;

  // Compared with hyphens flattened to spaces, so "small models" also matches a
  // "small-models-…" slug.
  const flatten = (value: string) => value.toLowerCase().replace(/[-_]+/g, " ");
  const keyword = flatten(seo.focusKeyword.trim());
  const has = (haystack: string) => Boolean(keyword) && flatten(haystack).includes(keyword);
  const words = fallbacks.body.trim().split(/\s+/).filter(Boolean).length;
  const firstParagraph = fallbacks.body.split(/\n{2,}/)[0] ?? "";

  const ogTitle = seo.ogTitle || previewTitle;
  const ogDescription = seo.ogDescription || previewDescription;
  const ogImage = seo.ogImage || fallbacks.image;

  function toggleDirective(directive: RobotsDirective) {
    onChange({
      advanced: seo.advanced.includes(directive)
        ? seo.advanced.filter((d) => d !== directive)
        : [...seo.advanced, directive]
    });
  }

  return (
    <>
      <div className="adm-card" data-tour="seo-search">
        <h2>Search appearance</h2>
        <p className="adm-card-note">
          How this page looks in Google, and whether search engines may index it. Every field falls back to
          the story&rsquo;s own title, standfirst and hero image when left empty.
        </p>

        <div className="adm-seo-preview">
          <p className="adm-seo-preview-label">GOOGLE PREVIEW</p>
          <div className="adm-seo-snippet">
            <span className="adm-seo-snippet-url">{previewUrl}</span>
            <h3>{previewTitle.slice(0, TITLE_LIMIT + 10)}</h3>
            <p>{previewDescription.slice(0, DESCRIPTION_LIMIT + 20) || "No meta description yet."}</p>
          </div>
          {!seo.index && <p className="adm-seo-noindex">Currently set to noindex — this page will not appear here.</p>}
        </div>

        <label className="adm-field">
          <span>FOCUS KEYPHRASE</span>
          <input
            type="text"
            value={seo.focusKeyword}
            onChange={(e) => onChange({ focusKeyword: e.target.value })}
            placeholder="ai automation strategy"
          />
          <small>The phrase you want this page to rank for. Used only for the checks below.</small>
        </label>

        {keyword && (
          <ul className="adm-seo-checks">
            <Check ok={has(previewTitle)}>Keyphrase appears in the SEO title</Check>
            <Check ok={has(previewDescription)}>Keyphrase appears in the meta description</Check>
            <Check ok={has(fallbacks.path)}>Keyphrase appears in the URL slug</Check>
            <Check ok={has(firstParagraph)}>Keyphrase appears in the opening paragraph</Check>
            <Check ok={words >= 300}>Body is at least 300 words ({words} so far)</Check>
            <Check ok={Boolean(fallbacks.image)}>Page has a hero image</Check>
          </ul>
        )}

        <label className="adm-field">
          <span>SEO TITLE</span>
          <input
            type="text"
            value={seo.metaTitle}
            onChange={(e) => onChange({ metaTitle: e.target.value })}
            placeholder={previewTitle}
          />
          <Counter value={seo.metaTitle || previewTitle} limit={TITLE_LIMIT} />
          <small>Google usually cuts off around {TITLE_LIMIT} characters.</small>
        </label>

        <label className="adm-field">
          <span>META DESCRIPTION</span>
          <textarea
            rows={3}
            style={{ minHeight: 78 }}
            value={seo.metaDescription}
            onChange={(e) => onChange({ metaDescription: e.target.value })}
            placeholder={fallbacks.description}
          />
          <Counter value={seo.metaDescription || previewDescription} limit={DESCRIPTION_LIMIT} />
          <small>Falls back to the standfirst when empty.</small>
        </label>

        <label className="adm-field">
          <span>CANONICAL URL</span>
          <input
            type="text"
            value={seo.canonicalUrl}
            onChange={(e) => onChange({ canonicalUrl: e.target.value })}
            placeholder={`Leave empty for ${fallbacks.path}`}
          />
          <small>Only set this when the same content lives at another address that should rank instead.</small>
        </label>

        <div className="adm-seo-robots">
          <p className="adm-subs-label">INDEXING</p>

          <div className="adm-grid-2">
            <label className="adm-field">
              <span>ALLOW SEARCH ENGINES TO SHOW THIS PAGE?</span>
              <select value={seo.index ? "yes" : "no"} onChange={(e) => onChange({ index: e.target.value === "yes" })}>
                <option value="yes">Yes — index</option>
                <option value="no">No — noindex</option>
              </select>
            </label>

            <label className="adm-field">
              <span>SHOULD SEARCH ENGINES FOLLOW LINKS?</span>
              <select value={seo.follow ? "yes" : "no"} onChange={(e) => onChange({ follow: e.target.value === "yes" })}>
                <option value="yes">Yes — follow</option>
                <option value="no">No — nofollow</option>
              </select>
            </label>
          </div>

          {ROBOTS_DIRECTIVES.map((directive) => (
            <label className="adm-check" key={directive}>
              <input
                type="checkbox"
                checked={seo.advanced.includes(directive)}
                onChange={() => toggleDirective(directive)}
              />
              {DIRECTIVE_LABELS[directive]}
            </label>
          ))}
        </div>
      </div>

      <div className="adm-card" data-tour="seo-social">
        <h2>Social appearance</h2>
        <p className="adm-card-note">
          What Facebook, LinkedIn, WhatsApp and X show when someone shares this page. Empty fields fall back
          to the SEO title, meta description and hero image.
        </p>

        <div className="adm-seo-preview">
          <p className="adm-seo-preview-label">SHARE PREVIEW</p>
          <div className="adm-seo-social-card">
            {ogImage ? (
              <img src={ogImage} alt="" />
            ) : (
              <div className="adm-seo-social-empty">No image yet</div>
            )}
            <div>
              <span>{previewUrl.split("/")[0]}</span>
              <h3>{ogTitle}</h3>
              <p>{ogDescription || "No description yet."}</p>
            </div>
          </div>
        </div>

        <p className="adm-subs-label">FACEBOOK, LINKEDIN &amp; WHATSAPP (OPEN GRAPH)</p>

        <label className="adm-field">
          <span>SOCIAL TITLE</span>
          <input
            type="text"
            value={seo.ogTitle}
            onChange={(e) => onChange({ ogTitle: e.target.value })}
            placeholder={previewTitle}
          />
        </label>

        <label className="adm-field">
          <span>SOCIAL DESCRIPTION</span>
          <textarea
            rows={2}
            style={{ minHeight: 64 }}
            value={seo.ogDescription}
            onChange={(e) => onChange({ ogDescription: e.target.value })}
            placeholder={previewDescription}
          />
        </label>

        <ImageField
          label="SOCIAL IMAGE"
          value={seo.ogImage}
          onChange={(url) => onChange({ ogImage: url })}
          onError={onError}
          placeholder="Leave empty to use the hero image"
          hint="1200×630 works everywhere. Paste a URL or upload a file — it's stored in the database."
        />

        <p className="adm-subs-label" style={{ marginTop: 22 }}>
          X / TWITTER
        </p>

        <label className="adm-field" style={{ maxWidth: 320 }}>
          <span>CARD TYPE</span>
          <select
            value={seo.twitterCard}
            onChange={(e) => onChange({ twitterCard: e.target.value as Seo["twitterCard"] })}
          >
            {TWITTER_CARDS.map((card) => (
              <option key={card} value={card}>
                {CARD_LABELS[card]}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-field">
          <span>X TITLE</span>
          <input
            type="text"
            value={seo.twitterTitle}
            onChange={(e) => onChange({ twitterTitle: e.target.value })}
            placeholder={ogTitle}
          />
          <small>Leave empty to reuse the social title above.</small>
        </label>

        <label className="adm-field">
          <span>X DESCRIPTION</span>
          <textarea
            rows={2}
            style={{ minHeight: 64 }}
            value={seo.twitterDescription}
            onChange={(e) => onChange({ twitterDescription: e.target.value })}
            placeholder={ogDescription}
          />
        </label>

        <ImageField
          label="X IMAGE"
          value={seo.twitterImage}
          onChange={(url) => onChange({ twitterImage: url })}
          onError={onError}
          placeholder="Leave empty to reuse the social image above"
          hint="Only worth setting when X should show something different from the social image."
        />
      </div>
    </>
  );
}
