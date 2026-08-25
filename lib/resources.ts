import { newId, now, read, update } from "./store";
import { seedResources } from "./seed";
import { isResourceType, slugify, type ArticleStatus, type Resource, type ResourceType } from "./types";

const COLLECTION = "resources";
const seed = () => seedResources();

function byNewest(a: Resource, b: Resource) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : -1;
}

export async function allResources(): Promise<Resource[]> {
  const resources = await read<Resource[]>(COLLECTION, seed);
  return [...resources].sort(byNewest);
}

export type ResourceQuery = {
  type?: ResourceType;
  category?: string;
  status?: ArticleStatus | "all";
  search?: string;
  limit?: number;
};

export async function listResources(query: ResourceQuery = {}): Promise<Resource[]> {
  const { type, category, status = "published", search, limit } = query;
  const term = search?.trim().toLowerCase();

  let items = await allResources();
  if (status !== "all") items = items.filter((r) => r.status === status);
  if (type) items = items.filter((r) => r.type === type);
  if (category) items = items.filter((r) => r.category === category);
  if (term) {
    items = items.filter((r) =>
      [r.title, r.summary, r.author, r.highlights.join(" "), r.body.join(" ")].some((field) =>
        field.toLowerCase().includes(term)
      )
    );
  }
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

export async function getResourceBySlug(slug: string, includeDrafts = false) {
  const items = await allResources();
  return items.find((r) => r.slug === slug && (includeDrafts || r.status === "published"));
}

export async function getResourceById(id: string) {
  return (await allResources()).find((r) => r.id === id);
}

export async function getFeaturedResource(): Promise<Resource | undefined> {
  const published = await listResources({ status: "published" });
  return published.find((r) => r.featured) ?? published[0];
}

/** Counts per resource type, used by the listing filters and the resource centre. */
export async function resourceCounts(): Promise<Record<string, number>> {
  const published = await listResources({ status: "published" });
  return published.reduce<Record<string, number>>((counts, resource) => {
    counts[resource.type] = (counts[resource.type] ?? 0) + 1;
    return counts;
  }, {});
}

async function uniqueSlug(desired: string, ignoreId?: string) {
  const existing = await read<Resource[]>(COLLECTION, seed);
  const base = slugify(desired) || `resource-${Date.now()}`;
  let candidate = base;
  let suffix = 2;
  while (existing.some((r) => r.slug === candidate && r.id !== ignoreId)) {
    candidate = `${base}-${suffix++}`;
  }
  return candidate;
}

export type ResourceInput = Partial<Omit<Resource, "id" | "createdAt" | "updatedAt" | "views" | "downloads" | "body" | "highlights">> & {
  body?: string | string[];
  highlights?: string | string[];
};

function toLines(value: unknown, splitOn: RegExp): string[] {
  if (Array.isArray(value)) return value.map((line) => String(line).trim()).filter(Boolean);
  if (typeof value === "string") return value.split(splitOn).map((line) => line.trim()).filter(Boolean);
  return [];
}

const normaliseBody = (value: unknown) => toLines(value, /\n{2,}/);
const normaliseHighlights = (value: unknown) => toLines(value, /\n+/);

export async function createResource(input: ResourceInput & { title: string }): Promise<Resource> {
  const stamp = now();
  const resource: Resource = {
    id: newId(),
    slug: await uniqueSlug(input.slug || input.title),
    type: isResourceType(input.type) ? input.type : "whitepaper",
    category: input.category || "ai-and-automation",
    title: input.title.trim(),
    summary: (input.summary || input.title).trim(),
    image: input.image?.trim() || "",
    body: normaliseBody(input.body),
    highlights: normaliseHighlights(input.highlights),
    pages: input.pages && input.pages > 0 ? input.pages : 0,
    fileUrl: input.fileUrl?.trim() || "",
    gated: input.gated ?? true,
    status: input.status === "published" ? "published" : "draft",
    featured: Boolean(input.featured),
    author: input.author?.trim() || "Tech News Pro Research",
    date: input.date || stamp.slice(0, 10),
    views: 0,
    downloads: 0,
    createdAt: stamp,
    updatedAt: stamp
  };

  await update<Resource[]>(COLLECTION, seed, (current) => [resource, ...current]);
  return resource;
}

export async function updateResource(id: string, input: ResourceInput): Promise<Resource | undefined> {
  const slug = input.slug !== undefined ? await uniqueSlug(input.slug, id) : undefined;
  let saved: Resource | undefined;

  await update<Resource[]>(COLLECTION, seed, (current) =>
    current.map((resource) => {
      if (resource.id !== id) return resource;
      saved = {
        ...resource,
        ...(slug ? { slug } : {}),
        type: isResourceType(input.type) ? input.type : resource.type,
        category: input.category ?? resource.category,
        title: input.title?.trim() ?? resource.title,
        summary: input.summary?.trim() ?? resource.summary,
        image: input.image?.trim() ?? resource.image,
        body: input.body !== undefined ? normaliseBody(input.body) : resource.body,
        highlights: input.highlights !== undefined ? normaliseHighlights(input.highlights) : resource.highlights,
        pages: input.pages !== undefined && input.pages >= 0 ? input.pages : resource.pages,
        fileUrl: input.fileUrl?.trim() ?? resource.fileUrl,
        gated: input.gated ?? resource.gated,
        status: input.status ?? resource.status,
        featured: input.featured ?? resource.featured,
        author: input.author?.trim() ?? resource.author,
        date: input.date ?? resource.date,
        updatedAt: now()
      };
      return saved;
    })
  );

  return saved;
}

export async function deleteResource(id: string): Promise<boolean> {
  let removed = false;
  await update<Resource[]>(COLLECTION, seed, (current) =>
    current.filter((resource) => {
      if (resource.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

export async function recordResourceView(slug: string) {
  await update<Resource[]>(COLLECTION, seed, (current) =>
    current.map((r) => (r.slug === slug ? { ...r, views: r.views + 1 } : r))
  );
}

export async function recordDownload(id: string) {
  await update<Resource[]>(COLLECTION, seed, (current) =>
    current.map((r) => (r.id === id ? { ...r, downloads: r.downloads + 1 } : r))
  );
}
