// Seed content for the resource centre: whitepapers, ebooks, case studies and
// press releases. Gated items require the lead form before the download appears.

export const rawResources = [
  /* ------------------------------------------------------------ Whitepapers */
  {
    slug: "the-2026-ai-automation-readiness-benchmark",
    type: "whitepaper",
    category: "ai-and-automation",
    title: "The 2026 AI & Automation Readiness Benchmark",
    summary:
      "How 400 enterprises are governing, funding and measuring autonomous workflows — and what separates the programmes that scaled from the ones that stalled.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",
    pages: 34,
    gated: true,
    date: "2026-08-19",
    highlights: [
      "Benchmark data from 400 enterprises across nine industries",
      "The four governance models that survived contact with production",
      "A costing framework for inference-heavy workloads",
      "Board-ready maturity assessment you can run in a workshop"
    ],
    body: [
      "Most organisations can point to an automation success and an automation failure that look, on paper, almost identical. This benchmark set out to explain the difference.",
      "We surveyed 400 enterprises that have moved at least one agentic workflow into production, then interviewed programme leads at thirty of them. The strongest predictor of success was not model choice, budget or technical maturity — it was whether a named individual owned the agent's output.",
      "The report sets out the four governance models we observed, the cost structures that made inference-heavy workloads sustainable, and a maturity assessment you can run against your own programme in a single workshop."
    ]
  },
  {
    slug: "cfo-guide-to-funding-ai-in-stages",
    type: "whitepaper",
    category: "financial-intelligence",
    title: "The CFO's Guide to Funding AI in Stages",
    summary:
      "A staged investment model that establishes a measurable baseline before the large tranche is committed — with the approval criteria written out.",
    image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=85",
    pages: 28,
    gated: true,
    date: "2026-08-12",
    highlights: [
      "A three-tranche funding model with explicit gate criteria",
      "How to establish a baseline that survives audit",
      "Sensitivity templates for inference cost assumptions",
      "Twelve questions to ask before approving the second tranche"
    ],
    body: [
      "Two budget cycles of exploratory AI spending have left many finance functions unable to say what the money returned. This guide sets out a staged alternative.",
      "The model funds a deliberately small first tranche whose only job is to establish a defensible baseline. The larger commitment follows only once the measurement holds up under the same scrutiny as any other capital request.",
      "Included are the gate criteria, the sensitivity templates, and the questions that most reliably surface an initiative that cannot be evaluated."
    ]
  },

  /* ----------------------------------------------------------------- Ebooks */
  {
    slug: "the-pipeline-hygiene-playbook",
    type: "ebook",
    category: "sales-and-revenue",
    title: "The Pipeline Hygiene Playbook",
    summary:
      "A practical guide to forecasts leadership can act on: qualification criteria, stage exit rules and the review cadence that keeps a pipeline honest.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85",
    pages: 46,
    gated: true,
    date: "2026-08-21",
    highlights: [
      "Stage exit criteria you can enforce without a new tool",
      "A weekly inspection cadence that takes under an hour",
      "Scripts for closing out opportunities that are not moving",
      "How to qualify for the buying process, not just the pain"
    ],
    body: [
      "Coverage ratios only mean something if the pipeline underneath them is real. In most organisations it is not, and the gap is discovered a quarter too late.",
      "This playbook covers the mechanics of keeping a pipeline honest: what a stage exit actually requires, how to run an inspection that surfaces stalled deals quickly, and how to have the conversation that closes them out.",
      "It is written for revenue leaders who need the forecast to be defensible to a board, not just to a sales meeting."
    ]
  },
  {
    slug: "demand-creation-for-b2b-marketers",
    type: "ebook",
    category: "marketing-and-brand",
    title: "Demand Creation for B2B Marketers",
    summary:
      "Rebalancing brand and performance when acquisition costs rise faster than conversion rates — with the measurement to defend the shift internally.",
    image: "https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=1200&q=85",
    pages: 38,
    gated: true,
    date: "2026-08-16",
    highlights: [
      "Why performance channels harvest demand rather than create it",
      "A measurement approach that survives a CFO conversation",
      "Budget splits observed across 120 B2B marketing teams",
      "How to phase a rebalance without losing the quarter"
    ],
    body: [
      "Performance marketing taught B2B teams to defund anything that could not be attributed. That worked while auction prices were low, and stopped working when they were not.",
      "This ebook lays out the case for rebalancing toward demand creation, and — more usefully — how to measure it in a way that holds up when finance asks what the money did.",
      "It includes observed budget splits from 120 teams and a phased approach that does not sacrifice the current quarter to fix the next four."
    ]
  },

  /* ------------------------------------------------------------ Case studies */
  {
    slug: "how-a-global-insurer-cut-claims-handling-time-by-41-percent",
    type: "case-study",
    category: "ai-and-automation",
    title: "How a global insurer cut claims handling time by 41%",
    summary:
      "Redesigning the workflow before automating it — and why the first attempt, which did the reverse, was abandoned after eight months.",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&q=85",
    pages: 12,
    gated: false,
    date: "2026-08-20",
    highlights: [
      "41% reduction in average handling time across 2.3m annual claims",
      "Why the first automation attempt was written off",
      "The review model that kept adjusters accountable for agent output",
      "Cost per claim before, during and after redesign"
    ],
    body: [
      "The insurer's first attempt bolted a document-extraction agent onto an unchanged claims process. It produced a measurable saving in one step and a new review bottleneck in the next, and was abandoned after eight months.",
      "The second attempt started with the process. Three steps were removed entirely, two were merged, and only then was automation applied to what remained.",
      "Average handling time fell 41% across 2.3 million annual claims. The programme lead is explicit that the redesign, not the technology, produced most of the gain."
    ]
  },
  {
    slug: "a-manufacturer-rebuilt-its-forecast-in-one-quarter",
    type: "case-study",
    category: "sales-and-revenue",
    title: "A manufacturer rebuilt its forecast in one quarter",
    summary:
      "No new tooling, no new headcount — just enforced stage exit criteria and a weekly inspection nobody was allowed to skip.",
    image: "https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=85",
    pages: 10,
    gated: false,
    date: "2026-08-15",
    highlights: [
      "Forecast accuracy moved from ±31% to ±9% in two quarters",
      "38% of open pipeline closed out in the first month",
      "The inspection agenda used, reproduced in full",
      "How the change was sold to a sceptical sales floor"
    ],
    body: [
      "The company's forecast had missed by more than 25% for five consecutive quarters. The CRM was not the problem; the discipline around it was.",
      "Leadership introduced two changes: stage exits required evidence of buyer activity, and a weekly inspection reviewed every deal above a threshold. In the first month, 38% of open pipeline was closed out.",
      "Forecast accuracy moved from ±31% to ±9% over two quarters. The case study reproduces the inspection agenda and the internal messaging used to bring the sales floor along."
    ]
  },

  /* ---------------------------------------------------------- Press releases */
  {
    slug: "technewspro-launches-2026-benchmark-programme",
    type: "press-release",
    category: "ai-and-automation",
    title: "Tech News Pro launches its 2026 enterprise benchmark programme",
    summary:
      "The annual research programme expands to nine industries and adds a governance track covering autonomous workflows.",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=85",
    pages: 3,
    gated: false,
    date: "2026-08-22",
    highlights: [
      "Programme expands from five to nine industries",
      "New governance track covering autonomous workflows",
      "Findings published quarterly from October 2026"
    ],
    body: [
      "Tech News Pro today announced the 2026 edition of its enterprise benchmark programme, expanding coverage from five industries to nine and adding a dedicated governance track for autonomous workflows.",
      "The programme surveys senior operators across finance, technology, sales and marketing functions, with findings published quarterly from October 2026.",
      "Participating organisations receive an anonymised comparison against their industry cohort ahead of general publication."
    ]
  },
  {
    slug: "technewspro-expands-editorial-coverage-to-corporate-finance",
    type: "press-release",
    category: "financial-intelligence",
    title: "Tech News Pro expands editorial coverage to corporate finance",
    summary:
      "A dedicated Financial Intelligence desk joins the existing technology, sales and marketing coverage.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85",
    pages: 2,
    gated: false,
    date: "2026-08-10",
    highlights: [
      "New Financial Intelligence desk covering treasury and planning",
      "Coverage begins with the 2026 budget cycle",
      "Weekly briefing available to existing subscribers"
    ],
    body: [
      "Tech News Pro has established a dedicated Financial Intelligence desk, extending its coverage into corporate finance, treasury and planning.",
      "The desk begins publishing with the 2026 budget cycle, focusing on how finance functions are evaluating and funding technology investment.",
      "Coverage is included for existing subscribers at no additional cost."
    ]
  }
];
