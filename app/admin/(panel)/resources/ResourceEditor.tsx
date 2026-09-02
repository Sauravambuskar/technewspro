"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, send, uploadFile } from "../../apiClient";
import SeoBoxes from "../SeoBoxes";
import {
  RESOURCE_TYPES,
  RESOURCE_TYPE_LABELS,
  emptySeo,
  normaliseSeo,
  slugify,
  type Resource,
  type ResourceType,
  type Section,
  type Seo
} from "@/lib/types";

type Draft = {
  title: string;
  slug: string;
  type: ResourceType;
  category: string;
  summary: string;
  image: string;
  imageAlt: string;
  author: string;
  date: string;
  pages: string;
  fileUrl: string;
  body: string;
  highlights: string;
  gated: boolean;
  status: "draft" | "published";
  featured: boolean;
  seo: Seo;
};

function toDraft(resource: Resource | undefined, sections: Section[]): Draft {
  if (!resource) {
    return {
      title: "",
      slug: "",
      type: "whitepaper",
      category: sections[0]?.id ?? "",
      summary: "",
      image: "",
      imageAlt: "",
      author: "Tech News Pro Research",
      date: new Date().toISOString().slice(0, 10),
      pages: "",
      fileUrl: "",
      body: "",
      highlights: "",
      gated: true,
      status: "draft",
      featured: false,
      seo: emptySeo()
    };
  }
  return {
    title: resource.title,
    slug: resource.slug,
    type: resource.type,
    category: resource.category,
    summary: resource.summary,
    image: resource.image,
    imageAlt: resource.imageAlt ?? "",
    author: resource.author,
    date: resource.date,
    pages: resource.pages ? String(resource.pages) : "",
    fileUrl: resource.fileUrl,
    body: resource.body.join("\n\n"),
    highlights: resource.highlights.join("\n"),
    gated: resource.gated,
    status: resource.status,
    featured: resource.featured,
    seo: normaliseSeo(resource.seo)
  };
}

export default function ResourceEditor({
  resource,
  sections
}: {
  resource?: Resource;
  sections: Section[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(resource, sections));
  const [slugTouched, setSlugTouched] = useState(Boolean(resource));
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

  const paragraphs = draft.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const highlights = draft.highlights.split(/\n+/).map((h) => h.trim()).filter(Boolean);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved("");
  }

  function payload() {
    return {
      title: draft.title,
      slug: draft.slug || slugify(draft.title),
      type: draft.type,
      category: draft.category,
      summary: draft.summary || draft.title,
      image: draft.image,
      imageAlt: draft.imageAlt,
      author: draft.author,
      date: draft.date,
      pages: draft.pages ? Number(draft.pages) : 0,
      fileUrl: draft.fileUrl,
      body: paragraphs,
      highlights,
      gated: draft.gated,
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
      setError("Give the resource a title before saving.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (resource) {
        await send(`/api/resources/${resource.id}`, "PATCH", payload());
        setSaved("Saved.");
        router.refresh();
      } else {
        const created = await api<Resource>("/api/resources", {
          method: "POST",
          body: JSON.stringify(payload())
        });
        router.replace(`/admin/resources/${created.id}`);
        router.refresh();
      }
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!resource) return;
    if (!window.confirm(`Delete “${resource.title}”? This cannot be undone.`)) return;

    setBusy(true);
    try {
      await send(`/api/resources/${resource.id}`, "DELETE");
      router.replace("/admin/resources");
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
        <h2>The resource</h2>
        <p className="adm-card-note">Title, summary and the copy shown on the detail page.</p>

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
          <span>SUMMARY</span>
          <textarea
            rows={3}
            style={{ minHeight: 80 }}
            value={draft.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
          <small>Shown on every card and used as the meta description.</small>
        </label>

        <label className="adm-field" data-tour="f-highlights">
          <span>WHAT&rsquo;S INSIDE — ONE BULLET PER LINE</span>
          <textarea
            rows={5}
            value={draft.highlights}
            onChange={(e) => set("highlights", e.target.value)}
            placeholder={"Benchmark data from 400 enterprises\nA costing framework you can reuse"}
          />
          <small>{highlights.length} bullet{highlights.length === 1 ? "" : "s"}</small>
        </label>

        <label className="adm-field" data-tour="f-body">
          <span>BODY</span>
          <textarea
            rows={12}
            value={draft.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder={"One paragraph per block.\n\nSeparate paragraphs with a blank line."}
          />
          <small>{paragraphs.length} paragraph{paragraphs.length === 1 ? "" : "s"}</small>
        </label>
      </div>

      <div className="adm-card" data-tour="editor-placement">
        <h2>Classification</h2>
        <p className="adm-card-note">Format and category drive the listing pages and the URL.</p>

        <div className="adm-grid-2">
          <label className="adm-field" data-tour="f-category">
            <span>FORMAT</span>
            <select value={draft.type} onChange={(e) => set("type", e.target.value as ResourceType)}>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>{RESOURCE_TYPE_LABELS[type].singular}</option>
              ))}
            </select>
          </label>

          <label className="adm-field" data-tour="f-subcategory">
            <span>CATEGORY</span>
            <select value={draft.category} onChange={(e) => set("category", e.target.value)}>
              {sections.map((section) => (
                <option key={section.id} value={section.id}>{section.label}</option>
              ))}
            </select>
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
            <small>/resources/{draft.type}/{draft.slug || slugify(draft.title) || "…"}</small>
          </label>

          <label className="adm-field">
            <span>AUTHOR / DESK</span>
            <input type="text" value={draft.author} onChange={(e) => set("author", e.target.value)} />
          </label>

          <label className="adm-field">
            <span>PUBLISH DATE</span>
            <input type="date" value={draft.date} onChange={(e) => set("date", e.target.value)} />
          </label>

          <label className="adm-field">
            <span>PAGE COUNT</span>
            <input
              type="number"
              min={0}
              value={draft.pages}
              onChange={(e) => set("pages", e.target.value)}
              placeholder="optional"
            />
          </label>
        </div>

        <label className="adm-field" data-tour="editor-image">
          <span>COVER IMAGE</span>
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
          description: draft.summary || draft.title,
          image: draft.image,
          path: `/resources/${draft.type}/${draft.slug || slugify(draft.title) || "…"}`,
          siteName: "Tech News Pro",
          body: draft.body
        }}
      />

      <div className="adm-card" data-tour="editor-publishing">
        <h2>Download &amp; publishing</h2>
        <p className="adm-card-note">
          Gated resources show the lead form first. Every submission lands under Leads.
        </p>

        <label className="adm-field" data-tour="f-file">
          <span>FILE URL (PDF)</span>
          <input
            type="text"
            value={draft.fileUrl}
            onChange={(e) => set("fileUrl", e.target.value)}
            placeholder="https://…/whitepaper.pdf"
          />
          <small>Leave empty and the on-page copy is the deliverable — the form still captures the lead.</small>
        </label>

        <label className="adm-check" data-tour="f-gated">
          <input type="checkbox" checked={draft.gated} onChange={(e) => set("gated", e.target.checked)} />
          Require the lead form before the download
        </label>

        <label className="adm-check" data-tour="f-featured">
          <input type="checkbox" checked={draft.featured} onChange={(e) => set("featured", e.target.checked)} />
          Feature in the resource center
        </label>

        <label className="adm-field" data-tour="f-status" style={{ maxWidth: 260 }}>
          <span>STATUS</span>
          <select value={draft.status} onChange={(e) => set("status", e.target.value as Draft["status"])}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <div className="adm-form-actions" data-tour="editor-save">
          <button className="adm-btn adm-btn-accent" type="submit" disabled={busy}>
            {busy ? "Saving…" : resource ? "Save changes" : "Create resource"}
          </button>
          <Link className="adm-btn adm-btn-ghost" href="/admin/resources">Back to resources</Link>
          {resource && draft.status === "published" && (
            <Link
              className="adm-btn adm-btn-ghost"
              href={`/resources/${resource.type}/${resource.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              View on site ↗
            </Link>
          )}
          {resource && (
            <button className="adm-btn adm-btn-danger" type="button" onClick={remove} disabled={busy}>
              Delete resource
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
