import { activeAds } from "./ads";
import { listArticles } from "./articles";
import { listPages } from "./pages";
import { listResources } from "./resources";
import { navSections } from "./sections";
import { getSettings } from "./settings";
import { RESOURCE_TYPES, RESOURCE_TYPE_LABELS } from "./types";

export type NavItem = { label: string; href: string };

/** A top-level nav entry; `links` fills its dropdown when non-empty. */
export type NavEntry = NavItem & {
  id: string;
  links: NavItem[];
};

const DROPDOWN_LIMIT = 5;

/** Everything the header and footer need, resolved once per request. */
export async function getSiteChrome() {
  const [settings, sections, articles, resources, pages, ads] = await Promise.all([
    getSettings(),
    navSections(),
    listArticles({ status: "published" }),
    listResources({ status: "published" }),
    listPages("published"),
    activeAds()
  ]);

  // Dropdowns list the section's sub-categories that actually have published
  // content — an empty sub-category is a thin page and doesn't earn a nav slot.
  // Sections with no qualifying sub-category fall back to recent headlines so
  // the menu is never empty.
  const categories: NavEntry[] = sections.map((section) => {
    const liveSubcategories = [...section.subcategories]
      .sort((a, b) => a.order - b.order)
      .filter((sub) => articles.some((a) => a.section === section.id && a.subcategory === sub.id));

    return {
      id: section.id,
      label: section.label,
      href: `/category/${section.id}`,
      links: liveSubcategories.length
        ? liveSubcategories.map((sub) => ({ label: sub.label, href: `/category/${section.id}/${sub.id}` }))
        : articles
            .filter((article) => article.section === section.id)
            .slice(0, DROPDOWN_LIMIT)
            .map((article) => ({ label: article.title, href: `/articles/${article.slug}` }))
    };
  });

  const resourceLinks: NavItem[] = RESOURCE_TYPES.filter((type) =>
    resources.some((resource) => resource.type === type)
  ).map((type) => ({
    label: RESOURCE_TYPE_LABELS[type].plural,
    href: `/resources/${type}`
  }));

  // Custom pages opt in to the header and the footer independently.
  const navPages: NavEntry[] = pages
    .filter((page) => page.showInNav)
    .map((page) => ({ id: `page-${page.id}`, label: page.title, href: `/${page.slug}`, links: [] }));

  const footerPages: NavItem[] = pages
    .filter((page) => page.showInFooter)
    .map((page) => ({ label: page.title, href: `/${page.slug}` }));

  const menu: NavEntry[] = [
    ...categories,
    { id: "resources", label: "Resources", href: "/resources", links: resourceLinks },
    { id: "about", label: "About Us", href: "/about", links: [] },
    { id: "contact", label: "Contact Us", href: "/contact", links: [] },
    ...navPages
  ];

  // Footer columns
  const nav: NavItem[] = categories.map(({ label, href }) => ({ label, href }));

  return { settings, nav, menu, resourceLinks, footerPages, ads };
}
