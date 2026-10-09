import { activeAds } from "./ads";
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

/** Everything the header and footer need, resolved once per request. */
export async function getSiteChrome() {
  const [settings, sections, resources, pages, ads] = await Promise.all([
    getSettings(),
    navSections(),
    listResources({ status: "published" }),
    listPages("published"),
    activeAds()
  ]);

  // Dropdowns list the section's sub-categories that actually have published
  // content — an empty sub-category is a thin page and doesn't earn a nav slot.
  // Sections with no qualifying sub-category fall back to recent headlines so
  // the menu is never empty.
  const categories: NavEntry[] = sections.map((section) => ({
    id: section.id,
    label: section.label,
    href: `/category/${section.id}`,
    links: []
  }));

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
    { id: "resources", label: "Resources", href: "/resources", links: [] },
    { id: "about", label: "About Us", href: "/about", links: [] },
    { id: "contact", label: "Contact Us", href: "/contact", links: [] },
    { id: "write-for-us", label: "Write For Us", href: "/write-for-us", links: [] },
    ...navPages
  ];

  // Footer columns
  const nav: NavItem[] = categories.map(({ label, href }) => ({ label, href }));

  return { settings, nav, menu, resourceLinks, footerPages, ads };
}
