// Shared types. Safe to import from client components — no node APIs in here.

export type ArticleStatus = "draft" | "published";

export type Article = {
  id: string;
  slug: string;
  section: string;
  tag: string;
  title: string;
  dek: string;
  image: string;
  minutes: number;
  date: string;
  body: string[];
  status: ArticleStatus;
  featured: boolean;
  author: string;
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type Section = {
  id: string;
  label: string;
  eyebrow: string;
  heading: string;
  cta: string;
  order: number;
  showInNav: boolean;
  showOnHome: boolean;
};

export type TickerItem = {
  id: string;
  text: string;
  order: number;
  enabled: boolean;
};

export type Subscriber = {
  id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  source: string;
  createdAt: string;
};

export type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  body: string;
  read: boolean;
  createdAt: string;
};

export const RESOURCE_TYPES = ["whitepaper", "ebook", "case-study", "press-release"] as const;

export type ResourceType = (typeof RESOURCE_TYPES)[number];

export const RESOURCE_TYPE_LABELS: Record<ResourceType, { singular: string; plural: string }> = {
  whitepaper: { singular: "Whitepaper", plural: "Whitepapers" },
  ebook: { singular: "Ebook", plural: "Ebooks" },
  "case-study": { singular: "Case Study", plural: "Case Studies" },
  "press-release": { singular: "Press Release", plural: "Press Releases" }
};

export function isResourceType(value: unknown): value is ResourceType {
  return typeof value === "string" && (RESOURCE_TYPES as readonly string[]).includes(value);
}

export type Resource = {
  id: string;
  slug: string;
  type: ResourceType;
  category: string;
  title: string;
  summary: string;
  image: string;
  body: string[];
  highlights: string[];
  pages: number;
  fileUrl: string;
  /** Gated resources require the lead form before the download is revealed. */
  gated: boolean;
  status: ArticleStatus;
  featured: boolean;
  author: string;
  date: string;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  name: string;
  email: string;
  company: string;
  jobTitle: string;
  phone: string;
  intent: "download" | "syndication" | "partnership" | "general";
  resourceId: string | null;
  resourceTitle: string;
  message: string;
  createdAt: string;
};

export type SocialLink = { id: string; label: string; href: string; glyph: string };

export type ValueProp = { id: string; title: string; body: string };

export type Settings = {
  siteName: string;
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroCta: string;
  heroCtaHref: string;
  heroCtaSecondary: string;
  heroCtaSecondaryHref: string;
  heroFootnote: string;
  featuredSlug: string;
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterBlurb: string;
  footerTagline: string;
  footerCopyright: string;
  socials: SocialLink[];
  tickerEnabled: boolean;

  // Resource centre
  resourcesEyebrow: string;
  resourcesTitle: string;
  resourcesBlurb: string;

  // "Why SalesInfoPro"
  whyEyebrow: string;
  whyTitle: string;
  whyBlurb: string;
  whyPoints: ValueProp[];

  // About Us
  aboutOverview: string;
  aboutMission: string;
  aboutVision: string;
  aboutEditorialFocus: string;
  aboutIndustries: string[];

  // Contact / lead generation
  contactEyebrow: string;
  contactTitle: string;
  contactBlurb: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "editor";
  passwordHash: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export type PublicUser = Omit<AdminUser, "passwordHash">;

export function topicSlug(topic: string) {
  return topic.toLowerCase().replaceAll(" ", "-").replace("&", "and");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

export function readingMinutes(body: string[]) {
  const words = body.join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
