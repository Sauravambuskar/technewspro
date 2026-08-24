import { listArticles } from "./articles";
import { navSections } from "./sections";
import { getSettings } from "./settings";

export type NavItem = { label: string; href: string };

/** A top-level nav entry plus the stories that fill its dropdown. */
export type NavSection = NavItem & {
  id: string;
  articles: { slug: string; title: string }[];
};

const DROPDOWN_LIMIT = 5;

/** Everything the header and footer need, resolved once per request. */
export async function getSiteChrome() {
  const [settings, sections, published] = await Promise.all([
    getSettings(),
    navSections(),
    listArticles({ status: "published" })
  ]);

  const menu: NavSection[] = sections.map((section) => ({
    id: section.id,
    label: section.label,
    href: `/#${section.id}`,
    articles: published
      .filter((article) => article.section === section.id)
      .slice(0, DROPDOWN_LIMIT)
      .map(({ slug, title }) => ({ slug, title }))
  }));

  const nav: NavItem[] = menu.map(({ label, href }) => ({ label, href }));
  return { settings, nav, menu };
}
