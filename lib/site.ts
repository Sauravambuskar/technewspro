import { listArticles } from "./articles";
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
  const [settings, sections, articles, resources] = await Promise.all([
    getSettings(),
    navSections(),
    listArticles({ status: "published" }),
    listResources({ status: "published" })
  ]);

  // Dropdowns list the section's sub-categories; sections without any fall back
  // to their most recent headlines so the menu is never empty.
  const categories: NavEntry[] = sections.map((section) => ({
    id: section.id,
    label: section.label,
    href: `/insights/${section.id}`,
    links: section.subcategories.length
      ? [...section.subcategories]
          .sort((a, b) => a.order - b.order)
          .map((sub) => ({ label: sub.label, href: `/insights/${section.id}/${sub.id}` }))
      : articles
          .filter((article) => article.section === section.id)
          .slice(0, DROPDOWN_LIMIT)
          .map((article) => ({ label: article.title, href: `/articles/${article.slug}` }))
  }));

  const resourceLinks: NavItem[] = RESOURCE_TYPES.filter((type) =>
    resources.some((resource) => resource.type === type)
  ).map((type) => ({
    label: RESOURCE_TYPE_LABELS[type].plural,
    href: `/resources/${type}`
  }));

  const menu: NavEntry[] = [
    ...categories,
    { id: "resources", label: "Resources", href: "/resources", links: resourceLinks },
    { id: "about", label: "About Us", href: "/about", links: [] },
    { id: "contact", label: "Contact Us", href: "/contact", links: [] }
  ];

  // Footer columns
  const nav: NavItem[] = categories.map(({ label, href }) => ({ label, href }));

  return { settings, nav, menu, resourceLinks };
}
