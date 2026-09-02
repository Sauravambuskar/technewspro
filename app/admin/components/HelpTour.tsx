"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

// Guided walkthrough for the control panel, powered by Driver.js.
//
// It runs by itself the first time an author signs in, and after that from the
// "Guide me" button in the corner of every screen. Each screen has its own set
// of steps, so the tour always explains whatever is actually on the page.
//
// Every step targets a `data-tour="…"` hook rather than a class name, so
// restyling a screen can't silently break the tour. Steps whose element isn't
// in the DOM (an empty drafts table, a create screen with no delete button) are
// dropped before the tour starts, so one definition covers every state.

const SEEN_KEY = "tnp-admin-tour-seen";

function seen() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private mode or blocked storage: treat it as seen so we never nag.
    return true;
  }
}

function markSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    // Nothing to do — the tour still ran, which is what matters.
  }
}

/* ------------------------------------------------------------ shared steps */

const WELCOME: DriveStep = {
  popover: {
    title: "Welcome to the control panel",
    description:
      "This is where every word on the public site is written and edited. Here's a quick look around — use the buttons or the arrow keys, and press Escape whenever you've seen enough."
  }
};

const SIDEBAR: DriveStep = {
  element: '[data-tour="nav"]',
  popover: {
    title: "Everything lives here",
    description:
      "Your main navigation, on every screen. The numbers are things waiting for you — unpublished drafts, unread mail, new leads.",
    side: "right",
    align: "start"
  }
};

const HELP: DriveStep = {
  element: '[data-tour="help-button"]',
  popover: {
    title: "Stuck? Come back here",
    description:
      "This button is on every screen, and the walkthrough it plays is written for whichever screen you're on. Nothing in the tour changes your content.",
    side: "left",
    align: "end"
  }
};

/* ------------------------------------------- the full first-run product tour */

/** Walks the whole sidebar, so a new author sees what each area is for. */
const PRODUCT_TOUR: DriveStep[] = [
  WELCOME,
  SIDEBAR,
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: "1. Dashboard",
      description:
        "Where you land: reads, downloads, leads and what's still sitting in draft. Start here to see whether anything needs attention.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-articles"]',
    popover: {
      title: "2. Articles",
      description:
        "Your stories — writing, editing, publishing and deleting. This is where most of the day-to-day work happens.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-resources"]',
    popover: {
      title: "3. Resources",
      description:
        "Whitepapers, ebooks, case studies and press releases. These can be gated, so a reader has to leave their details before downloading.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-pages"]',
    popover: {
      title: "4. Pages",
      description:
        "Standalone pages that sit outside the categories — privacy policy, terms, advertise with us. Each one gets a clean address at the site root and can be linked from the nav, the footer, or neither.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-forms"]',
    popover: {
      title: "5. Forms",
      description:
        "Build a form field by field — text, email, dropdowns, tick boxes — then attach it to a page. Everything people send lands under the form's Responses, and exports as CSV.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-sections"]',
    popover: {
      title: "6. Sections",
      description:
        "Your categories and sub-categories. Renaming one here updates it everywhere — navigation, category pages, breadcrumbs and the sitemap.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-ticker"]',
    popover: {
      title: "7. News ticker",
      description:
        "The scrolling headline bar at the top of the public site. Add lines, reorder them, or switch the whole thing off.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-leads"]',
    popover: {
      title: "8. Leads",
      description:
        "Everyone who filled in a gated download or a partnership form, and which resource they wanted. Exportable as CSV.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-subscribers"]',
    popover: {
      title: "9. Subscribers",
      description:
        "Your newsletter list, with the page each sign-up came from. You can unsubscribe someone by hand and export the list.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-messages"]',
    popover: {
      title: "10. Inbox",
      description:
        "Messages sent through the contact form. The badge counts unread ones, and clears as you open them.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-settings"]',
    popover: {
      title: "11. Site settings",
      description:
        "The words around the content: site name, homepage hero, About and Contact copy, footer and social links. Every field is live text on the public site.",
      side: "right"
    }
  },
  {
    element: '[data-tour="nav-team"]',
    popover: {
      title: "12. Team",
      description:
        "Add editors or admins, change a password, remove an account. If you're still on the default password, change it here first.",
      side: "right"
    }
  },
  {
    element: '[data-tour="stats"]',
    popover: {
      title: "13. Your numbers at a glance",
      description:
        "Refreshed on every visit. “Drafts waiting” is the useful one — it's how much is written but not yet live.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="dash-tables"]',
    popover: {
      title: "14. What's working",
      description:
        "Your best-read stories, how coverage splits across categories, and anything still in draft. Click any title to open it.",
      side: "top"
    }
  },
  {
    element: '[data-tour="page-actions"]',
    popover: {
      title: "15. Write something",
      description: "The quickest way into a blank story or resource. These buttons sit at the top of most screens.",
      side: "bottom",
      align: "end"
    }
  },
  {
    element: '[data-tour="view-site"]',
    popover: {
      title: "16. See it as a reader does",
      description: "Opens the public site in a new tab, so you can check your work without losing your place here.",
      side: "right"
    }
  },
  {
    element: '[data-tour="account"]',
    popover: {
      title: "17. You, and the way out",
      description: "Who you're signed in as and what you're allowed to do, with the sign-out button underneath.",
      side: "right"
    }
  },
  HELP
];

/* ---------------------------------------------------------- per-screen tours */

const EDITOR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="editor-content"]',
    popover: {
      title: "1. Start with the writing",
      description: "The headline, the line underneath it, and the body copy. Everything else on this page supports these three.",
      side: "top"
    }
  },
  {
    element: '[data-tour="f-title"]',
    popover: {
      title: "2. The headline",
      description: "Typing here fills in the URL slug automatically — until you edit the slug yourself, at which point it stops.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="f-dek"]',
    popover: {
      title: "3. The standfirst",
      description:
        "One or two sentences under the headline. It's also used on every card, and as the meta description if you don't write a separate one.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="f-body"]',
    popover: {
      title: "4. The body",
      description: "Leave a blank line between paragraphs — each block becomes its own paragraph. The read time is counted from this.",
      side: "top"
    }
  },
  {
    element: '[data-tour="f-category"]',
    popover: {
      title: "5. Category",
      description: "Decides which section page it lists under, and the first part of its URL. Manage the list under Sections.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="f-subcategory"]',
    popover: {
      title: "6. Sub-category",
      description:
        "Optional, and it resets when you change category. A sub-category stays out of the nav and sitemap until it has at least one published article.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="f-tags"]',
    popover: {
      title: "7. Tags",
      description:
        "Comma-separated, for narrower topics. Use these instead of inventing a new category every time a subject comes up.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="f-slug"]',
    popover: {
      title: "8. The URL",
      description:
        "The address readers and Google will use. Worth changing before you publish; changing it afterwards breaks any existing links.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="editor-image"]',
    popover: {
      title: "9. The main image",
      description:
        "Paste a URL, or press Upload to store a file in the database. This is also the default image used when the page is shared.",
      side: "top"
    }
  },
  {
    element: '[data-tour="seo-search"]',
    popover: {
      title: "10. How Google sees it",
      description: "The next few steps cover search. Leave all of it empty and the page still works — these are overrides.",
      side: "top"
    }
  },
  {
    element: '[data-tour="s-google"]',
    popover: {
      title: "11. The search preview",
      description: "A live mock-up of your result in Google. It updates as you type in the fields below.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="s-keyphrase"]',
    popover: {
      title: "12. Focus keyphrase",
      description:
        "The phrase you want this page to rank for. Type one and a checklist appears, telling you where it is and isn't used.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="s-title"]',
    popover: {
      title: "13. SEO title and description",
      description:
        "The meter turns amber then red as you approach the length Google truncates at. Leave them empty to reuse the headline and standfirst.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="s-indexing"]',
    popover: {
      title: "14. Keeping a page out of Google",
      description:
        "Set it to noindex and the page stays live for anyone with the link, but drops out of search results and out of your sitemap.",
      side: "top"
    }
  },
  {
    element: '[data-tour="seo-social"]',
    popover: {
      title: "15. How a shared link looks",
      description:
        "What Facebook, LinkedIn, WhatsApp and X show. The preview is above; empty fields fall back to your SEO title, description and main image.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-publishing"]',
    popover: {
      title: "16. Draft until you say so",
      description: "Nothing is visible on the public site while the status is Draft. Switch to Published, save, and it's live.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-save"]',
    popover: {
      title: "17. Save your work",
      description: "Changes aren't stored until you press this. There's no autosave, so save before you navigate away.",
      side: "top",
      align: "start"
    }
  }
];

/** Custom pages have no category or hero image, so they get their own walkthrough. */
const PAGE_EDITOR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="editor-content"]',
    popover: {
      title: "1. What a page is for",
      description:
        "Standalone content that isn't news — a privacy policy, terms, an advertise-with-us page. It sits outside the categories and never appears in the article feeds.",
      side: "top"
    }
  },
  {
    element: '[data-tour="f-title"]',
    popover: {
      title: "2. The title",
      description: "Typing here fills in the address below, until you edit that yourself.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="f-body"]',
    popover: {
      title: "3. The body",
      description: "Leave a blank line between paragraphs — each block becomes its own paragraph on the page.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-layout"]',
    popover: {
      title: "4. Pick a layout",
      description:
        "Default keeps the header, footer and a centred reading column — right for policies. Full width keeps the chrome but lets the content run edge to edge. Canvas strips everything for a standalone landing page.",
      side: "top"
    }
  },
  {
    element: '[data-tour="f-slug"]',
    popover: {
      title: "5. Its address",
      description:
        "Pages live at the site root, so this one will be reachable at /your-slug. Addresses the site already uses — /about, /contact, /category — are taken, and saving will move you to the next free one.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="editor-placement"]',
    popover: {
      title: "6. Where it gets linked",
      description:
        "Nav puts it in the top menu; footer puts it in the bottom links. Legal pages usually want the footer only. Tick neither and the page still works — it's just unlisted.",
      side: "top"
    }
  },
  {
    element: '[data-tour="seo-search"]',
    popover: {
      title: "7. Search and social",
      description:
        "The same SEO and sharing controls as an article. Policy pages are often set to noindex here so they stay out of search results.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-publishing"]',
    popover: {
      title: "8. Draft until you say so",
      description: "Nothing is visible on the public site while the status is Draft.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-save"]',
    popover: {
      title: "9. Save your work",
      description: "Changes aren't stored until you press this. There's no autosave.",
      side: "top",
      align: "start"
    }
  }
];

const FORM_EDITOR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="form-basics"]',
    popover: {
      title: "1. Name it and word it",
      description:
        "The name is only for you. The intro sits above the first field, the button text is what people click, and the thank-you message replaces the form once it's sent.",
      side: "top"
    }
  },
  {
    element: '[data-tour="form-fields"]',
    popover: {
      title: "2. Build the fields",
      description:
        "Add what you need to collect, in the order you want it asked. Click any field to open its settings, and use the arrows to reorder.",
      side: "top"
    }
  },
  {
    element: '[data-tour="form-fields"] .adm-fb-field:first-child',
    popover: {
      title: "3. What a field can be",
      description:
        "Nine types — single line, paragraph, email, phone, number, date, dropdown, choose-one and a tick box. Set a label, mark it required, and put two short fields side by side with half width.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="form-publishing"]',
    popover: {
      title: "4. Publish, then attach it",
      description:
        "A draft form stays hidden even on a live page. Publish it, then pick it in the Form box on any page under Pages — that's what puts it on the site.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-save"], [data-tour="form-publishing"] .adm-form-actions',
    popover: {
      title: "5. Save, and read the replies",
      description:
        "Nothing is stored until you save. Once the form is live, View responses shows everything sent to it, with a CSV export.",
      side: "top",
      align: "start"
    }
  }
];

const tableSteps = (noun: string): DriveStep[] => [
  {
    element: '[data-tour="toolbar"]',
    popover: {
      title: "1. Find things fast",
      description: "Search runs across titles, slugs, tags and authors. The dropdowns narrow the list to a status or a category.",
      side: "bottom",
      align: "start"
    }
  },
  {
    element: '[data-tour="table"]',
    popover: {
      title: `2. Your ${noun}`,
      description: "Click a title to open it in the editor. Drafts are marked, so you can see at a glance what isn't live yet.",
      side: "top"
    }
  },
  {
    element: '[data-tour="table"] tbody tr:first-child',
    popover: {
      title: "3. Row actions",
      description:
        "The buttons on the right publish or unpublish without opening the editor, and delete for good. Deleting asks first, and can't be undone.",
      side: "bottom"
    }
  },
  {
    element: '[data-tour="page-actions"]',
    popover: {
      title: `4. Start a new ${noun.replace(/s$/, "")}`,
      description: "Opens a blank editor. It saves as a draft first, so nothing goes live by accident.",
      side: "bottom",
      align: "end"
    }
  }
];

/** Page-specific steps, keyed by the most specific matching route. */
function stepsForPath(pathname: string): DriveStep[] {
  if (/^\/admin\/forms\/[^/]+\/submissions$/.test(pathname)) {
    return [
      {
        element: '[data-tour="page-body"]',
        popover: {
          title: "Everything people sent",
          description:
            "One row per response, in the order your fields are asked. Export the lot as CSV, or delete a row you don't need. There's no email notification — responses live here.",
          side: "top"
        }
      }
    ];
  }
  if (/^\/admin\/forms\/(new|[^/]+)$/.test(pathname)) return FORM_EDITOR_STEPS;
  if (/^\/admin\/pages\/(new|[^/]+)$/.test(pathname)) return PAGE_EDITOR_STEPS;
  if (/^\/admin\/(articles|resources)\/(new|[^/]+)$/.test(pathname)) return EDITOR_STEPS;

  switch (pathname) {
    case "/admin":
      // The dashboard is the natural home, so its button replays the full tour.
      return PRODUCT_TOUR.slice(2, -1);

    case "/admin/articles":
      return tableSteps("articles");
    case "/admin/resources":
      return tableSteps("resources");
    case "/admin/pages":
      return tableSteps("pages");
    case "/admin/forms":
      return [
        {
          element: '[data-tour="page-body"]',
          popover: {
            title: "Your forms",
            description:
              "Each row is a form you've built, with how many responses it has collected. Open one to edit its fields, or jump straight to the responses.",
            side: "top"
          }
        },
        {
          element: '[data-tour="page-actions"]',
          popover: {
            title: "Build a new one",
            description:
              "Starts you off with name, email and message — change or remove any of them. Publish it, then attach it to a page.",
            side: "bottom",
            align: "end"
          }
        }
      ];

    case "/admin/sections":
      return [
        {
          element: '[data-tour="sections"]',
          popover: {
            title: "1. Your categories",
            description:
              "Renaming one updates it everywhere — navigation, category pages, breadcrumbs, SEO titles and the sitemap. The order here is the order readers see.",
            side: "top"
          }
        },
        {
          element: '[data-tour="sections"] .adm-subs',
          popover: {
            title: "2. Sub-categories",
            description:
              "Each one gets its own page and its own slot in the nav dropdown — but only once it has a published article behind it, so you never ship an empty page.",
            side: "top"
          }
        },
        {
          element: '[data-tour="sections-save"]',
          popover: {
            title: "3. Save when you're done",
            description: "Every edit above is held in the browser until you press this. Nothing changes on the live site before then.",
            side: "top",
            align: "start"
          }
        }
      ];

    case "/admin/ticker":
      return [
        {
          element: '[data-tour="page-body"]',
          popover: {
            title: "The scrolling headline bar",
            description:
              "These run across the top of the public site. Reorder them, switch individual ones off, or clear the lot — the bar hides itself when nothing is enabled.",
            side: "top"
          }
        }
      ];

    case "/admin/leads":
      return [
        {
          element: '[data-tour="page-body"]',
          popover: {
            title: "Who asked for what",
            description:
              "Everyone who filled in a gated download or a partnership form, with the resource they wanted. Export the lot as CSV to work on it elsewhere.",
            side: "top"
          }
        }
      ];

    case "/admin/subscribers":
      return [
        {
          element: '[data-tour="page-body"]',
          popover: {
            title: "Your newsletter list",
            description:
              "Sign-ups from the site, with where each one came from. You can unsubscribe someone by hand and export the list as CSV.",
            side: "top"
          }
        }
      ];

    case "/admin/messages":
      return [
        {
          element: '[data-tour="page-body"]',
          popover: {
            title: "Messages from readers",
            description:
              "Everything sent through the contact form. Unread ones are marked down the left — opening one clears the badge in the sidebar.",
            side: "top"
          }
        }
      ];

    case "/admin/settings":
      return [
        {
          element: '[data-tour="page-body"]',
          popover: {
            title: "The words around the content",
            description:
              "Site name, the homepage hero, the About and Contact copy, footer and social links. Every field here is live text on the public site — save and it's changed.",
            side: "top"
          }
        }
      ];

    case "/admin/team":
      return [
        {
          element: '[data-tour="page-body"]',
          popover: {
            title: "Who can sign in",
            description:
              "Add editors or admins, change a password, or remove an account. If you're still on the default password, change it here first.",
            side: "top"
          }
        }
      ];

    default:
      return [];
  }
}

export default function HelpTour() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const autoStarted = useRef(false);

  const run = useCallback(
    (steps: DriveStep[]) => {
      // Drop anything that isn't on this particular page, so an empty table or a
      // create screen never leaves the tour pointing at nothing.
      const usable = steps.filter((step) => !step.element || document.querySelector(step.element as string));
      if (usable.length === 0) return;

      driver({
        showProgress: true,
        allowClose: true,
        overlayColor: "#11131a",
        overlayOpacity: 0.7,
        stagePadding: 6,
        stageRadius: 6,
        popoverClass: "adm-tour",
        nextBtnText: "Next →",
        prevBtnText: "← Back",
        doneBtnText: "Got it",
        steps: usable,
        onDestroyed: markSeen
      }).drive();
    },
    []
  );

  const startTour = useCallback(() => {
    run([WELCOME, SIDEBAR, ...stepsForPath(pathname), HELP]);
  }, [pathname, run]);

  useEffect(() => {
    setReady(true);

    // First sign-in: introduce the whole panel without waiting to be asked.
    // Only ever once — finishing or dismissing it is enough to stop it coming back.
    if (seen()) return;

    // Let the screen settle first, so nothing is highlighted mid-layout. The ref
    // is set inside the callback, not before it: in StrictMode this effect is
    // mounted twice, and guarding early would let the cleanup cancel the only
    // timer we ever scheduled.
    const timer = window.setTimeout(() => {
      if (autoStarted.current) return;
      autoStarted.current = true;
      run(PRODUCT_TOUR);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [run]);

  return (
    <button
      type="button"
      className="adm-help-fab"
      data-tour="help-button"
      onClick={startTour}
      disabled={!ready}
      aria-label="Show me around this screen"
      title="Show me around this screen"
    >
      <span aria-hidden="true">?</span>
      Guide me
    </button>
  );
}
