// Seed content for the initial database.
// After the first run the live data lives in Postgres and is edited from /admin.

export const rawArticles = [
  /* ---------------------------------------------------------- AI & Automation */
  {
    slug: "the-agent-shaped-hole-in-the-enterprise-org-chart",
    section: "ai-and-automation",
    tag: "AI ECONOMY",
    title: "The agent-shaped hole in the enterprise org chart",
    dek: "Autonomous agents are being handed real workflows. Almost nobody has decided who owns their output.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-22",
    body: [
      "Enterprises have spent two years piloting AI agents and are now moving them into production workflows — invoice matching, tier-one support triage, lead enrichment. The technology has proven itself faster than the governance around it has.",
      "The gap shows up the first time an agent gets something expensive wrong. Most organisations cannot answer basic questions: who signed off on the agent's scope, who reviews its output, and which human is accountable when it commits the company to something.",
      "The teams handling this well have borrowed from an old playbook. They treat an agent like a new hire with limited authority: a defined remit, a named manager, a review cadence, and a hard ceiling on what it can do without a person in the loop."
    ]
  },
  {
    slug: "automation-debt-is-the-new-technical-debt",
    section: "ai-and-automation",
    tag: "OPERATIONS",
    title: "Automation debt is the new technical debt",
    dek: "Every quick win bolted onto an unchanged process compounds into something nobody wants to maintain.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-20",
    body: [
      "The fastest automation wins are almost always the ones layered on top of a process nobody redesigned. They deliver in weeks, they demo well, and they quietly become permanent.",
      "Two years later the picture is familiar: a dozen brittle integrations, none documented, each assuming a form field or report format that has since changed. The cost of the automation now exceeds the manual work it replaced.",
      "Finance leaders are starting to treat this the way they treat capital expenditure — with a maintenance budget attached from day one, and a scheduled review that asks whether the underlying process should exist at all."
    ]
  },
  {
    slug: "what-the-ai-economy-does-to-headcount-planning",
    section: "ai-and-automation",
    tag: "AI ECONOMY",
    title: "What the AI economy does to headcount planning",
    dek: "Hiring plans built on last year's productivity assumptions are already out of date.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
    minutes: 7,
    date: "2026-08-17",
    body: [
      "Workforce planning has traditionally assumed a stable ratio between revenue growth and headcount growth. That ratio is moving, and it is moving unevenly across functions.",
      "Support and content operations are seeing the sharpest change. Engineering and enterprise sales are shifting more slowly, because the constraint in those functions was never raw output — it was judgment, relationships and trust.",
      "The planning error to avoid is applying a single blended productivity assumption across the whole company. The organisations getting this right are modelling function by function, and revisiting the model every two quarters rather than annually."
    ]
  },

  /* --------------------------------------------------- Financial Intelligence */
  {
    slug: "the-cfo-case-for-slower-ai-adoption",
    section: "financial-intelligence",
    tag: "CORPORATE FINANCE",
    title: "The CFO case for slower AI adoption",
    dek: "Finance chiefs are asking for evidence, not enthusiasm — and it is changing how budgets get approved.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-21",
    body: [
      "After two budget cycles of exploratory AI spending, finance leaders are applying the same scrutiny they would to any other line item: what did it cost, what did it return, and would we fund it again on the evidence.",
      "The answers have been uncomfortable. A significant share of pilots never defined a baseline, which makes any claimed improvement unfalsifiable. Others measured activity — prompts sent, tickets touched — rather than an outcome anyone cares about.",
      "The shift is not away from AI spending but toward staged funding: a small tranche to establish a baseline, a larger one only once the measurement holds up. It is slower, and it is producing far fewer write-offs."
    ]
  },
  {
    slug: "working-capital-is-quietly-becoming-a-competitive-advantage",
    section: "financial-intelligence",
    tag: "TREASURY",
    title: "Working capital is quietly becoming a competitive advantage",
    dek: "With cheap credit gone, the balance sheet is doing work the growth plan used to do.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-18",
    body: [
      "For a decade, working capital discipline was a hygiene topic. Cheap credit meant a company could grow through a cash conversion cycle that was merely acceptable.",
      "That has reversed. Businesses that collect faster and hold less inventory are funding their own expansion while competitors negotiate terms, and the gap compounds every quarter.",
      "The practical work is unglamorous: tighter invoicing discipline, clearer credit policy, and a genuine forecast rather than a spreadsheet that has not been re-based since the last plan."
    ]
  },
  {
    slug: "the-quiet-return-of-the-detailed-business-case",
    section: "financial-intelligence",
    tag: "PLANNING",
    title: "The quiet return of the detailed business case",
    dek: "Investment committees want a number, an owner and a date again.",
    image: "https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=85",
    minutes: 4,
    date: "2026-08-15",
    body: [
      "The one-slide investment pitch is losing ground to something that looks a lot like the business cases of fifteen years ago: an explicit assumption set, a sensitivity analysis and a named owner.",
      "This is not nostalgia. It is a response to a period in which a large number of funded initiatives could not be evaluated after the fact, because nobody had written down what success would look like.",
      "The useful discipline is not the document itself but the argument it forces: which assumption, if wrong, kills the return — and how early could we know."
    ]
  },

  /* --------------------------------------------------- Information Technology */
  {
    slug: "the-infrastructure-bill-nobody-forecast",
    section: "information-technology",
    tag: "DIGITAL INFRASTRUCTURE",
    title: "The infrastructure bill nobody forecast",
    dek: "Inference workloads have a very different cost curve to the applications they sit inside.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-22",
    body: [
      "Traditional application costs scale with users. Inference costs scale with usage intensity, and the two diverge badly once a feature becomes genuinely popular.",
      "Teams that modelled AI features on a per-seat basis are discovering that their most engaged customers are also their least profitable, sometimes by a wide margin.",
      "The fixes are known — caching, smaller models for routine calls, routing by task complexity — but they require the cost data to be visible per feature, which most organisations still cannot produce."
    ]
  },
  {
    slug: "identity-is-the-perimeter-now-and-most-programmes-lag",
    section: "information-technology",
    tag: "SECURITY",
    title: "Identity is the perimeter now, and most programmes lag",
    dek: "Breach reporting keeps pointing at the same root causes, and they are not exotic.",
    image: "https://images.unsplash.com/photo-1614064548237-096d8f9e9db4?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-19",
    body: [
      "Mandatory disclosure has produced better data than the industry has ever had, and the picture is consistent: reused credentials and unpatched software account for the overwhelming majority of successful attacks.",
      "That is encouraging, in a sense. The countermeasures are well understood and comparatively cheap. The barrier is prioritisation, not invention.",
      "Where programmes stall is recovery and joiner-mover-leaver hygiene — the unglamorous identity lifecycle work that never competes well for budget against a new detection tool."
    ]
  },
  {
    slug: "the-integration-layer-is-where-transformations-die",
    section: "information-technology",
    tag: "ARCHITECTURE",
    title: "The integration layer is where transformations die",
    dek: "The platform decision gets the attention. The plumbing decides the outcome.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=85",
    minutes: 7,
    date: "2026-08-16",
    body: [
      "Major platform migrations are usually justified on capability. They are usually derailed by integration — the dozens of undocumented data flows that turned out to be load-bearing.",
      "The discovery work that would surface those flows is rarely funded properly, because it produces no demo and no headline. It simply reduces the chance of a very expensive surprise in month nine.",
      "Programmes that budget explicitly for integration discovery before committing to a date are markedly less likely to be re-planned mid-flight."
    ]
  },

  /* -------------------------------------------------------- Sales & Revenue */
  {
    slug: "pipeline-coverage-is-lying-to-you",
    section: "sales-and-revenue",
    tag: "SALES STRATEGY",
    title: "Pipeline coverage is lying to you",
    dek: "A 3x number built from stale opportunities is worse than no number at all.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-23",
    body: [
      "Coverage ratios assume the pipeline they measure is real. In most organisations a meaningful share of open opportunities have had no genuine buyer activity in over sixty days.",
      "Strip those out and the comfortable multiple often collapses to something closer to parity with target — which is exactly the signal leadership needed a quarter earlier.",
      "The teams with the most reliable forecasts are not the ones with the best models. They are the ones with the most ruthless hygiene about closing out opportunities that are not moving."
    ]
  },
  {
    slug: "the-buying-committee-has-grown-again",
    section: "sales-and-revenue",
    tag: "B2B BUYING",
    title: "The buying committee has grown again",
    dek: "More stakeholders, longer cycles, and a procurement function with real veto power.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-20",
    body: [
      "Enterprise software purchases now routinely involve security review, procurement, finance and a data protection sign-off in addition to the economic buyer and the end users.",
      "Each additional stakeholder adds not just time but a new way for the deal to fail, usually late, and usually over something the seller could have surfaced in week two.",
      "The most effective change is unglamorous: qualify for the process, not just the pain. Ask early who has to sign, what they will ask for, and what has blocked similar purchases before."
    ]
  },
  {
    slug: "why-renewal-risk-shows-up-in-onboarding",
    section: "sales-and-revenue",
    tag: "REVENUE",
    title: "Why renewal risk shows up in onboarding",
    dek: "Churn is usually decided in the first ninety days, long before anyone flags it.",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=85",
    minutes: 4,
    date: "2026-08-14",
    body: [
      "Retention post-mortems tend to focus on the final quarter before a customer leaves. The signal is almost always earlier than that.",
      "Accounts that fail to reach a meaningful first outcome inside ninety days churn at multiples of those that do, regardless of how well the relationship appears to be going later.",
      "That makes onboarding a revenue function, not a support function — and it argues for measuring time-to-first-value with the same seriousness as time-to-close."
    ]
  },

  /* ------------------------------------------------------- Marketing & Brand */
  {
    slug: "brand-is-doing-the-work-performance-cannot",
    section: "marketing-and-brand",
    tag: "BRAND",
    title: "Brand is doing the work performance cannot",
    dek: "As acquisition costs climb, the cheapest demand is the demand that already knows who you are.",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-21",
    body: [
      "A decade of performance marketing taught a generation of B2B teams to measure everything that could be attributed and to defund everything that could not. Brand investment lost most of those arguments.",
      "The economics have shifted. Auction prices have risen faster than conversion rates, and the accounts that convert most efficiently are consistently those with prior familiarity.",
      "The rebalancing underway is not a rejection of performance marketing. It is an acknowledgement that performance channels harvest demand rather than create it, and that something has to do the creating."
    ]
  },
  {
    slug: "content-syndication-grows-up",
    section: "marketing-and-brand",
    tag: "DEMAND GEN",
    title: "Content syndication grows up",
    dek: "Buyers got harder to reach, and lead quality finally started to matter more than lead volume.",
    image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-18",
    body: [
      "Syndication programmes were long judged on cost per lead, a metric that rewards volume and punishes nothing. The result was predictable and well documented.",
      "Programmes are increasingly bought on downstream measures instead — meetings accepted, pipeline created, and eventually revenue — with the reporting to support it.",
      "That has narrowed the field of credible partners considerably, and raised prices. Buyers report being comfortable with both, given what the previous model actually delivered."
    ]
  },
  {
    slug: "the-metric-that-quietly-broke-b2b-marketing",
    section: "marketing-and-brand",
    tag: "PERFORMANCE",
    title: "The metric that quietly broke B2B marketing",
    dek: "Optimising for MQLs produced exactly what it incentivised, for years.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-13",
    body: [
      "The marketing qualified lead was designed as a handoff mechanism and became a target. Once it became a target, it stopped being a useful measure.",
      "Teams hit their numbers while sales acceptance rates fell, and the disagreement between the two functions became structural rather than personal.",
      "The organisations that resolved it did so by making both functions accountable to the same downstream number, which is uncomfortable for a quarter or two and clarifying thereafter."
    ]
  }
];
