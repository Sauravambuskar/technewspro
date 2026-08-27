// Second tranche of seed articles, so every category has enough depth to fill a
// homepage block. Merged with rawArticles in ./index.

export const rawArticlesMore = [
  /* ---------------------------------------------------------- AI & Automation */
  {
    slug: "the-evaluation-gap-nobody-budgets-for",
    section: "ai-and-automation",
    tag: "GOVERNANCE",
    title: "The evaluation gap nobody budgets for",
    dek: "Teams can ship an agent in a fortnight. Proving it works takes considerably longer.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-23",
    body: [
      "Building an agent that works in a demo is now a two-week job. Building the evaluation harness that tells you whether it works on the long tail of real inputs is a two-quarter job, and it rarely gets funded with the same enthusiasm.",
      "The consequence is a class of deployment that looks successful because nobody is measuring the cases where it fails quietly — the misrouted ticket, the subtly wrong figure that nobody checks.",
      "Programmes that invest in evaluation first tend to ship later and roll back far less. That is a trade most boards would take if it were framed to them honestly."
    ]
  },
  {
    slug: "small-models-are-eating-the-routine-work",
    section: "ai-and-automation",
    tag: "ARCHITECTURE",
    title: "Small models are eating the routine work",
    dek: "Routing by task complexity is turning out to be the single biggest lever on inference cost.",
    image: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-16",
    body: [
      "The default architecture of the last two years sent every request to the largest available model. It was simple, it worked, and it produced bills that scaled with engagement rather than revenue.",
      "The pattern replacing it is unglamorous routing: classify the request, send the routine majority to a small fast model, escalate only what genuinely needs the frontier.",
      "Teams reporting the largest savings describe reductions of sixty to eighty per cent on inference, with no measurable change in output quality on the routed classes."
    ]
  },
  {
    slug: "what-happens-when-the-agent-is-wrong-in-public",
    section: "ai-and-automation",
    tag: "RISK",
    title: "What happens when the agent is wrong in public",
    dek: "A small but growing body of incidents is establishing what liability looks like in practice.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=85",
    minutes: 7,
    date: "2026-08-11",
    body: [
      "Customer-facing agents have now made enough consequential errors — misquoted prices, incorrect eligibility decisions, commitments the company did not intend — for a pattern to emerge in how those disputes resolve.",
      "The consistent finding is that the customer's reasonable interpretation carries considerable weight. An agent presented as an authoritative company channel tends to be treated as one.",
      "The practical implication is narrow and cheap: constrain what the agent can assert, and make escalation to a person genuinely easy rather than technically available."
    ]
  },
  {
    slug: "the-quiet-rise-of-the-automation-product-manager",
    section: "ai-and-automation",
    tag: "TEAMS",
    title: "The quiet rise of the automation product manager",
    dek: "A role defined less by technology than by knowing which work should stop existing.",
    image: "https://images.unsplash.com/photo-1552581234-26160f608093?auto=format&fit=crop&w=1200&q=85",
    minutes: 4,
    date: "2026-08-08",
    body: [
      "The job title varies, but the remit is consistent: own a process end to end, decide which parts a machine should do, and be accountable for the result rather than for the tooling.",
      "What distinguishes the people doing it well is domain fluency. They can tell which exceptions matter and which are noise, which is exactly the judgement an automation cannot supply for itself.",
      "Organisations that placed this role inside IT report slower progress than those that placed it inside the function whose work is changing."
    ]
  },

  /* --------------------------------------------------- Finance & FinTech */
  {
    slug: "scenario-planning-comes-back-into-fashion",
    section: "finance-and-fintech",
    tag: "PLANNING",
    title: "Scenario planning comes back into fashion",
    dek: "One forecast stopped being credible somewhere around the third consecutive surprise.",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-22",
    body: [
      "Single-point forecasts survived a long period of relative stability. They have not survived the last few years, and finance functions are rebuilding around explicit scenarios instead.",
      "The useful version is not three cases labelled optimistic, base and pessimistic. It is a small set of genuinely different worlds, each with a named early indicator that tells you which one you are in.",
      "The discipline forces a more valuable conversation than the number itself: what would we do differently, and how soon would we know."
    ]
  },
  {
    slug: "the-hidden-cost-of-deferred-maintenance-on-finance-systems",
    section: "finance-and-fintech",
    tag: "SYSTEMS",
    title: "The hidden cost of deferred maintenance on finance systems",
    dek: "The close takes nine days because of decisions made a decade ago.",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-14",
    body: [
      "A slow month-end close is rarely a staffing problem. It is usually an accumulation of reconciliations that exist because two systems were never properly integrated.",
      "Each individual workaround was reasonable when introduced. Collectively they consume a substantial share of a finance team's capacity every single month, permanently.",
      "The organisations that fixed it treated the close as a product with a target cycle time, and funded the integration work that target implied."
    ]
  },
  {
    slug: "why-finance-is-taking-over-vendor-consolidation",
    section: "finance-and-fintech",
    tag: "PROCUREMENT",
    title: "Why finance is taking over vendor consolidation",
    dek: "Software sprawl became visible the moment somebody added up the renewals.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-09",
    body: [
      "Departmental purchasing produced a long tail of overlapping tools that no single owner ever saw in aggregate. Finance now does, because renewals land on one desk.",
      "The consolidation exercises producing real savings are the ones that start with usage data rather than with a category list — plenty of tools are genuinely load-bearing despite a small seat count.",
      "The failure mode is consolidating on the incumbent purely because it is already there, and discovering the migration cost exceeds three years of the saving."
    ]
  },
  {
    slug: "the-return-of-the-payback-period",
    section: "finance-and-fintech",
    tag: "INVESTMENT",
    title: "The return of the payback period",
    dek: "A blunt metric is regaining favour precisely because it is hard to argue with.",
    image: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?auto=format&fit=crop&w=1200&q=85",
    minutes: 4,
    date: "2026-08-06",
    body: [
      "Payback period ignores everything after the break-even point, which is why it fell out of favour. It is returning for the same reason it was once standard: it is very difficult to game.",
      "Investment committees using it as a first filter report fewer proposals built on terminal-value optimism, and faster decisions on the proposals that survive.",
      "It works best alongside a fuller analysis rather than instead of one — as a screen, not a verdict."
    ]
  },

  /* --------------------------------------------------- Technology & IT */
  {
    slug: "platform-teams-are-being-asked-to-prove-their-worth",
    section: "technology-and-it",
    tag: "PLATFORM",
    title: "Platform teams are being asked to prove their worth",
    dek: "Internal developer platforms are maturing into something with a measurable return — or being cut.",
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-21",
    body: [
      "Platform engineering enjoyed several years of funding on the strength of developer experience arguments that were difficult to quantify. That grace period is ending.",
      "The teams surviving the scrutiny measure a small number of concrete things: lead time to first deploy for a new service, change failure rate, and the share of teams voluntarily on the platform.",
      "Voluntary adoption turns out to be the most honest signal. A platform teams have to be mandated onto is usually solving the platform team's problem."
    ]
  },
  {
    slug: "the-observability-bill-nobody-reads",
    section: "technology-and-it",
    tag: "OPERATIONS",
    title: "The observability bill nobody reads",
    dek: "Telemetry volume grew faster than the ability to act on any of it.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-13",
    body: [
      "Observability spending has become one of the larger line items in many infrastructure budgets, driven by a default of collecting everything at full fidelity forever.",
      "The uncomfortable audit question is how many of those signals have ever been queried. In most organisations the answer is a small minority.",
      "Sampling policies, shorter retention on high-cardinality data and a genuine review of what gets alerted on typically cut the bill sharply without reducing the ability to diagnose an incident."
    ]
  },
  {
    slug: "legacy-migration-projects-are-getting-smaller-on-purpose",
    section: "technology-and-it",
    tag: "MODERNISATION",
    title: "Legacy migration projects are getting smaller on purpose",
    dek: "The multi-year replatform keeps failing, so organisations have stopped attempting it.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    minutes: 7,
    date: "2026-08-10",
    body: [
      "Large replatforming programmes have a poor completion record, and the reasons are well documented: requirements drift, integration surprises, and a business that keeps changing underneath the project.",
      "The strangler pattern — moving one capability at a time behind a stable interface — has moved from architectural advice to default expectation in most enterprise modernisation plans.",
      "It is slower on paper and considerably faster in practice, mostly because each increment delivers something that survives a change of sponsor."
    ]
  },
  {
    slug: "shadow-ai-is-this-decades-shadow-it",
    section: "technology-and-it",
    tag: "SECURITY",
    title: "Shadow AI is this decade's shadow IT",
    dek: "Employees found tools that helped, and told nobody. The parallels are almost exact.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-07",
    body: [
      "Surveys consistently find that a large share of employees use AI tools their employer has not sanctioned, usually for entirely reasonable productivity reasons.",
      "The organisations handling it badly respond with blanket prohibition, which reliably drives the behaviour further underground and removes any chance of visibility.",
      "The ones handling it well provide a sanctioned option good enough that the unsanctioned one stops being worth the friction — the same lesson shadow IT taught fifteen years ago."
    ]
  },

  /* -------------------------------------------------------- Sales & Revenue */
  {
    slug: "discounting-is-a-pricing-problem-wearing-a-sales-costume",
    section: "sales-and-revenue",
    tag: "PRICING",
    title: "Discounting is a pricing problem wearing a sales costume",
    dek: "When every deal closes below list, the list price is the thing that is wrong.",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-22",
    body: [
      "Persistent heavy discounting is usually diagnosed as a sales discipline issue. The data more often points at a list price that no segment actually accepts.",
      "The distinction matters because the remedies are opposite. Tighter approval thresholds on a mispriced product simply lengthen the cycle and lose deals that were winnable.",
      "Teams that re-based pricing to observed win points report shorter cycles and, counter-intuitively, higher realised margin than the discount-controlled alternative."
    ]
  },
  {
    slug: "the-first-meeting-is-no-longer-the-first-touch",
    section: "sales-and-revenue",
    tag: "B2B BUYING",
    title: "The first meeting is no longer the first touch",
    dek: "Buyers arrive having done most of their research without telling anyone.",
    image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-17",
    body: [
      "By the time a buying committee books a call, it has typically read the documentation, priced the alternatives and formed a working view. The discovery call is confirming, not exploring.",
      "Sellers still running full discovery at that point are perceived as slow, and frequently lose to a competitor who met the buyer where they already were.",
      "The adjustment is uncomfortable but simple: publish enough for the buyer to self-qualify, and use the first meeting for the questions the published material cannot answer."
    ]
  },
  {
    slug: "compensation-plans-are-getting-simpler",
    section: "sales-and-revenue",
    tag: "OPERATORS",
    title: "Compensation plans are getting simpler",
    dek: "Complexity in a comp plan reliably produces behaviour nobody intended.",
    image: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=1200&q=85",
    minutes: 4,
    date: "2026-08-12",
    body: [
      "Multi-accelerator plans with product modifiers and strategic-account kickers were designed to steer behaviour precisely. In practice most sellers optimise the one or two components they can actually influence.",
      "Simplification exercises consistently find that plans with two or three components produce more predictable behaviour than plans with seven.",
      "The steering that survives is the steering that is legible on the day a rep decides which deal to work."
    ]
  },
  {
    slug: "why-win-loss-interviews-keep-getting-cancelled",
    section: "sales-and-revenue",
    tag: "REVENUE",
    title: "Why win-loss interviews keep getting cancelled",
    dek: "The single highest-yield research a revenue team can run is also the easiest to deprioritise.",
    image: "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-05",
    body: [
      "Structured win-loss interviews reliably surface reasons that differ from what the CRM records — usually procurement friction or a capability gap the seller never heard articulated.",
      "They also reliably get postponed, because nobody's quarter depends on them and the findings are frequently unwelcome.",
      "The teams that sustain the practice put it outside the sales organisation entirely, which removes both the scheduling conflict and the incentive to soften the summary."
    ]
  },

  /* ------------------------------------------------------- Marketing & Growth */
  {
    slug: "the-attribution-model-is-not-the-strategy",
    section: "marketing-and-growth",
    tag: "MEASUREMENT",
    title: "The attribution model is not the strategy",
    dek: "Years of argument about touch weighting distracted from a simpler question.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-23",
    body: [
      "Multi-touch attribution consumed an enormous amount of marketing energy for a decade, and the models rarely survived contact with a privacy change or a new channel.",
      "The teams that moved on did not solve attribution. They stopped trying, and adopted incrementality testing for the decisions that actually needed an answer.",
      "It produces fewer numbers and considerably more confidence in the small set of numbers it does produce."
    ]
  },
  {
    slug: "category-creation-is-mostly-a-myth",
    section: "marketing-and-growth",
    tag: "POSITIONING",
    title: "Category creation is mostly a myth",
    dek: "Almost every celebrated example turns out to be a company that named something buyers already wanted.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-15",
    body: [
      "The category creation narrative is compelling and largely retrospective. Examined closely, the canonical cases are companies that gave a clear name to demand that already existed.",
      "That is a meaningful achievement, but it is a positioning exercise rather than an act of invention — and it is reproducible in a way that genuine category creation is not.",
      "Teams that internalise the distinction spend their effort on clarity and distribution rather than on evangelising a term nobody is searching for."
    ]
  },
  {
    slug: "the-content-volume-trap",
    section: "marketing-and-growth",
    tag: "CONTENT",
    title: "The content volume trap",
    dek: "Publishing capacity stopped being the constraint, and the constraint moved somewhere less convenient.",
    image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-11",
    body: [
      "Generative tools removed the production bottleneck almost overnight. Many teams responded by publishing considerably more, and saw engagement per piece fall by roughly the same factor.",
      "The scarce input was never words. It was a defensible point of view and access to people who know something the reader does not.",
      "Programmes that redirected the freed-up capacity toward primary research rather than volume are the ones showing improved results."
    ]
  },
  {
    slug: "events-are-expensive-again-and-worth-it-again",
    section: "marketing-and-growth",
    tag: "DEMAND GEN",
    title: "Events are expensive again, and worth it again",
    dek: "As digital channels crowded, the least scalable channel started outperforming.",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-04",
    body: [
      "In-person events have the worst unit economics of any B2B channel and, currently, some of the best conversion. Both facts follow from the same cause: they do not scale.",
      "The programmes performing best are small and tightly qualified — dinners and roundtables in the low dozens rather than conferences in the thousands.",
      "The measurement is slower and messier than a paid channel, which is precisely why the format stayed underused long enough to still be effective."
    ]
  }
];
