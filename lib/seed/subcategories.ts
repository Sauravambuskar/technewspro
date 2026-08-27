import { slugify, type Subcategory } from "../types";

/** Sub-category labels + intro copy per main category, in display order. */
export const SUBCATEGORY_LABELS: Record<string, { label: string; intro: string }[]> = {
  "ai-and-automation": [
    { label: "AI Strategy", intro: "How enterprise leaders are setting AI budgets, priorities and build-vs-buy decisions for the year ahead." },
    { label: "AI Automation", intro: "The workflow automation projects moving routine work off people's desks, and what it takes to keep them maintained." },
    { label: "Generative AI", intro: "Adoption patterns, model choice and the economics of putting generative AI into production products." },
    { label: "Enterprise AI", intro: "How large organisations are rolling out AI across functions, from pilot to company-wide deployment." },
    { label: "Data & Intelligence", intro: "The data infrastructure, evaluation and measurement work that determines whether an AI programme can prove it works." },
    { label: "Responsible AI", intro: "Governance, accountability and the ethical guardrails enterprises are putting around autonomous systems." },
    { label: "AI Products & Startups", intro: "Product launches, funding and competitive moves from the companies building the AI economy." }
  ],
  "finance-and-fintech": [
    { label: "FinTech", intro: "Product and infrastructure news from the companies rebuilding how businesses move and manage money." },
    { label: "Digital Payments", intro: "Payment rails, checkout infrastructure and the shift toward faster, cheaper money movement." },
    { label: "Investment Trends", intro: "Where corporate and institutional capital is flowing, and why." },
    { label: "Financial Strategy", intro: "How finance functions are planning, budgeting and defending capital allocation decisions." },
    { label: "Market Analysis", intro: "Macro and sector analysis for finance leaders making forward-looking bets." },
    { label: "Venture Capital & Fundraising", intro: "Deal terms, fundraising conditions and how venture capital is being deployed." },
    { label: "Risk & Compliance", intro: "Regulatory change, controls and the risk management work finance teams can't skip." }
  ],
  "technology-and-it": [
    { label: "Cloud Computing", intro: "Infrastructure decisions, cost management and platform strategy for enterprise cloud workloads." },
    { label: "Cybersecurity", intro: "Threats, breaches and the identity and access programmes enterprises are funding in response." },
    { label: "SaaS & Platforms", intro: "Procurement, consolidation and platform decisions shaping the enterprise software stack." },
    { label: "DevOps", intro: "Delivery pipelines, platform engineering and the practices that get software to production reliably." },
    { label: "IT Strategy & Leadership", intro: "How CIOs and IT leaders are setting technology priorities and proving their value to the business." },
    { label: "Enterprise Software", intro: "Implementation, integration and the systems work behind large enterprise software rollouts." },
    { label: "Infrastructure & Networking", intro: "The networking, observability and infrastructure decisions underneath every digital service." }
  ],
  "sales-and-revenue": [
    { label: "B2B Sales", intro: "How enterprise sales teams are adapting to longer cycles and larger buying committees." },
    { label: "Sales Enablement", intro: "The training, content and tooling that make a sales team's job easier and its pipeline more predictable." },
    { label: "Lead Generation", intro: "Pipeline generation tactics and the shifting economics of top-of-funnel demand." },
    { label: "CRM & Sales Automation", intro: "How revenue teams are automating pipeline management without losing forecast accuracy." },
    { label: "Sales Leadership", intro: "Compensation design, quota setting and the operating decisions revenue leaders make." },
    { label: "Revenue Analytics", intro: "The metrics and forecasting discipline that keep a pipeline number honest." },
    { label: "GTM Strategy", intro: "Go-to-market motion design, from segmentation to channel strategy." }
  ],
  "marketing-and-growth": [
    { label: "Performance Marketing", intro: "Paid acquisition strategy and the economics of buying demand as costs rise." },
    { label: "Content Marketing", intro: "How content programmes are being rebuilt around distinctiveness rather than volume." },
    { label: "Brand Strategy", intro: "Brand investment, positioning and the case for building demand rather than only capturing it." },
    { label: "Social Media", intro: "Organic and paid social strategy for B2B audiences." },
    { label: "SEO & SEM", intro: "Search visibility, technical SEO and paid search strategy for B2B marketers." },
    { label: "Influencer Marketing", intro: "Creator and influencer partnerships as a B2B demand-generation channel." },
    { label: "Marketing Analytics", intro: "Attribution, incrementality and the measurement debates shaping marketing budgets." }
  ]
};

export function subcategoriesFor(sectionId: string): Subcategory[] {
  return (SUBCATEGORY_LABELS[sectionId] ?? []).map(({ label, intro }, index) => ({
    id: slugify(label),
    label,
    intro,
    order: index + 1
  }));
}

/**
 * Which sub-category each seeded article belongs to, keyed by article slug.
 * Anything not listed here is left unclassified, which is a valid state.
 */
export const ARTICLE_SUBCATEGORY: Record<string, string> = {
  // AI & Automation
  "the-agent-shaped-hole-in-the-enterprise-org-chart": "Enterprise AI",
  "automation-debt-is-the-new-technical-debt": "AI Automation",
  "what-the-ai-economy-does-to-headcount-planning": "AI Strategy",
  "the-evaluation-gap-nobody-budgets-for": "Data & Intelligence",
  "small-models-are-eating-the-routine-work": "Generative AI",
  "what-happens-when-the-agent-is-wrong-in-public": "Responsible AI",
  "the-quiet-rise-of-the-automation-product-manager": "AI Automation",

  // Finance & FinTech
  "the-cfo-case-for-slower-ai-adoption": "Investment Trends",
  "working-capital-is-quietly-becoming-a-competitive-advantage": "Financial Strategy",
  "the-quiet-return-of-the-detailed-business-case": "Market Analysis",
  "scenario-planning-comes-back-into-fashion": "Market Analysis",
  "the-hidden-cost-of-deferred-maintenance-on-finance-systems": "Risk & Compliance",
  "why-finance-is-taking-over-vendor-consolidation": "Financial Strategy",
  "the-return-of-the-payback-period": "Investment Trends",

  // Technology & IT
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
  "why-renewal-risk-shows-up-in-onboarding": "Lead Generation",
  "discounting-is-a-pricing-problem-wearing-a-sales-costume": "GTM Strategy",
  "the-first-meeting-is-no-longer-the-first-touch": "B2B Sales",
  "compensation-plans-are-getting-simpler": "Sales Leadership",
  "why-win-loss-interviews-keep-getting-cancelled": "Sales Enablement",

  // Marketing & Growth
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
