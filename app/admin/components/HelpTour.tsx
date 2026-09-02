"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

// Guided walkthrough for the control panel, powered by Driver.js.
//
// Every step targets a `data-tour="…"` hook rather than a class name, so
// restyling a screen can't silently break the tour. Steps whose element isn't
// in the DOM (an empty drafts table, a create screen with no delete button) are
// dropped before the tour starts, so one definition covers every state.

const SEEN_KEY = "tnp-admin-tour-seen";

/** Steps shown on every screen, before and after the page-specific ones. */
function sidebarStep(): DriveStep {
  return {
    element: '[data-tour="nav"]',
    popover: {
      title: "Everything lives here",
      description:
        "Your main navigation. Articles and Resources hold the content; Sections and News ticker shape how it's organised; Leads, Subscribers and Inbox are what readers send back.",
      side: "right",
      align: "start"
    }
  };
}

function helpStep(): DriveStep {
  return {
    element: '[data-tour="help-button"]',
    popover: {
      title: "Stuck? Come back here",
      description:
        "This button is on every screen, and the walkthrough it plays is written for whichever screen you're on. Nothing you do in the tour changes your content.",
      side: "left",
      align: "end"
    }
  };
}

const EDITOR_STEPS: DriveStep[] = [
  {
    element: '[data-tour="editor-content"]',
    popover: {
      title: "Start with the writing",
      description:
        "The headline, the standfirst underneath it, and the body. Leave a blank line between paragraphs — each block becomes its own paragraph on the site.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-placement"]',
    popover: {
      title: "Where it appears",
      description:
        "Category and sub-category decide which section page it lists under and its URL. Tags are for narrower topics — use them instead of inventing a new category.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-image"]',
    popover: {
      title: "The hero image",
      description:
        "Paste a URL, or press Upload to store a file in the database. This image is also the default one used when the page is shared on social media.",
      side: "top"
    }
  },
  {
    element: '[data-tour="seo-search"]',
    popover: {
      title: "How Google sees it",
      description:
        "The preview updates as you type. Set a focus keyphrase to get the checks below it, and use the Indexing controls to keep a page out of search results entirely.",
      side: "top"
    }
  },
  {
    element: '[data-tour="seo-social"]',
    popover: {
      title: "How a shared link looks",
      description:
        "What Facebook, LinkedIn, WhatsApp and X show. Leave these empty and they fall back to your SEO title, description and hero image — only fill them in when you want something different.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-publishing"]',
    popover: {
      title: "Draft until you say so",
      description:
        "Nothing is visible on the public site while the status is Draft. Switch to Published, save, and it goes live immediately.",
      side: "top"
    }
  },
  {
    element: '[data-tour="editor-save"]',
    popover: {
      title: "Save your work",
      description: "Changes aren't stored until you press this. There's no autosave.",
      side: "top",
      align: "start"
    }
  }
];

const TABLE_STEPS = (noun: string): DriveStep[] => [
  {
    element: '[data-tour="toolbar"]',
    popover: {
      title: "Find things fast",
      description: `Search runs across titles, slugs and authors. The dropdowns narrow the list down to a status or category.`,
      side: "bottom",
      align: "start"
    }
  },
  {
    element: '[data-tour="table"]',
    popover: {
      title: `Your ${noun}`,
      description: `Click a title to open it. The buttons on the right publish or unpublish it without opening the editor, and delete it for good.`,
      side: "top"
    }
  },
  {
    element: '[data-tour="page-actions"]',
    popover: {
      title: "Start something new",
      description: `Creates a blank ${noun.replace(/s$/, "")} and opens the editor on it.`,
      side: "bottom",
      align: "end"
    }
  }
];

/** Page-specific steps, keyed by the most specific matching route. */
function stepsForPath(pathname: string): DriveStep[] {
  if (/^\/admin\/articles\/(new|[^/]+)$/.test(pathname)) return EDITOR_STEPS;
  if (/^\/admin\/resources\/(new|[^/]+)$/.test(pathname)) return EDITOR_STEPS;

  switch (pathname) {
    case "/admin":
      return [
        {
          element: '[data-tour="stats"]',
          popover: {
            title: "The numbers that matter",
            description:
              "Reads, downloads, leads and unread mail, refreshed on every visit. Drafts waiting tells you how much is written but not yet live.",
            side: "bottom"
          }
        },
        {
          element: '[data-tour="page-actions"]',
          popover: {
            title: "Write something",
            description: "The quickest way into a blank story or resource from anywhere in the panel.",
            side: "bottom",
            align: "end"
          }
        },
        {
          element: '[data-tour="dash-tables"]',
          popover: {
            title: "What's working",
            description:
              "Your best-read stories, how your coverage splits across categories, and anything still sitting in draft.",
            side: "top"
          }
        }
      ];

    case "/admin/articles":
      return TABLE_STEPS("articles");
    case "/admin/resources":
      return TABLE_STEPS("resources");

    case "/admin/sections":
      return [
        {
          element: '[data-tour="sections"]',
          popover: {
            title: "Your categories",
            description:
              "Renaming one updates it everywhere — navigation, category pages, breadcrumbs and the sitemap. The order here is the order readers see.",
            side: "top"
          }
        },
        {
          element: '[data-tour="sections-save"]',
          popover: {
            title: "Save when you're done",
            description:
              "Edits to categories and sub-categories are held until you press this. A sub-category stays out of the nav and sitemap until it has a published article.",
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

  // The button is rendered by the server too, but the tour only means anything
  // once the page has hydrated and the anchors exist.
  useEffect(() => setReady(true), []);

  const startTour = useCallback(() => {
    const steps: DriveStep[] = [
      {
        popover: {
          title: "Welcome to the control panel",
          description:
            "A quick tour of this screen — three or four steps. Use the arrow keys or the buttons, and press Escape whenever you've seen enough."
        }
      },
      sidebarStep(),
      ...stepsForPath(pathname),
      helpStep()
    ];

    // Drop anything that isn't on this particular page, so an empty table or a
    // create screen never leaves the tour pointing at nothing.
    const usable = steps.filter(
      (step) => !step.element || document.querySelector(step.element as string)
    );

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
      steps: usable
    }).drive();

    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Private mode or blocked storage — the tour still ran, that's what matters.
    }
  }, [pathname]);

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
