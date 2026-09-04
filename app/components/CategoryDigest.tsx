import Link from "next/link";
import { formatDate, type Article, type Section } from "@/lib/types";

const PER_COLUMN = 5;

/**
 * A text-only scan of the whole site, one column per category. No thumbnails:
 * the point is to fit every desk's latest headlines above the fold, which
 * pictures would make impossible.
 */
export default function CategoryDigest({
  sections,
  articles
}: {
  sections: Section[];
  /** Published articles, newest first. */
  articles: Article[];
}) {
  const columns = sections
    .map((section) => ({
      section,
      items: articles.filter((article) => article.section === section.id).slice(0, PER_COLUMN)
    }))
    // A desk with nothing published would just be a heading over empty space.
    .filter((column) => column.items.length > 0);

  if (columns.length === 0) return null;

  return (
    <section className="digest" aria-label="Latest by category">
      <div className="digest-grid">
        {columns.map(({ section, items }) => (
          <div className="digest-col" key={section.id}>
            <h3>
              <Link href={`/category/${section.id}`}>{section.label}</Link>
            </h3>

            <ul>
              {items.map((article) => {
                const sub = section.subcategories.find((s) => s.id === article.subcategory);
                return (
                  <li key={article.id}>
                    {sub && <span className="digest-chip">{sub.label}</span>}
                    <Link href={`/articles/${article.slug}`}>{article.title}</Link>
                    <p>
                      {formatDate(article.date)} · {article.minutes} min read
                    </p>
                  </li>
                );
              })}
            </ul>

            <Link className="digest-more" href={`/category/${section.id}`}>
              All {section.label} <span>&rarr;</span>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
