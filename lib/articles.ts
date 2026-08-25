import { newId, now, read, update } from "./store";
import { seedArticles } from "./seed";
import { readingMinutes, slugify, type Article, type ArticleStatus } from "./types";

const COLLECTION = "articles";
const seed = () => seedArticles();

function byNewest(a: Article, b: Article) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}

export async function allArticles(): Promise<Article[]> {
  const articles = await read<Article[]>(COLLECTION, seed);
  // Rows written before sub-categories existed have no field; treat as unclassified.
  return articles.map((a) => ({ ...a, subcategory: a.subcategory ?? "" })).sort(byNewest);
}

export type ArticleQuery = {
  section?: string;
  subcategory?: string;
  status?: ArticleStatus | "all";
  search?: string;
  limit?: number;
};

export async function listArticles(query: ArticleQuery = {}): Promise<Article[]> {
  const { section, subcategory, status = "published", search, limit } = query;
  const term = search?.trim().toLowerCase();

  let items = await allArticles();
  if (status !== "all") items = items.filter((a) => a.status === status);
  if (section) items = items.filter((a) => a.section === section);
  if (subcategory) items = items.filter((a) => a.subcategory === subcategory);
  if (term) {
    items = items.filter((a) =>
      [a.title, a.dek, a.tag, a.author, a.body.join(" ")].some((field) => field.toLowerCase().includes(term))
    );
  }
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

export async function getArticleBySlug(slug: string, includeDrafts = false) {
  const items = await allArticles();
  return items.find((a) => a.slug === slug && (includeDrafts || a.status === "published"));
}

export async function getArticleById(id: string) {
  const items = await allArticles();
  return items.find((a) => a.id === id);
}

export async function getFeaturedArticle(preferredSlug?: string) {
  const published = await listArticles({ status: "published" });
  if (preferredSlug) {
    const match = published.find((a) => a.slug === preferredSlug);
    if (match) return match;
  }
  return published.find((a) => a.featured) ?? published[0];
}

async function uniqueSlug(desired: string, ignoreId?: string) {
  const existing = await read<Article[]>(COLLECTION, seed);
  const base = slugify(desired) || `story-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (existing.some((a) => a.slug === candidate && a.id !== ignoreId)) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}

export type ArticleInput = Partial<Omit<Article, "id" | "createdAt" | "updatedAt" | "views" | "body">> & {
  body?: string | string[];
};

function normaliseBody(body: unknown): string[] {
  if (Array.isArray(body)) return body.map((p) => String(p).trim()).filter(Boolean);
  if (typeof body === "string") {
    return body
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
  }
  return [];
}

export async function createArticle(input: ArticleInput & { title: string }): Promise<Article> {
  const body = normaliseBody(input.body);
  const stamp = now();
  const article: Article = {
    id: newId(),
    slug: await uniqueSlug(input.slug || input.title),
    section: input.section || "latest",
    subcategory: input.subcategory?.trim() || "",
    tag: (input.tag || "NEWS").toUpperCase(),
    title: input.title.trim(),
    dek: (input.dek || input.title).trim(),
    image: input.image?.trim() || "",
    minutes: input.minutes && input.minutes > 0 ? input.minutes : readingMinutes(body),
    date: input.date || stamp.slice(0, 10),
    body,
    status: input.status === "published" ? "published" : "draft",
    featured: Boolean(input.featured),
    author: input.author?.trim() || "Tech News Pro Editorial",
    views: 0,
    createdAt: stamp,
    updatedAt: stamp
  };

  await update<Article[]>(COLLECTION, seed, (current) => [article, ...current]);
  return article;
}

export async function updateArticle(id: string, input: ArticleInput): Promise<Article | undefined> {
  const slug = input.slug !== undefined ? await uniqueSlug(input.slug, id) : undefined;
  let saved: Article | undefined;

  await update<Article[]>(COLLECTION, seed, (current) =>
    current.map((article) => {
      if (article.id !== id) return article;
      const body = input.body !== undefined ? normaliseBody(input.body) : article.body;
      saved = {
        ...article,
        ...(slug ? { slug } : {}),
        section: input.section ?? article.section,
        subcategory: input.subcategory !== undefined ? input.subcategory.trim() : (article.subcategory ?? ""),
        tag: input.tag ? input.tag.toUpperCase() : article.tag,
        title: input.title?.trim() ?? article.title,
        dek: input.dek?.trim() ?? article.dek,
        image: input.image?.trim() ?? article.image,
        minutes: input.minutes && input.minutes > 0 ? input.minutes : readingMinutes(body),
        date: input.date ?? article.date,
        body,
        status: input.status ?? article.status,
        featured: input.featured ?? article.featured,
        author: input.author?.trim() ?? article.author,
        updatedAt: now()
      };
      return saved;
    })
  );

  return saved;
}

export async function deleteArticle(id: string): Promise<boolean> {
  let removed = false;
  await update<Article[]>(COLLECTION, seed, (current) =>
    current.filter((article) => {
      if (article.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

export async function recordView(slug: string) {
  await update<Article[]>(COLLECTION, seed, (current) =>
    current.map((a) => (a.slug === slug ? { ...a, views: a.views + 1 } : a))
  );
}
