// Seed content for the initial database. Sourced from the original hard-coded site copy.
// After the first run the live data lives in data/articles.json and is edited from /admin.

export const rawArticles = [
  {
    slug: "open-models-are-changing-how-product-teams-build",
    section: "latest",
    tag: "AI",
    title: "Open models are changing how product teams build",
    dek: "Open models are changing how product teams build",
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=85",
    minutes: 5,
    date: "2026-08-21",
    body: [
      "A year ago, most product teams treated large language models as something to call through an API and little else. That's changed. Open-weight models good enough to run in-house have turned the model itself into a component teams shape, fine-tune and own — not just consume.",
      "The shift shows up in hiring, too: teams are pulling in ML engineers who understand training and evaluation, not just prompt design. The payoff is control over cost, latency and behavior that a hosted API can't offer.",
      "The tradeoff is real infrastructure work — GPUs, serving stacks, evaluation harnesses. For teams with the scale to justify it, that tradeoff increasingly looks worth making."
    ]
  },
  {
    slug: "the-quiet-return-of-small-phones",
    section: "latest",
    tag: "MOBILE",
    title: "The quiet return of small phones, and why it matters",
    dek: "The quiet return of small phones, and why it matters",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=85",
    minutes: 4,
    date: "2026-08-20",
    body: [
      "After a decade of screens creeping ever larger, a handful of manufacturers are quietly shipping compact flagships again — full specs, no compromises, in a phone that fits in one hand.",
      "It's a small niche by unit sales, but an outsized signal: after years of assuming bigger always wins, manufacturers are finding a real audience that wants the opposite.",
      "Expect more of this in the next product cycle, particularly as camera hardware shrinks enough to stop forcing the size tradeoff that killed small phones the first time around."
    ]
  },
  {
    slug: "passkeys-are-finally-ready-for-everyday-life",
    section: "latest",
    tag: "SECURITY",
    title: "Passkeys are finally ready for everyday life",
    dek: "Passkeys are finally ready for everyday life",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=85",
    minutes: 6,
    date: "2026-08-19",
    body: [
      "Passkeys promised to kill the password for years without quite delivering. That's finally changing, as cross-device syncing and browser support have caught up to the underlying standard.",
      "The remaining friction isn't cryptography — it's habit. Recovery flows, account migration and shared-device logins are where most real-world adoption still stalls.",
      "For everyday users, the practical result is fewer phishing-prone logins and one less password to reuse. For attackers, it closes off one of the cheapest ways in."
    ]
  },
  {
    slug: "inside-the-new-race-to-build-in-orbit",
    section: "latest",
    tag: "SPACE",
    title: "Inside the new race to build in orbit",
    dek: "Inside the new race to build in orbit",
    image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?auto=format&fit=crop&w=1200&q=85",
    minutes: 7,
    date: "2026-08-18",
    body: [
      "Falling launch costs have turned orbital manufacturing from a thought experiment into a real line item for a growing list of startups betting on zero gravity as a genuine industrial advantage.",
      "The first products are narrow — specialty fiber optics, protein crystals for drug research — but the economics are starting to work at small scale.",
      "The bottleneck now isn't getting to orbit, it's what comes after: return capsules, in-space assembly, and the unglamorous logistics of turning an experiment into a supply chain."
    ]
  },
  {
    slug: "technology-is-only-useful-when-it-gives-us-room-to-think",
    section: "ai-and-data",
    tag: "WORK",
    title: "Technology is only useful when it gives us more room to think.",
    dek: "The smartest companies aren't just automating tasks. They're redesigning the work around the people doing it.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=85",
    minutes: 6,
    date: "2026-08-22",
    body: [
      "Automation has always sold itself on speed. But the companies getting the most out of AI right now aren't the ones automating the most tasks — they're the ones rethinking which tasks a human should be doing at all.",
      "That distinction matters. Bolting an assistant onto an unchanged workflow tends to save a few minutes and create a new review step. Redesigning the workflow around what the tool is actually good at tends to remove whole categories of work.",
      "The common thread across the teams doing this well: they treat the redesign, not the tool, as the hard part — and they measure success in judgment freed up, not just hours saved."
    ]
  },
  {
    slug: "the-next-generation-of-ai-is-moving-out-of-the-chat-window",
    section: "ai-and-data",
    tag: "AI & DATA",
    title: "The next generation of AI is moving out of the chat window",
    dek: "Agents, interfaces and fresh ways of thinking are putting intelligence to work.",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85",
    minutes: 5,
    date: "2026-08-17",
    body: [
      "The chatbot was a convenient first interface for language models, not their natural home. The next wave of products treats the model as a background process — an agent that acts on a goal rather than waits for a prompt.",
      "That shift changes what good design looks like: less about a clever conversational tone, more about clear boundaries, checkpoints and the ability for a person to intervene before an agent commits to something irreversible.",
      "The products getting this right are, so far, narrow by design — one job, done reliably, rather than a general assistant that does everything passably."
    ]
  },
  {
    slug: "why-the-best-software-teams-are-getting-smaller",
    section: "ai-and-data",
    tag: "DEVELOPER",
    title: "Why the best software teams are getting smaller",
    dek: "A new playbook for building quickly without adding complexity.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=900&q=85",
    minutes: 4,
    date: "2026-08-16",
    body: [
      "AI-assisted coding hasn't just made individual engineers faster — it's changed the math on how many people a given amount of software actually needs.",
      "Teams that have leaned into this are shipping with three or four engineers what used to take a dozen, largely by cutting coordination overhead rather than by any one person doing more raw typing.",
      "The catch is that it rewards seniority: judgment about what not to build matters more than ever when the cost of building the wrong thing quickly is just as quick."
    ]
  },
  {
    slug: "a-clear-eyed-guide-to-the-world-being-built-now",
    section: "ai-and-data",
    tag: "FUTURE",
    title: "A clear-eyed guide to the world being built now",
    dek: "The infrastructure shifts that will define the next decade.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=900&q=85",
    minutes: 8,
    date: "2026-08-15",
    body: [
      "Underneath the product headlines, the infrastructure layer — power, compute, networking — is being rebuilt at a pace not seen since the original buildout of the cloud.",
      "That rebuild is what actually constrains how fast the next decade of software arrives, far more than any single model release does.",
      "Understanding where the real bottlenecks sit — energy, chips, or something more mundane like permitting — is the difference between a useful forecast and a hopeful one."
    ]
  },
  {
    slug: "the-laptop-that-makes-work-feel-lighter",
    section: "gadgets",
    tag: "REVIEW",
    title: "A laptop that makes work feel lighter",
    dek: "We lived with it, worked on it and found out what really matters.",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=700&q=85",
    minutes: 6,
    date: "2026-08-14",
    body: [
      "Most laptop reviews obsess over benchmarks that rarely matter day to day. What actually changes how a machine feels to use is quieter: fan noise under real load, how warm the keyboard deck gets, whether the hinge still feels tight after a year.",
      "This one gets those unglamorous details right. It's not the fastest machine in its class on paper, but it's the one we reached for every day of testing without thinking about why.",
      "If your work is mostly writing, browsers and video calls rather than rendering or compiling, the extra benchmark headroom on offer elsewhere buys you very little in practice."
    ]
  },
  {
    slug: "the-best-screen-for-your-desk-tested",
    section: "gadgets",
    tag: "REVIEW",
    title: "The best screen for your desk, tested",
    dek: "We lived with it, worked on it and found out what really matters.",
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=85",
    minutes: 5,
    date: "2026-08-13",
    body: [
      "Monitor shopping is dominated by numbers that stop mattering past a point — refresh rate, brightness, color gamut. We tested for the things that actually affect an eight-hour workday.",
      "Text clarity at normal reading distance, how the panel handles mixed lighting through the day, and whether the stand actually adjusts to a comfortable height turned out to separate the good from the merely impressive-on-paper.",
      "For most desks, this is the rare case where the mid-tier option beat the flagship on the metrics that matter."
    ]
  },
  {
    slug: "can-a-phone-really-replace-your-camera",
    section: "gadgets",
    tag: "REVIEW",
    title: "Can a phone really replace your camera?",
    dek: "We lived with it, worked on it and found out what really matters.",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=700&q=85",
    minutes: 6,
    date: "2026-08-12",
    body: [
      "Computational photography has closed the gap with dedicated cameras faster than almost anyone expected, but the gap hasn't closed evenly across every kind of shot.",
      "In good light, the honest answer is yes — most people won't tell the difference, and won't need to. In low light, or when a subject is moving fast, the dedicated camera still wins clearly.",
      "The more interesting finding: the phone's biggest advantage isn't the sensor at all. It's that it's the camera you actually have with you."
    ]
  },
  {
    slug: "the-founders-choosing-slower-growth-on-purpose",
    section: "startups",
    tag: "STARTUPS",
    title: "The founders choosing slower growth on purpose",
    dek: "A quiet cohort of startups is trading hypergrowth for a longer runway — and it's working.",
    image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85",
    minutes: 5,
    date: "2026-08-21",
    body: [
      "The default startup story is still growth at all costs. But a growing number of founders — many of them repeat founders who lived through a harder shutdown the first time — are deliberately choosing a slower, profitable path instead.",
      "They point to the same reasoning: fewer, better customers found through word of mouth cost less to keep than a large base acquired through paid growth, and they don't churn at the first downturn.",
      "It's not a universal playbook — some markets genuinely reward speed — but it's changing what investors are willing to fund, and what founders are willing to optimize for."
    ]
  },
  {
    slug: "why-seed-rounds-are-getting-smaller-and-faster",
    section: "startups",
    tag: "FUNDING",
    title: "Why seed rounds are getting smaller and faster",
    dek: "AI-native teams are raising less capital and shipping sooner, and investors are adjusting to match.",
    image: "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=900&q=85",
    minutes: 4,
    date: "2026-08-19",
    body: [
      "A seed round that once had to fund eighteen months of headcount now often needs to fund a few months of infrastructure and a small team that ships product almost immediately.",
      "Investors have noticed. Round sizes are shrinking even as the pace of deal-making speeds up, because the diligence question has shifted from 'can they hire well' to 'can they ship, today, with what they already have.'",
      "The effect compounds: smaller rounds mean less dilution, which means founders can afford to say no to a bad term sheet more often than the previous generation could."
    ]
  },
  {
    slug: "the-solo-founder-companies-quietly-crossing-eight-figures",
    section: "startups",
    tag: "OPERATORS",
    title: "The solo-founder companies quietly crossing eight figures",
    dek: "One person, no employees, real revenue — and a playbook that's harder to copy than it looks.",
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=900&q=85",
    minutes: 6,
    date: "2026-08-16",
    body: [
      "A small but growing set of founders are running eight-figure-revenue businesses alone, using AI tools to cover the work that used to require a support team, a dev team and an ops hire.",
      "What's notable isn't that it's possible — small, high-margin software businesses have existed for years — it's how much further one person can now take it before the workload forces a hire.",
      "The honest caveat: this works best in narrow, well-understood markets. The moment the product needs genuine novelty in more than one direction at once, the model tends to break down."
    ]
  },
  {
    slug: "the-quiet-standard-fixing-a-decade-of-password-breaches",
    section: "cybersecurity",
    tag: "IDENTITY",
    title: "The quiet standard fixing a decade of password breaches",
    dek: "Passwordless authentication has moved from research paper to default setting — here's what changed.",
    image: "https://images.unsplash.com/photo-1614064548237-096d8f9e9db4?auto=format&fit=crop&w=900&q=85",
    minutes: 5,
    date: "2026-08-20",
    body: [
      "Most large breaches over the last decade trace back to the same root cause: a reused or stolen password. The industry has known the fix for years — public-key authentication instead of shared secrets — but adoption lagged until the major platforms made it the default.",
      "That default matters more than the standard itself. A secure option nobody enables doesn't reduce breach counts; a secure option enabled automatically does.",
      "The next fight is over recovery: what happens when someone loses every device that held their keys. That unglamorous problem, more than any cryptography, will decide how fast this fully replaces the password."
    ]
  },
  {
    slug: "ai-generated-phishing-is-outrunning-the-filters-built-to-catch-it",
    section: "cybersecurity",
    tag: "THREATS",
    title: "AI-generated phishing is outrunning the filters built to catch it",
    dek: "The tells that used to give away a scam email are disappearing, and detection is having to change with them.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=900&q=85",
    minutes: 6,
    date: "2026-08-18",
    body: [
      "Spam filters were built to catch the tells of a mass-produced scam: bad grammar, generic greetings, mismatched formatting. Generative tools have made all three trivial to fix, and detection systems trained on those tells are losing ground.",
      "The more effective defenses now look less at the writing and more at behavior — where a link actually leads, whether a sender's domain was registered last week, whether a request matches how that person has ever communicated before.",
      "For individuals, the practical advice hasn't changed much: verify unusual requests through a second channel. It's just gotten more necessary, not less, now that the writing itself gives nothing away."
    ]
  },
  {
    slug: "what-a-year-of-ransomware-disclosures-actually-taught-us",
    section: "cybersecurity",
    tag: "POLICY",
    title: "What a year of ransomware disclosures actually taught us",
    dek: "Mandatory breach reporting is producing better data than the industry has ever had — and it's not flattering.",
    image: "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=900&q=85",
    minutes: 7,
    date: "2026-08-15",
    body: [
      "New disclosure requirements have forced companies to report ransomware incidents in far more detail than most ever volunteered before, and the aggregated picture is less about sophisticated attackers than about basic hygiene failures.",
      "Unpatched software and reused credentials still account for the overwhelming majority of successful attacks — not novel exploits, not nation-state tooling.",
      "That's actually the encouraging part: the fixes for most of what's happening are well understood and unglamorous. The barrier is prioritization, not invention."
    ]
  },
  {
    slug: "the-four-day-week-experiments-that-actually-held-up",
    section: "future-of-work",
    tag: "CULTURE",
    title: "The four-day week experiments that actually held up",
    dek: "A wave of pilots is now years old. The results that stuck look different from the early headlines.",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=85",
    minutes: 5,
    date: "2026-08-19",
    body: [
      "The first four-day week pilots made headlines for the novelty. The pilots now several years in are more useful, because they show what actually held up once the novelty wore off.",
      "The companies still running it report the same finding: the schedule change alone did nothing. What mattered was the forced audit of meetings and handoffs that came with it.",
      "Where it's failed, it's usually because that audit never happened — teams tried to compress five days of the same work into four without cutting anything, and reverted within a year."
    ]
  },
  {
    slug: "managing-a-team-that-includes-an-ai-agent",
    section: "future-of-work",
    tag: "MANAGEMENT",
    title: "Managing a team that includes an AI agent",
    dek: "A new kind of teammate is showing up in standups, and the management playbook hasn't caught up.",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=900&q=85",
    minutes: 6,
    date: "2026-08-17",
    body: [
      "Managers are increasingly responsible for output that includes work done by an autonomous agent alongside their human reports, and most management training has nothing to say about it.",
      "The teams handling this well treat the agent's output the way they'd treat a junior hire's: reviewed, attributed, and accountable to someone — not as an infallible tool and not as a peer.",
      "The open question nobody has fully answered yet is performance review: how do you evaluate a person whose job increasingly includes deciding what to hand off to something that isn't a person at all."
    ]
  },
  {
    slug: "the-office-is-back-but-not-the-one-that-left",
    section: "future-of-work",
    tag: "WORKPLACE",
    title: "The office is back, but not the one that left",
    dek: "Return-to-office mandates won the argument. The buildings they're returning to look nothing like 2019.",
    image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=900&q=85",
    minutes: 4,
    date: "2026-08-14",
    body: [
      "Return-to-office mandates have mostly stuck, but the offices themselves have changed shape — fewer individual desks, far more of the floor plan given over to the kind of collaborative space that's hard to replicate remotely.",
      "That's not an accident. Companies that pushed hardest for a return did it specifically to protect the collaborative work, not the solo work that employees had already proven they could do just as well from home.",
      "The unresolved tension is commute cost versus that benefit — and it's the one variable that no office redesign can fix."
    ]
  }
];
