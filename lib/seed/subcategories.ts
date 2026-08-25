import { slugify, type Subcategory } from "../types";

/** Sub-category labels per main category, in display order. */
export const SUBCATEGORY_LABELS: Record<string, string[]> = {
  "ai-and-automation": [
    "AI Strategy",
    "Automation & Workflow",
    "Generative AI",
    "AI in Enterprise",
    "Data Intelligence",
    "Ethical AI",
    "AI Startups",
    "AI Product Updates"
  ],
  "financial-intelligence": [
    "FinTech",
    "Investment Trends",
    "Revenue Strategy",
    "Market Analysis",
    "Fundraising & VC",
    "Risk & Compliance",
    "Digital Payments",
    "Economic Outlook"
  ],
  "information-technology": [
    "Cloud Computing",
    "Cybersecurity",
    "SaaS & Platforms",
    "DevOps",
    "IT Leadership",
    "Enterprise Software",
    "Infrastructure & Networking",
    "Emerging Tech"
  ],
  "sales-and-revenue": [
    "B2B Sales",
    "Sales Enablement",
    "Lead Generation",
    "CRM & Automation",
    "Sales Leadership",
    "Revenue Analytics",
    "Customer Acquisition",
    "GTM Strategy"
  ],
  "marketing-and-brand": [
    "Performance Marketing",
    "Content Marketing",
    "Brand Strategy",
    "Social Media",
    "SEO & SEM",
    "Influencer Marketing",
    "Marketing Analytics",
    "Customer Experience"
  ]
};

export function subcategoriesFor(sectionId: string): Subcategory[] {
  return (SUBCATEGORY_LABELS[sectionId] ?? []).map((label, index) => ({
    id: slugify(label),
    label,
    order: index + 1
  }));
}

/**
 * Which sub-category each seeded article belongs to, keyed by article slug.
 * Anything not listed here is left unclassified, which is a valid state.
 */
export const ARTICLE_SUBCATEGORY: Record<string, string> = {
  // AI & Automation
  "the-agent-shaped-hole-in-the-enterprise-org-chart": "AI in Enterprise",
  "automation-debt-is-the-new-technical-debt": "Automation & Workflow",
  "what-the-ai-economy-does-to-headcount-planning": "AI Strategy",
  "the-evaluation-gap-nobody-budgets-for": "Data Intelligence",
  "small-models-are-eating-the-routine-work": "Generative AI",
  "what-happens-when-the-agent-is-wrong-in-public": "Ethical AI",
  "the-quiet-rise-of-the-automation-product-manager": "Automation & Workflow",

  // Financial Intelligence
  "the-cfo-case-for-slower-ai-adoption": "Investment Trends",
  "working-capital-is-quietly-becoming-a-competitive-advantage": "Revenue Strategy",
  "the-quiet-return-of-the-detailed-business-case": "Market Analysis",
  "scenario-planning-comes-back-into-fashion": "Economic Outlook",
  "the-hidden-cost-of-deferred-maintenance-on-finance-systems": "Risk & Compliance",
  "why-finance-is-taking-over-vendor-consolidation": "Revenue Strategy",
  "the-return-of-the-payback-period": "Investment Trends",

  // Information Technology
  "the-infrastructure-bill-nobody-forecast": "Cloud Computing",
  "identity-is-the-perimeter-now-and-most-programmes-lag": "Cybersecurity",
  "the-integration-layer-is-where-transformations-die": "Enterprise Software",
  "platform-teams-are-being-asked-to-prove-their-worth": "DevOps",
  "the-observability-bill-nobody-reads": "Infrastructure & Networking",
  "legacy-migration-projects-are-getting-smaller-on-purpose": "Enterprise Software",
  "shadow-ai-is-this-decades-shadow-it": "Cybersecurity",

  // Sales & Revenue
  "pipeline-coverage-is-lying-to-you": "Revenue Analytics",
  "the-buying-committee-has-grown-again": "B2B Sales",
  "why-renewal-risk-shows-up-in-onboarding": "Customer Acquisition",
  "discounting-is-a-pricing-problem-wearing-a-sales-costume": "GTM Strategy",
  "the-first-meeting-is-no-longer-the-first-touch": "B2B Sales",
  "compensation-plans-are-getting-simpler": "Sales Leadership",
  "why-win-loss-interviews-keep-getting-cancelled": "Sales Enablement",

  // Marketing & Brand
  "brand-is-doing-the-work-performance-cannot": "Brand Strategy",
  "content-syndication-grows-up": "Content Marketing",
  "the-metric-that-quietly-broke-b2b-marketing": "Marketing Analytics",
  "the-attribution-model-is-not-the-strategy": "Marketing Analytics",
  "category-creation-is-mostly-a-myth": "Brand Strategy",
  "the-content-volume-trap": "Content Marketing",
  "events-are-expensive-again-and-worth-it-again": "Performance Marketing"
};

/** Resolves a seeded article's sub-category id, or "" when unmapped. */
export function subcategoryIdFor(slug: string) {
  const label = ARTICLE_SUBCATEGORY[slug];
  return label ? slugify(label) : "";
}
