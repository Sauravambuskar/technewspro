"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, send } from "../../apiClient";
import SeoBoxes from "../SeoBoxes";
import {
  PAGE_LAYOUTS,
  PAGE_LAYOUT_LABELS,
  emptySeo,
  isPageLayout,
  isReservedSlug,
  normaliseSeo,
  slugify,
  type FormDefinition,
  type Page,
  type PageLayout,
  type Seo
} from "@/lib/types";

type Draft = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  author: string;
  status: "draft" | "published";
  layout: PageLayout;
  hideTitle: boolean;
  formId: string;
  showInNav: boolean;
  showInFooter: boolean;
  seo: Seo;
};

/** Little wireframe of what each template keeps, so the choice is visible. */
function LayoutPreview({ layout }: { layout: PageLayout }) {
  return (
    <span className={`adm-layout-preview adm-layout-${layout}`} aria-hidden="true">
      <i className="adm-lp-header" />
      <i className="adm-lp-body" />
      <i className="adm-lp-footer" />
    </span>
  );
}

function toDraft(page: Page | undefined): Draft {
  if (!page) {
    return {
      title: "",
      slug: "",
      summary: "",
      body: "",
      author: "Tech News Pro",
      status: "draft",
      layout: "default",
      hideTitle: false,
      formId: "",
      showInNav: false,
      showInFooter: true,
      seo: emptySeo()
    };
  }
  return {
    title: page.title,
    slug: page.slug,
    summary: page.summary,
    body: page.body.join("\n\n"),
    author: page.author,
    status: page.status,
    layout: isPageLayout(page.layout) ? page.layout : "default",
    hideTitle: page.hideTitle ?? false,
    formId: page.formId ?? "",
    showInNav: page.showInNav,
    showInFooter: page.showInFooter,
    seo: normaliseSeo(page.seo)
  };
}

export default function PageEditor({ page, forms = [] }: { page?: Page; forms?: FormDefinition[] }) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => toDraft(page));
  const [slugTouched, setSlugTouched] = useState(Boolean(page));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const paragraphs = draft.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const effectiveSlug = draft.slug || slugify(draft.title);
  const clashes = Boolean(effectiveSlug) && isReservedSlug(effectiveSlug);

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved("");
  }

  function setSeo(patch: Partial<Seo>) {
    setDraft((prev) => ({ ...prev, seo: { ...prev.seo, ...patch } }));
    setSaved("");
  }

  function payload() {
    return {
      title: draft.title,
      slug: effectiveSlug,
      summary: draft.summary,
      body: paragraphs,
      author: draft.author,
      status: draft.status,
      layout: draft.layout,
      hideTitle: draft.hideTitle,
      formId: draft.formId,
      showInNav: draft.showInNav,
      showInFooter: draft.showInFooter,
      seo: draft.seo
    };
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.title.trim()) {
      setError("Give the page a title before saving.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      if (page) {
        await send(`/api/pages/${page.id}`, "PATCH", payload());
        setSaved("Saved.");
        router.refresh();
      } else {
        const created = await api<Page>("/api/pages", { method: "POST", body: JSON.stringify(payload()) });
        router.replace(`/admin/pages/${created.id}`);
        router.refresh();
      }
    } catch (caught) {
      setError((caught as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!page) return;
    if (!window.confirm(`Delete “${page.title}”? This cannot be undone.`)) return;

    setBusy(true);
    try {
      await send(`/api/pages/${page.id}`, "DELETE");
      router.replace("/admin/pages");
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
        <h2>The page</h2>
        <p className="adm-card-note">
          A standalone page — a privacy policy, terms, an advertise-with-us page. It sits on its own at the
          site root, outside the categories.
        </p>

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
          <span>INTRO</span>
          <textarea
            rows={2}
            style={{ minHeight: 64 }}
            value={draft.summary}
            onChange={(e) => set("summary", e.target.value)}
          />
          <small>Shown under the heading, and used as the meta description if you don&rsquo;t write one.</small>
        </label>

        <label className="adm-field" data-tour="f-body">
          <span>BODY</span>
          <textarea
            rows={18}
            value={draft.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder={"One paragraph per block.\n\nSeparate paragraphs with a blank line."}
          />
          <small>{paragraphs.length} paragraph{paragraphs.length === 1 ? "" : "s"}</small>
        </label>
      </div>

      <div className="adm-card" data-tour="editor-layout">
        <h2>Layout</h2>
        <p className="adm-card-note">
          How much of the site wraps around this page. Pick the reading column for text, or strip the chrome
          away for a landing page.
        </p>

        <div className="adm-layout-picker">
          {PAGE_LAYOUTS.map((option) => (
            <label className={`adm-layout-option${draft.layout === option ? " adm-layout-active" : ""}`} key={option}>
              <input
                type="radio"
                name="page-layout"
                value={option}
                checked={draft.layout === option}
                onChange={() => set("layout", option)}
              />
              <LayoutPreview layout={option} />
              <b>{PAGE_LAYOUT_LABELS[option].label}</b>
              <small>{PAGE_LAYOUT_LABELS[option].hint}</small>
            </label>
          ))}
        </div>

        <label className="adm-check" style={{ marginTop: 18 }}>
          <input type="checkbox" checked={draft.hideTitle} onChange={(e) => set("hideTitle", e.target.checked)} />
          Hide the page title and intro
        </label>
        <small style={{ display: "block", color: "#71737b", fontSize: 11.5, marginTop: -6 }}>
          Useful when the body opens with its own headline. The title is still used for the tab, search results
          and menus.
        </small>
      </div>

      <div className="adm-card" data-tour="editor-form">
        <h2>Form</h2>
        <p className="adm-card-note">
          Drop a form built under <Link href="/admin/forms">Forms</Link> at the bottom of this page. Responses
          land there, not in your inbox.
        </p>

        <label className="adm-field" style={{ maxWidth: 420, marginBottom: 0 }}>
          <span>ATTACHED FORM</span>
          <select value={draft.formId} onChange={(e) => set("formId", e.target.value)}>
            <option value="">None</option>
            {forms.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
                {f.status === "draft" ? " (draft — hidden until published)" : ""}
              </option>
            ))}
          </select>
          <small>
            {forms.length === 0
              ? "No forms built yet — create one under Forms first."
              : "A draft form stays hidden even on a published page."}
          </small>
        </label>
      </div>

      <div className="adm-card" data-tour="editor-placement">
        <h2>Address &amp; placement</h2>
        <p className="adm-card-note">Where the page lives and which menus link to it.</p>

        <div className="adm-grid-2">
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
            <small>
              {clashes
                ? `“${effectiveSlug}” is used by the site itself — saving will pick the next free slug.`
                : `/${effectiveSlug || "…"}`}
            </small>
          </label>

          <label className="adm-field">
            <span>AUTHOR / OWNER</span>
            <input type="text" value={draft.author} onChange={(e) => set("author", e.target.value)} />
          </label>
        </div>

        <label className="adm-check">
          <input type="checkbox" checked={draft.showInNav} onChange={(e) => set("showInNav", e.target.checked)} />
          Show in the top navigation
        </label>

        <label className="adm-check">
          <input
            type="checkbox"
            checked={draft.showInFooter}
            onChange={(e) => set("showInFooter", e.target.checked)}
          />
          Show in the footer
        </label>
        <small style={{ display: "block", color: "#71737b", fontSize: 11.5, marginTop: -6 }}>
          Legal and policy pages usually belong in the footer only.
        </small>
      </div>

      <SeoBoxes
        seo={draft.seo}
        onChange={setSeo}
        onError={setError}
        fallbacks={{
          title: draft.title,
          description: draft.summary || draft.title,
          image: "",
          path: `/${effectiveSlug || "…"}`,
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

        <div className="adm-form-actions" data-tour="editor-save">
          <button className="adm-btn adm-btn-accent" type="submit" disabled={busy}>
            {busy ? "Saving…" : page ? "Save changes" : "Create page"}
          </button>
          <Link className="adm-btn adm-btn-ghost" href="/admin/pages">Back to pages</Link>
          {page && draft.status === "published" && (
            <Link className="adm-btn adm-btn-ghost" href={`/${page.slug}`} target="_blank" rel="noreferrer">
              View on site ↗
            </Link>
          )}
          {page && (
            <button className="adm-btn adm-btn-danger" type="button" onClick={remove} disabled={busy}>
              Delete page
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
