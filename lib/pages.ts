import { newId, now, read, update } from "./store";
import {
  isPageLayout,
  isReservedSlug,
  normaliseSeo,
  PAGE_BLOCK_TYPES,
  slugify,
  type ArticleStatus,
  type PageBlock,
  type PageBuilder,
  type PageBuilderSection,
  type Page
} from "./types";

const COLLECTION = "pages";
// Standalone pages are authored, never seeded — a new site simply has none.
const seed = (): Page[] => [];

const BLOCK_TYPES = new Set<string>(PAGE_BLOCK_TYPES);
const ALIGNS = new Set(["left", "center", "right"]);
const WIDTHS = new Set(["contained", "wide", "full"]);
const PADDINGS = new Set(["none", "small", "medium", "large"]);
const THEMES = new Set(["light", "dark", "accent"]);

function cleanText(value: unknown, max = 5000) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normaliseBlock(value: unknown, index: number): PageBlock {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const type = BLOCK_TYPES.has(String(raw.type)) ? String(raw.type) as PageBlock["type"] : "text";
  const height = Number(raw.height);
  return {
    id: cleanText(raw.id, 100) || `block-${index}-${Date.now()}`,
    type,
    column: raw.column === 1 ? 1 : 0,
    eyebrow: cleanText(raw.eyebrow, 160),
    heading: cleanText(raw.heading, 500),
    text: cleanText(raw.text, 12000),
    level: raw.level === "h3" ? "h3" : "h2",
    align: ALIGNS.has(String(raw.align)) ? raw.align as PageBlock["align"] : "left",
    image: cleanText(raw.image, 2000),
    imageAlt: cleanText(raw.imageAlt, 500),
    caption: cleanText(raw.caption, 1000),
    items: Array.isArray(raw.items) ? raw.items.map((item) => cleanText(item, 1000)).filter(Boolean).slice(0, 50) : [],
    buttonLabel: cleanText(raw.buttonLabel, 160),
    buttonHref: cleanText(raw.buttonHref, 2000),
    secondaryLabel: cleanText(raw.secondaryLabel, 160),
    secondaryHref: cleanText(raw.secondaryHref, 2000),
    formId: cleanText(raw.formId, 100),
    theme: THEMES.has(String(raw.theme)) ? raw.theme as PageBlock["theme"] : "light",
    height: Number.isFinite(height) ? Math.min(400, Math.max(16, Math.round(height))) : 64
  };
}

function normaliseSection(value: unknown, index: number): PageBuilderSection {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    id: cleanText(raw.id, 100) || `section-${index}-${Date.now()}`,
    name: cleanText(raw.name, 160) || `Section ${index + 1}`,
    columns: raw.columns === 2 ? 2 : 1,
    width: WIDTHS.has(String(raw.width)) ? raw.width as PageBuilderSection["width"] : "contained",
    padding: PADDINGS.has(String(raw.padding)) ? raw.padding as PageBuilderSection["padding"] : "medium",
    background: cleanText(raw.background, 40) || "#ffffff",
    textColor: cleanText(raw.textColor, 40) || "#17181d",
    blocks: Array.isArray(raw.blocks) ? raw.blocks.slice(0, 100).map(normaliseBlock) : []
  };
}

export function normalisePageBuilder(value: unknown): PageBuilder {
  if (!value || typeof value !== "object") return { version: 1, sections: [] };
  const sections = (value as { sections?: unknown }).sections;
  return {
    version: 1,
    sections: Array.isArray(sections) ? sections.slice(0, 100).map(normaliseSection) : []
  };
}

function byOrder(a: Page, b: Page) {
  if (a.order !== b.order) return a.order - b.order;
  return a.createdAt < b.createdAt ? -1 : 1;
}

export async function allPages(): Promise<Page[]> {
  const pages = await read<Page[]>(COLLECTION, seed);
  // Rows written before the layout options existed have no field; fill in defaults.
  return pages
    .map((p) => ({
      ...p,
      seo: normaliseSeo(p.seo),
      layout: isPageLayout(p.layout) ? p.layout : "default",
      builder: normalisePageBuilder(p.builder),
      headerVisible: p.headerVisible ?? p.layout !== "canvas",
      footerVisible: p.footerVisible ?? true,
      breadcrumbVisible: p.breadcrumbVisible ?? p.layout === "default",
      hideTitle: p.hideTitle ?? false,
      formId: p.formId ?? ""
    }))
    .sort(byOrder);
}

export async function listPages(status: ArticleStatus | "all" = "published"): Promise<Page[]> {
  const pages = await allPages();
  return status === "all" ? pages : pages.filter((p) => p.status === status);
}

export async function getPageBySlug(slug: string, includeDrafts = false) {
  const pages = await allPages();
  return pages.find((p) => p.slug === slug && (includeDrafts || p.status === "published"));
}

export async function getPageById(id: string) {
  return (await allPages()).find((p) => p.id === id);
}

async function uniqueSlug(desired: string, ignoreId?: string) {
  const existing = await read<Page[]>(COLLECTION, seed);
  const base = slugify(desired) || `page-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  // Step past both reserved paths and slugs another page already holds.
  while (isReservedSlug(candidate) || existing.some((p) => p.slug === candidate && p.id !== ignoreId)) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}

export type PageInput = Partial<Omit<Page, "id" | "createdAt" | "updatedAt" | "views" | "body" | "seo" | "builder">> & {
  body?: string | string[];
  builder?: unknown;
  /** Shaped by normaliseSeo, so a partial or malformed object from the API is safe. */
  seo?: unknown;
};

function normaliseBody(body: unknown): string[] {
  if (Array.isArray(body)) return body.map((p) => String(p).trim()).filter(Boolean);
  if (typeof body === "string") return body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return [];
}

export async function createPage(input: PageInput & { title: string }): Promise<Page> {
  const existing = await allPages();
  const stamp = now();

  const page: Page = {
    id: newId(),
    slug: await uniqueSlug(input.slug || input.title),
    title: input.title.trim(),
    summary: input.summary?.trim() || "",
    body: normaliseBody(input.body),
    status: input.status === "published" ? "published" : "draft",
    layout: isPageLayout(input.layout) ? input.layout : "default",
    builder: normalisePageBuilder(input.builder),
    headerVisible: input.headerVisible ?? input.layout !== "canvas",
    footerVisible: input.footerVisible ?? true,
    breadcrumbVisible: input.breadcrumbVisible ?? input.layout === "default",
    hideTitle: input.hideTitle ?? false,
    formId: input.formId?.trim() || "",
    showInNav: input.showInNav ?? false,
    showInFooter: input.showInFooter ?? true,
    order: input.order ?? existing.length + 1,
    seo: normaliseSeo(input.seo),
    author: input.author?.trim() || "Sales Info Pro",
    views: 0,
    createdAt: stamp,
    updatedAt: stamp
  };

  await update<Page[]>(COLLECTION, seed, (current) => [...current, page]);
  return page;
}

export async function updatePage(id: string, input: PageInput): Promise<Page | undefined> {
  const slug = input.slug !== undefined ? await uniqueSlug(input.slug, id) : undefined;
  let saved: Page | undefined;

  await update<Page[]>(COLLECTION, seed, (current) =>
    current.map((page) => {
      if (page.id !== id) return page;
      saved = {
        ...page,
        ...(slug ? { slug } : {}),
        title: input.title?.trim() ?? page.title,
        summary: input.summary?.trim() ?? page.summary,
        body: input.body !== undefined ? normaliseBody(input.body) : page.body,
        status: input.status ?? page.status,
        layout: isPageLayout(input.layout) ? input.layout : (page.layout ?? "default"),
        builder: input.builder !== undefined ? normalisePageBuilder(input.builder) : normalisePageBuilder(page.builder),
        headerVisible: input.headerVisible ?? page.headerVisible ?? page.layout !== "canvas",
        footerVisible: input.footerVisible ?? page.footerVisible ?? true,
        breadcrumbVisible: input.breadcrumbVisible ?? page.breadcrumbVisible ?? page.layout === "default",
        hideTitle: input.hideTitle ?? page.hideTitle ?? false,
        formId: input.formId !== undefined ? input.formId.trim() : (page.formId ?? ""),
        showInNav: input.showInNav ?? page.showInNav,
        showInFooter: input.showInFooter ?? page.showInFooter,
        order: input.order ?? page.order,
        seo: input.seo !== undefined ? normaliseSeo(input.seo) : normaliseSeo(page.seo),
        author: input.author?.trim() ?? page.author,
        updatedAt: now()
      };
      return saved;
    })
  );

  return saved;
}

export async function deletePage(id: string): Promise<boolean> {
  let removed = false;
  await update<Page[]>(COLLECTION, seed, (current) =>
    current.filter((page) => {
      if (page.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

export async function recordPageView(slug: string) {
  await update<Page[]>(COLLECTION, seed, (current) =>
    current.map((p) => (p.slug === slug ? { ...p, views: p.views + 1 } : p))
  );
}
