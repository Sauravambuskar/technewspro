"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, send, uploadFile } from "../../apiClient";
import SeoBoxes from "../SeoBoxes";
import { emptySeo, normaliseSeo, readingMinutes, slugify, type Article, type Section, type Seo } from "@/lib/types";

type Draft = {
  title: string;
  slug: string;
  section: string;
  subcategory: string;
  tag: string;
  tags: string;
  dek: string;
  image: string;
  imageAlt: string;
  author: string;
  date: string;
  minutes: string;
  body: string;
  status: "draft" | "published";
  featured: boolean;
  seo: Seo;
};

function toDraft(article: Article | undefined, sections: Section[]): Draft {
  if (!article) {
    return {
      title: "",
      slug: "",
      section: sections[0]?.id ?? "latest",
      subcategory: "",
      tag: "",
      tags: "",
      dek: "",
      image: "",
      imageAlt: "",
      author: "Tech News Pro Editorial",
      date: new Date().toISOString().slice(0, 10),
      minutes: "",
      body: "",
      status: "draft",
      featured: false,
      seo: emptySeo()
    };
  }
  return {
    title: article.title,
    slug: article.slug,
    section: article.section,
    subcategory: article.subcategory ?? "",
    tag: article.tag,
    tags: (article.tags ?? []).join(", "),
    dek: article.dek,
    image: article.image,
    imageAlt: article.imageAlt ?? "",
    author: article.author,
    date: article.date,
    minutes: String(article.minutes),
    body: article.body.join("\n\n"),
    status: article.status,
    featured: article.featured,
    seo: normaliseSeo(article.seo)
  };
}

export default function ArticleEditor({
  article,
  sections
}: {
  article?: Article;
  sections: Section[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(article, sections));
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleImageFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadFile(file);
      set("image", uploaded.url);
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const subcategories = [...(sections.find((s) => s.id === draft.section)?.subcategories ?? [])].sort(
    (a, b) => a.order - b.order
  );
  const paragraphs = draft.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const estimate = paragraphs.length ? readingMinutes(paragraphs) : 0;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved("");
  }

  function payload() {
    return {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      section: draft.section,
      subcategory: draft.subcategory,
      tag: draft.tag || "NEWS",
      tags: draft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      dek: draft.dek || draft.title,
      image: draft.image,
      imageAlt: draft.imageAlt,
      author: draft.author,
      date: draft.date,
      minutes: draft.minutes ? Number(draft.minutes) : undefined,
      body: paragraphs,
      status: draft.status,
      featured: draft.featured,
      seo: draft.seo
    };
  }

  function setSeo(patch: Partial<Seo>) {
    setDraft((prev) => ({ ...prev, seo: { ...prev.seo, ...patch } }));
    setSaved("");
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Give the story a title before saving.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (article) {
        await send(`/api/articles/${article.id}`, "PATCH", payload());
        setSaved("Saved.");
        router.refresh();
      } else {
        const created = await api<Article>("/api/articles", {
          method: "POST",
          body: JSON.stringify(payload())
        });
        router.replace(`/admin/articles/${created.id}`);
        router.refresh();
      }
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!article) return;
    if (!window.confirm(`Delete “${article.title}”? This cannot be undone.`)) return;

    setBusy(true);
    try {
      await send(`/api/articles/${article.id}`, "DELETE");
      router.replace("/admin/articles");
      router.refresh();
    } catch (caught) {
      setError((caught as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={save}>
      {error && <p className="adm-note adm-note-error" role="alert">{error}</p>}
      {saved && <p className="adm-note adm-note-ok" role="status">{saved}</p>}

      <div className="adm-card" data-tour="editor-content">
        <h2>The story</h2>
        <p className="adm-card-note">Headline, standfirst and body copy as readers will see them.</p>

        <label className="adm-field" data-tour="f-title">
          <span>TITLE</span>
          <input
            type="text"
            value={draft.title}
            onChange={(e) => {
              set("title", e.target.value);
              if (!slugTouched) setDraft((prev) => ({ ...prev, slug: slugify(e.target.value) }));
            }}
            required
          />
        </label>

        <label className="adm-field" data-tour="f-dek">
          <span>STANDFIRST (DEK)</span>
          <textarea
            rows={2}
            style={{ minHeight: 64 }}
            value={draft.dek}
            onChange={(e) => set("dek", e.target.value)}
          />
          <small>Shown under the headline and on every card. Falls back to the title if left empty.</small>
        </label>

        <label className="adm-field" data-tour="f-body">
          <span>BODY</span>
          <textarea
            rows={16}
            value={draft.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder={"One paragraph per block.\n\nSeparate paragraphs with a blank line."}
          />
          <small>
            {paragraphs.length} paragraph{paragraphs.length === 1 ? "" : "s"}
            {estimate > 0 && ` · about a ${estimate} minute read`}
          </small>
        </label>
      </div>

      <div className="adm-card" data-tour="editor-placement">
        <h2>Placement</h2>
        <p className="adm-card-note">Where the story appears and how it is labelled.</p>

        <div className="adm-grid-2">
          <label className="adm-field" data-tour="f-category">
            <span>CATEGORY</span>
            <select
              value={draft.section}
              onChange={(e) => {
                // Sub-categories belong to one category, so reset on change.
                setDraft((prev) => ({ ...prev, section: e.target.value, subcategory: "" }));
                setSaved("");
              }}
            >
              {sections.map((section) => (
                <option key={section.id} value={section.id}>{section.label}</option>
              ))}
            </select>
          </label>

          <label className="adm-field" data-tour="f-subcategory">
            <span>SUB-CATEGORY</span>
            <select value={draft.subcategory} onChange={(e) => set("subcategory", e.target.value)}>
              <option value="">Unclassified</option>
              {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>{sub.label}</option>
              ))}
            </select>
            <small>
              {subcategories.length === 0
                ? "This category has no sub-categories yet — add them under Sections."
                : `Lists under /category/${draft.section}/${draft.subcategory || "…"}`}
            </small>
          </label>

          <label className="adm-field" data-tour="f-kicker">
            <span>KICKER / TAG</span>
            <input
              type="text"
              value={draft.tag}
              onChange={(e) => set("tag", e.target.value.toUpperCase())}
              placeholder="AI, REVIEW, SECURITY…"
            />
          </label>

          <label className="adm-field" data-tour="f-tags">
            <span>TAGS</span>
            <input
              type="text"
              value={draft.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="pricing, b2b buying, procurement"
            />
            <small>Comma-separated. Narrower topics for internal linking — not a substitute for category/sub-category.</small>
          </label>

          <label className="adm-field" data-tour="f-slug">
            <span>URL SLUG</span>
            <input
              type="text"
              value={draft.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
            <small>/articles/{draft.slug || slugify(draft.title) || "…"}</small>
          </label>

          <label className="adm-field">
            <span>AUTHOR</span>
            <input type="text" value={draft.author} onChange={(e) => set("author", e.target.value)} />
          </label>

          <label className="adm-field">
            <span>PUBLISH DATE</span>
            <input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          </label>

          <label className="adm-field">
            <span>READ TIME (MINUTES)</span>
            <input
              type="number"
              min={1}
              value={draft.minutes}
              onChange={(e) => set("minutes", e.target.value)}
              placeholder={estimate ? String(estimate) : "auto"}
            />
            <small>Leave empty to calculate it from the body.</small>
          </label>
        </div>

        <label className="adm-field" data-tour="editor-image">
          <span>HERO IMAGE</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="text"
              value={draft.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="https://images.unsplash.com/… or upload a file"
              style={{ flex: 1 }}
            />
            <label className="adm-btn adm-btn-ghost adm-btn-sm" style={{ cursor: "pointer", whiteSpace: "nowrap" }}>
              {uploading ? "Uploading…" : "Upload"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                onChange={(e) => handleImageFile(e.target.files?.[0])}
                disabled={uploading}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <small>Paste a URL, or upload a file (JPEG/PNG/WEBP/GIF/SVG, max 5MB) — it's stored in the database.</small>
        </label>


        <label className="adm-field">
          <span>IMAGE ALT TEXT</span>
          <input
            type="text"
            value={draft.imageAlt}
            onChange={(e) => set("imageAlt", e.target.value)}
            placeholder="Describe the picture for someone who can't see it"
          />
          <small>Read aloud by screen readers and used by image search. Leave empty only if the image is purely decorative.</small>
        </label>

        {draft.image && (
          <img
            src={draft.image}
            alt={draft.imageAlt}
            style={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 4, marginBottom: 16 }}
          />
        )}
      </div>

      <SeoBoxes
        seo={draft.seo}
        onChange={setSeo}
        onError={setError}
        fallbacks={{
          title: draft.title,
          description: draft.dek || draft.title,
          image: draft.image,
          path: `/articles/${draft.slug || slugify(draft.title) || "…"}`,
          siteName: "Tech News Pro",
          body: draft.body
        }}
      />

      <div className="adm-card" data-tour="editor-publishing">
        <h2>Publishing</h2>
        <p className="adm-card-note">Drafts stay off the public site until you publish them.</p>

        <label className="adm-field" data-tour="f-status" style={{ maxWidth: 260 }}>
          <span>STATUS</span>
          <select value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <label className="adm-check" data-tour="f-featured">
          <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
          Eligible for the homepage feature slot
        </label>
        <small style={{ display: "block", color: "#71737b", fontSize: 11.5, marginTop: -6 }}>
          The exact story in that slot is pinned under Site settings → Homepage.
        </small>

        <div className="adm-form-actions" data-tour="editor-save">
          <button className="adm-btn adm-btn-accent" type="submit" disabled={busy}>
            {busy ? "Saving…" : article ? "Save changes" : "Create story"}
          </button>
          <Link className="adm-btn adm-btn-ghost" href="/admin/articles">Back to articles</Link>
          {article && draft.status === "published" && (
            <Link className="adm-btn adm-btn-ghost" href={`/articles/${article.slug}`} target="_blank" rel="noreferrer">
              View on site ↗
            </Link>
          )}
          {article && (
            <button className="adm-btn adm-btn-danger" type="button" onClick={remove} disabled={busy}>
              Delete story
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
