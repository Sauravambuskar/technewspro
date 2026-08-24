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

export type SocialLink = { id: string; label: string; href: string; glyph: string };

export type Settings = {
  siteName: string;
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroDescription: string;
  heroCta: string;
  heroFootnote: string;
  featuredSlug: string;
  manifestoEyebrow: string;
  manifestoTitle: string;
  manifestoTitleAccent: string;
  manifestoBody: string;
  newsletterEyebrow: string;
  newsletterTitle: string;
  newsletterBlurb: string;
  footerTagline: string;
  footerCopyright: string;
  socials: SocialLink[];
  tickerEnabled: boolean;
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
