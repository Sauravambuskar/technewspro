import { newId } from "../store";
import type { Article, Resource, ResourceType, Section, Settings, TickerItem } from "../types";
import { rawArticles } from "./raw-articles";
import { rawResources } from "./raw-resources";
import { rawTicker } from "./raw-ticker";

export function seedSections(): Section[] {
  return [
    { id: "ai-and-automation", label: "AI & Automation", eyebrow: "THE AI ECONOMY", heading: "AI & Automation.", cta: "See all coverage", order: 1, showInNav: true, showOnHome: true },
    { id: "financial-intelligence", label: "Financial Intelligence", eyebrow: "CORPORATE FINANCE", heading: "Financial Intelligence.", cta: "See all coverage", order: 2, showInNav: true, showOnHome: true },
    { id: "information-technology", label: "Information Technology", eyebrow: "DIGITAL INFRASTRUCTURE", heading: "Information Technology.", cta: "See all coverage", order: 3, showInNav: true, showOnHome: true },
    { id: "sales-and-revenue", label: "Sales & Revenue", eyebrow: "SALES STRATEGY", heading: "Sales & Revenue.", cta: "See all coverage", order: 4, showInNav: true, showOnHome: true },
    { id: "marketing-and-brand", label: "Marketing & Brand", eyebrow: "BRAND & PERFORMANCE", heading: "Marketing & Brand.", cta: "See all coverage", order: 5, showInNav: true, showOnHome: true }
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
    featured: article.slug === "pipeline-coverage-is-lying-to-you",
    author: "SalesInfoPro Editorial",
    views: 0,
    createdAt: stamp,
    updatedAt: stamp
  }));
}

export function seedResources(): Resource[] {
  const stamp = new Date().toISOString();
  return rawResources.map((resource) => ({
    id: newId(),
    slug: resource.slug,
    type: resource.type as ResourceType,
    category: resource.category,
    title: resource.title,
    summary: resource.summary,
    image: resource.image,
    body: [...resource.body],
    highlights: [...resource.highlights],
    pages: resource.pages,
    fileUrl: "",
    gated: resource.gated,
    status: "published" as const,
    featured: resource.slug === "the-2026-ai-automation-readiness-benchmark",
    author: "SalesInfoPro Research",
    date: resource.date,
    views: 0,
    downloads: 0,
    createdAt: stamp,
    updatedAt: stamp
  }));
}

export function seedTicker(): TickerItem[] {
  return rawTicker.map((text, index) => ({ id: newId(), text, order: index + 1, enabled: true }));
}

export function seedSettings(): Settings {
  return {
    siteName: "SalesInfoPro",
    metaTitle: "SalesInfoPro | Business intelligence for growth leaders",
    metaDescription:
      "Research-driven insight on AI, corporate finance, technology, sales and marketing for a global business audience.",

    heroEyebrow: "BUSINESS INTELLIGENCE",
    heroTitle: "Decisions need",
    heroTitleAccent: "better inputs.",
    heroDescription:
      "Research-driven coverage of the AI economy, corporate finance, digital infrastructure, revenue strategy and brand — written for the people accountable for the outcome.",
    heroCta: "Explore resources",
    heroCtaHref: "/resources",
    heroCtaSecondary: "Contact us",
    heroCtaSecondaryHref: "/contact",
    heroFootnote: "INDEPENDENT B2B RESEARCH",
    featuredSlug: "pipeline-coverage-is-lying-to-you",

    manifestoEyebrow: "THE SALESINFOPRO POINT OF VIEW",
    manifestoTitle: "Less noise.",
    manifestoTitleAccent: "More evidence.",
    manifestoBody:
      "We publish for operators who have to defend a decision after they make it — with the research, benchmarks and case detail that argument needs.",

    newsletterEyebrow: "THE WEEKLY BRIEF",
    newsletterTitle: "One useful email.\nEvery Tuesday.",
    newsletterBlurb:
      "The week's most consequential shifts across AI, finance, technology and revenue — condensed, with the sources.",

    footerTagline: "Research-driven intelligence for a global business audience.",
    footerCopyright: "© 2026 SalesInfoPro. All rights reserved.",
    socials: [
      { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com", glyph: "in" },
      { id: "x", label: "X (Twitter)", href: "https://x.com", glyph: "𝕏" },
      { id: "rss", label: "RSS", href: "/api/rss", glyph: "◎" }
    ],
    tickerEnabled: true,

    resourcesEyebrow: "RESOURCE CENTER",
    resourcesTitle: "Research you can act on.",
    resourcesBlurb:
      "Whitepapers, ebooks, case studies and announcements from the SalesInfoPro research desk.",

    whyEyebrow: "WHY SALESINFOPRO",
    whyTitle: "Built for operators,\nnot for headlines.",
    whyBlurb:
      "We are read by the people who have to sign off on the decision — and we write for that standard.",
    whyPoints: [
      {
        id: "expertise",
        title: "Industry expertise",
        body: "Desks led by people who have run the functions they cover — finance, technology, revenue and brand — not generalists briefed a week before publication."
      },
      {
        id: "research",
        title: "Research-driven content",
        body: "Benchmarks, surveys and primary interviews behind every major piece, with the method stated plainly so you can judge it for yourself."
      },
      {
        id: "trust",
        title: "Trusted insights",
        body: "No pay-for-placement coverage. Sponsored material is labelled unambiguously and never sits inside the editorial run."
      },
      {
        id: "audience",
        title: "Global business audience",
        body: "Read across North America, EMEA and APAC by senior operators in enterprise finance, IT, sales and marketing functions."
      }
    ],

    aboutOverview:
      "SalesInfoPro is an independent business intelligence publisher covering the AI economy, corporate finance, digital infrastructure, revenue strategy and brand. We serve senior operators at enterprises and high-growth companies who need evidence rather than commentary.",
    aboutMission:
      "To give business leaders the clearest possible picture of the forces reshaping their function — early enough to act on, and rigorous enough to defend.",
    aboutVision:
      "A business press that is judged on the quality of the decisions it informs, not on the traffic it attracts.",
    aboutEditorialFocus:
      "Every desk works to the same standard: state the method, show the evidence, and be explicit about uncertainty. We publish fewer pieces than our peers and stand behind each one. Corrections are issued prominently and promptly.",
    aboutIndustries: [
      "Enterprise technology & SaaS",
      "Banking & financial services",
      "Manufacturing & industrials",
      "Healthcare & life sciences",
      "Professional services",
      "Retail & consumer",
      "Telecommunications",
      "Energy & utilities"
    ],

    contactEyebrow: "CONTACT & PARTNERSHIPS",
    contactTitle: "Start a conversation.",
    contactBlurb:
      "Editorial enquiries, content syndication, research partnerships and speaking requests all reach the same desk — and a person reads every one.",
    contactEmail: "hello@salesinfopro.com",
    contactPhone: "+1 (415) 555-0142",
    contactAddress: "One Market Street, Suite 3600, San Francisco, CA 94105"
  };
}
