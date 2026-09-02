  // Shared types. Safe to import from client components — no node APIs in here.

export type ArticleStatus = "draft" | "published";

export const TWITTER_CARDS = ["summary_large_image", "summary"] as const;
export type TwitterCard = (typeof TWITTER_CARDS)[number];

/** Extra meta-robots directives, beyond plain index/follow. */
export const ROBOTS_DIRECTIVES = ["noimageindex", "noarchive", "nosnippet"] as const;
export type RobotsDirective = (typeof ROBOTS_DIRECTIVES)[number];

/**
 * Per-item search and social overrides. Every text field is optional — an empty
 * string means "fall back to the item's own title / dek / hero image", which is
 * what the public pages do when they build their metadata.
 */
export type Seo = {
  /** Used only by the editor's on-page checks; never rendered on the site. */
  focusKeyword: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  index: boolean;
  follow: boolean;
  advanced: RobotsDirective[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: TwitterCard;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
};

export function emptySeo(): Seo {
  return {
    focusKeyword: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    index: true,
    follow: true,
    advanced: [],
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    twitterCard: "summary_large_image",
    twitterTitle: "",
    twitterDescription: "",
    twitterImage: ""
  };
}

/** Rows written before the SEO box existed have no object; fill in the defaults. */
export function normaliseSeo(value: unknown): Seo {
  const base = emptySeo();
  if (!value || typeof value !== "object") return base;
  const input = value as Record<string, unknown>;

  const text = (key: keyof Seo) => (typeof input[key] === "string" ? (input[key] as string).trim() : "");
  const flag = (key: keyof Seo, fallback: boolean) =>
    typeof input[key] === "boolean" ? (input[key] as boolean) : fallback;

  return {
    ...base,
    focusKeyword: text("focusKeyword"),
    metaTitle: text("metaTitle"),
    metaDescription: text("metaDescription"),
    canonicalUrl: text("canonicalUrl"),
    index: flag("index", true),
    follow: flag("follow", true),
    advanced: Array.isArray(input.advanced)
      ? (input.advanced.filter((d) => (ROBOTS_DIRECTIVES as readonly unknown[]).includes(d)) as RobotsDirective[])
      : [],
    ogTitle: text("ogTitle"),
    ogDescription: text("ogDescription"),
    ogImage: text("ogImage"),
    twitterCard: (TWITTER_CARDS as readonly unknown[]).includes(input.twitterCard)
      ? (input.twitterCard as TwitterCard)
      : base.twitterCard,
    twitterTitle: text("twitterTitle"),
    twitterDescription: text("twitterDescription"),
    twitterImage: text("twitterImage")
  };
}

export type Article = {
  id: string;
  slug: string;
  section: string;
  /** Optional sub-category id within the section; "" when unclassified. */
  subcategory: string;
  tag: string;
  /** Narrower topic tags for internal linking/SEO. Not a replacement for section/subcategory. */
  tags: string[];
  title: string;
  dek: string;
  image: string;
  minutes: number;
  date: string;
  body: string[];
  status: ArticleStatus;
  featured: boolean;
  author: string;
  seo: Seo;
  views: number;
  createdAt: string;
  updatedAt: string;
};

export type Subcategory = {
  id: string;
  label: string;
  order: number;
  /** Short intro shown on the sub-category page so it isn't a bare archive. */
  intro: string;
};

export type Section = {
  id: string;
  label: string;
  subcategories: Subcategory[];
  eyebrow: string;
  heading: string;
  cta: string;
  /** Short intro shown on the category page so it isn't a bare archive. */
  intro: string;
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
  seo: Seo;
  views: number;
  downloads: number;
  createdAt: string;
  updatedAt: string;
};

/**
 * A standalone page — privacy policy, terms, advertise-with-us and so on.
 * Lives at the site root (/privacy-policy), so its slug must not collide with a
 * built-in route; see RESERVED_SLUGS.
 */
export type Page = {
  id: string;
  slug: string;
  title: string;
  /** Shown under the heading, and the fallback meta description. */
  summary: string;
  body: string[];
  status: ArticleStatus;
  showInNav: boolean;
  showInFooter: boolean;
  order: number;
  seo: Seo;
  author: string;
  views: number;
  createdAt: string;
  updatedAt: string;
};

/** Paths the app already owns, which a custom page may not take over. */
export const RESERVED_SLUGS = [
  "admin",
  "api",
  "about",
  "contact",
  "articles",
  "category",
  "insights",
  "resources",
  "sitemap.xml",
  "robots.txt",
  "favicon.ico"
];

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.includes(slug.trim().toLowerCase());
}

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

  // "Why Tech News Pro"
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
