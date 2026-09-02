import { newId } from "../store";
import { emptySeo, type Article, type Resource, type ResourceType, type Section, type Settings, type TickerItem } from "../types";
import { rawArticles } from "./raw-articles";
import { rawArticlesMore } from "./raw-articles-more";
import { rawResources } from "./raw-resources";
import { rawTicker } from "./raw-ticker";
import { ARTICLE_SUBCATEGORY, subcategoriesFor, subcategoryIdFor } from "./subcategories";

export function seedSections(): Section[] {
  return [
    {
      id: "ai-and-automation",
      subcategories: subcategoriesFor("ai-and-automation"),
      label: "AI & Automation",
      eyebrow: "THE AI ECONOMY",
      heading: "AI & Automation.",
      intro:
        "Enterprise coverage of how organisations design, govern and scale AI agents and automation — from strategy and generative AI adoption to the operational and ethical questions that come with putting a model in charge of real work. Written for operators funding, building and reviewing automation programmes, not for AI hype.",
      cta: "See all coverage",
      order: 1,
      showInNav: true,
      showOnHome: true
    },
    {
      id: "finance-and-fintech",
      subcategories: subcategoriesFor("finance-and-fintech"),
      label: "Finance & FinTech",
      eyebrow: "CORPORATE FINANCE",
      heading: "Finance & FinTech.",
      intro:
        "Analysis for finance leaders and fintech operators navigating investment, payments, compliance and capital strategy in a slower-credit environment. Coverage spans corporate finance, digital payments infrastructure, venture funding and the risk and market-analysis work behind every funding decision.",
      cta: "See all coverage",
      order: 2,
      showInNav: true,
      showOnHome: true
    },
    {
      id: "technology-and-it",
      subcategories: subcategoriesFor("technology-and-it"),
      label: "Technology & IT",
      eyebrow: "DIGITAL INFRASTRUCTURE",
      heading: "Technology & IT.",
      intro:
        "Reporting on the infrastructure, security and platform decisions that determine whether enterprise technology programmes ship on budget. Coverage runs from cloud and DevOps to cybersecurity, SaaS procurement and the enterprise-software integration work most transformations underestimate.",
      cta: "See all coverage",
      order: 3,
      showInNav: true,
      showOnHome: true
    },
    {
      id: "sales-and-revenue",
      subcategories: subcategoriesFor("sales-and-revenue"),
      label: "Sales & Revenue",
      eyebrow: "SALES STRATEGY",
      heading: "Sales & Revenue.",
      intro:
        "Coverage of how B2B sales and revenue teams build pipeline, run GTM motions and forecast with discipline. From lead generation and CRM automation to sales enablement, compensation design and the analytics that keep a forecast honest.",
      cta: "See all coverage",
      order: 4,
      showInNav: true,
      showOnHome: true
    },
    {
      id: "marketing-and-growth",
      subcategories: subcategoriesFor("marketing-and-growth"),
      label: "Marketing & Growth",
      eyebrow: "BRAND & PERFORMANCE",
      heading: "Marketing & Growth.",
      intro:
        "Analysis of how B2B marketing teams balance brand and performance, own their content and social programmes, and prove growth with defensible analytics. Coverage spans SEO, influencer and performance marketing alongside the brand-strategy work that makes acquisition cheaper.",
      cta: "See all coverage",
      order: 5,
      showInNav: true,
      showOnHome: true
    }
  ];
}

const SECTION_LABELS: Record<string, string> = {
  "ai-and-automation": "AI & Automation",
  "finance-and-fintech": "Finance & FinTech",
  "technology-and-it": "Technology & IT",
  "sales-and-revenue": "Sales & Revenue",
  "marketing-and-growth": "Marketing & Growth"
};

export function seedArticles(): Article[] {
  const stamp = new Date().toISOString();
  return [...rawArticles, ...rawArticlesMore].map((article) => {
    const subcategoryLabel = ARTICLE_SUBCATEGORY[article.slug] ?? "";
    const tags = [SECTION_LABELS[article.section], subcategoryLabel, article.tag]
      .filter(Boolean)
      .filter((value, index, all) => all.indexOf(value) === index) as string[];

    return {
    id: newId(),
    slug: article.slug,
    section: article.section,
    subcategory: subcategoryIdFor(article.slug),
    tag: article.tag,
    tags,
    title: article.title,
    dek: article.dek,
    image: article.image,
    minutes: article.minutes,
    date: article.date,
    body: [...article.body],
    status: "published" as const,
    featured: article.slug === "pipeline-coverage-is-lying-to-you",
    author: "Tech News Pro Editorial",
    seo: emptySeo(),
    views: 0,
    createdAt: stamp,
    updatedAt: stamp
    };
  });
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
    author: "Tech News Pro Research",
    date: resource.date,
    seo: emptySeo(),
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
    siteName: "Tech News Pro",
    metaTitle: "Tech News Pro | Business intelligence for growth leaders",
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

    newsletterEyebrow: "THE WEEKLY BRIEF",
    newsletterTitle: "One useful email.\nEvery Tuesday.",
    newsletterBlurb:
      "The week's most consequential shifts across AI, finance, technology and revenue — condensed, with the sources.",

    footerTagline: "Research-driven intelligence for a global business audience.",
    footerCopyright: "© 2026 Tech News Pro. All rights reserved.",
    socials: [
      { id: "linkedin", label: "LinkedIn", href: "https://linkedin.com", glyph: "in" },
      { id: "x", label: "X (Twitter)", href: "https://x.com", glyph: "𝕏" },
      { id: "rss", label: "RSS", href: "/api/rss", glyph: "◎" }
    ],
    tickerEnabled: true,

    resourcesEyebrow: "RESOURCE CENTER",
    resourcesTitle: "Research you can act on.",
    resourcesBlurb:
      "Whitepapers, ebooks, case studies and announcements from the Tech News Pro research desk.",

    whyEyebrow: "WHY TECH NEWS PRO",
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
      "Tech News Pro is an independent business intelligence publisher covering the AI economy, corporate finance, digital infrastructure, revenue strategy and brand. We serve senior operators at enterprises and high-growth companies who need evidence rather than commentary.",
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
    contactEmail: "hello@technewspro.com",
    contactPhone: "+1 (415) 555-0142",
    contactAddress: "One Market Street, Suite 3600, San Francisco, CA 94105"
  };
}
