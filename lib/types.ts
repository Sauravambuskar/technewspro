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
  /** Describes the image for screen readers and search engines. */
  imageAlt: string;
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
  /** Describes the image for screen readers and search engines. */
  imageAlt: string;
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
 * How much of the site's chrome a page keeps, in the spirit of Elementor's
 * page templates: the default reading column, an edge-to-edge landing page, or
 * a blank canvas with no header or footer at all.
 */
export const PAGE_LAYOUTS = ["default", "full-width", "canvas"] as const;
export type PageLayout = (typeof PAGE_LAYOUTS)[number];

export const PAGE_LAYOUT_LABELS: Record<PageLayout, { label: string; hint: string }> = {
  default: {
    label: "Default",
    hint: "Header, footer, breadcrumb and a centred reading column. Right for policies and long text."
  },
  "full-width": {
    label: "Full width",
    hint: "Header and footer stay, but the content runs edge to edge. Right for a landing page."
  },
  canvas: {
    label: "Canvas",
    hint: "No header, no footer, no breadcrumb — a blank page. Right for a campaign or standalone offer."
  }
};

export function isPageLayout(value: unknown): value is PageLayout {
  return typeof value === "string" && (PAGE_LAYOUTS as readonly string[]).includes(value);
}

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
  layout: PageLayout;
  /** Lets the body supply its own opening heading instead. */
  hideTitle: boolean;
  /** Id of a form to render under the body; "" for none. */
  formId: string;
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

/* --------------------------------------------------------------------- ads */

export const AD_PLACEMENTS = ["header", "article", "footer"] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export const AD_PLACEMENT_LABELS: Record<AdPlacement, { label: string; hint: string }> = {
  header: {
    label: "Header banner",
    hint: "A strip directly under the navigation, on every page. The most valuable slot — 970×90 or 728×90."
  },
  article: {
    label: "In-article",
    hint: "Between the body and the tags on an article page. Reads as part of the story, so it earns attention."
  },
  footer: {
    label: "Above the footer",
    hint: "The last thing before the footer, on every page. Cheap inventory for house ads or partners."
  }
};

/** An image creative we host, or a snippet from an ad network. */
export const AD_TYPES = ["image", "html"] as const;
export type AdType = (typeof AD_TYPES)[number];

export type Ad = {
  id: string;
  /** Internal name — readers never see it. */
  name: string;
  placement: AdPlacement;
  type: AdType;

  // type: "image"
  image: string;
  imageAlt: string;
  /** Where a click goes. Clicks are counted through /api/ads/:id/click. */
  href: string;

  // type: "html" — an AdSense/GAM snippet, or any markup
  html: string;

  enabled: boolean;
  /** YYYY-MM-DD, or "" for no bound. */
  startsAt: string;
  endsAt: string;

  impressions: number;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export function isAdPlacement(value: unknown): value is AdPlacement {
  return typeof value === "string" && (AD_PLACEMENTS as readonly string[]).includes(value);
}

export function isAdType(value: unknown): value is AdType {
  return typeof value === "string" && (AD_TYPES as readonly string[]).includes(value);
}

/** True when today falls inside the ad's optional start/end window. */
export function adIsLive(ad: Ad, today = new Date().toISOString().slice(0, 10)) {
  if (!ad.enabled) return false;
  if (ad.startsAt && today < ad.startsAt) return false;
  if (ad.endsAt && today > ad.endsAt) return false;
  return true;
}

/* ------------------------------------------------------------------- forms */

export const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "number",
  "date",
  "textarea",
  "select",
  "radio",
  "checkbox"
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Single line text",
  email: "Email address",
  tel: "Phone number",
  number: "Number",
  date: "Date",
  textarea: "Paragraph text",
  select: "Dropdown",
  radio: "Choose one",
  checkbox: "Tick box"
};

/** Types whose answers come from a fixed list the author writes. */
export const CHOICE_TYPES: FieldType[] = ["select", "radio"];

export type FormField = {
  id: string;
  type: FieldType;
  label: string;
  /** Key the answer is stored under. Derived from the label, editable. */
  name: string;
  placeholder: string;
  help: string;
  required: boolean;
  /** Only used by select and radio. */
  options: string[];
  width: "full" | "half";
};

export type FormDefinition = {
  id: string;
  name: string;
  /** Shown above the fields on the public page. */
  description: string;
  fields: FormField[];
  submitLabel: string;
  successMessage: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
};

export type FormSubmission = {
  id: string;
  formId: string;
  /** Answers keyed by field name, as submitted. */
  values: Record<string, string>;
  createdAt: string;
};

export function isFieldType(value: unknown): value is FieldType {
  return typeof value === "string" && (FIELD_TYPES as readonly string[]).includes(value);
}

/** A stable, storable key for a field, derived from its label. */
export function fieldName(label: string, fallback: string) {
  const key = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);
  return key || fallback;
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

  // Where notification email goes, and which events send it. Nothing is sent
  // until RESEND_API_KEY is configured; see lib/email.ts.
  notifyEmail: string;
  notifyOnMessage: boolean;
  notifyOnLead: boolean;
  notifyOnSubscriber: boolean;
  notifyOnFormSubmission: boolean;
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
