import { newId, now, read, update } from "./store";
import {
  isPageLayout,
  isReservedSlug,
  normaliseSeo,
  slugify,
  type ArticleStatus,
  type Page
} from "./types";

const COLLECTION = "pages";
// Standalone pages are authored, never seeded — a new site simply has none.
const seed = (): Page[] => [];

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
      hideTitle: p.hideTitle ?? false
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

export type PageInput = Partial<Omit<Page, "id" | "createdAt" | "updatedAt" | "views" | "body" | "seo">> & {
  body?: string | string[];
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
    hideTitle: input.hideTitle ?? false,
    showInNav: input.showInNav ?? false,
    showInFooter: input.showInFooter ?? true,
    order: input.order ?? existing.length + 1,
    seo: normaliseSeo(input.seo),
    author: input.author?.trim() || "Tech News Pro",
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
        hideTitle: input.hideTitle ?? page.hideTitle ?? false,
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
