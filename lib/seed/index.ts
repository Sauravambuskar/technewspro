import { newId } from "../store";
import type { Article, Section, Settings, TickerItem } from "../types";
import { rawArticles } from "./raw-articles";
import { rawTicker } from "./raw-ticker";

export function seedSections(): Section[] {
  return [
    { id: "latest", label: "The Brief", eyebrow: "LATEST INTELLIGENCE", heading: "The brief.", cta: "View all stories", order: 1, showInNav: false, showOnHome: true },
    { id: "ai-and-data", label: "AI & Data", eyebrow: "IDEAS AT WORK", heading: "AI & Data.", cta: "See all stories", order: 2, showInNav: true, showOnHome: false },
    { id: "startups", label: "Startups", eyebrow: "BUILDERS & FOUNDERS", heading: "Startups.", cta: "See all stories", order: 3, showInNav: true, showOnHome: true },
    { id: "gadgets", label: "Gadgets", eyebrow: "FIELD TESTED", heading: "Worth your time.", cta: "See all reviews", order: 4, showInNav: true, showOnHome: true },
    { id: "cybersecurity", label: "Cybersecurity", eyebrow: "STAYING SAFE", heading: "Cybersecurity.", cta: "See all stories", order: 5, showInNav: true, showOnHome: true },
    { id: "future-of-work", label: "Future of Work", eyebrow: "HOW WE WORK NOW", heading: "Future of work.", cta: "See all stories", order: 6, showInNav: true, showOnHome: true }
  ];
}

export function seedArticles(): Article[] {
  const stamp = new Date().toISOString();
  return rawArticles.map((article) => ({
    id: newId(),
    slug: article.slug,
    section: article.section,
    tag: article.tag,
    title: article.title,
    dek: article.dek,
    image: article.image,
    minutes: article.minutes,
    date: article.date,
    body: [...article.body],
    status: "published" as const,
    featured: article.slug === "technology-is-only-useful-when-it-gives-us-room-to-think",
    author: "TechNewsInfoPro Staff",
    views: 0,
    createdAt: stamp,
    updatedAt: stamp
  }));
}

export function seedTicker(): TickerItem[] {
  return rawTicker.map((text, index) => ({ id: newId(), text, order: index + 1, enabled: true }));
}

export function seedSettings(): Settings {
  return {
    siteName: "TechNewsInfoPro",
    metaTitle: "TechNewsInfoPro | Technology, decoded",
    metaDescription: "Clear, intelligent coverage of the ideas and products shaping tomorrow.",
    heroEyebrow: "THE SIGNAL / 08.24.26",
    heroTitle: "Tech moves fast.",
    heroTitleAccent: "Stay ahead.",
    heroDescription:
      "The people, products and ideas defining what's next — selected with curiosity and explained without the noise.",
    heroCta: "Explore today's briefing",
    heroFootnote: "INDEPENDENT TECH JOURNALISM",
    featuredSlug: "technology-is-only-useful-when-it-gives-us-room-to-think",
    manifestoEyebrow: "THE TECHNEWSINFOPRO POINT OF VIEW",
    manifestoTitle: "Less hype.",
    manifestoTitleAccent: "More clarity.",
    manifestoBody:
      "We follow technology wherever it takes us — from a founder's rough first prototype to the tools that reshape our ordinary days.",
    newsletterEyebrow: "THE WEEKLY SIGNAL",
    newsletterTitle: "One smart email.\nEvery Sunday.",
    newsletterBlurb: "A thoughtful look at the week in technology, with none of the clutter.",
    footerTagline: "Independent journalism for the curious mind.",
    footerCopyright: "© 2026 TechNewsInfoPro. Made for tomorrow.",
    socials: [
      { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com", glyph: "in" },
      { id: "x", label: "X (Twitter)", href: "https://x.com", glyph: "𝕏" },
      { id: "threads", label: "Threads", href: "https://threads.net", glyph: "◎" }
    ],
    tickerEnabled: true
  };
}
