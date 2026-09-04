import Link from "next/link";
import { formatDate, type Article, type Section } from "@/lib/types";
import Thumb from "./Thumb";

const PER_COLUMN = 5;

/**
 * One card per desk, straight after the hero. The lead story carries the
 * picture; the rest sit under it as headlines, so five categories still fit
 * across a screen instead of turning into five columns of photographs.
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
        {columns.map(({ section, items }) => {
          const [lead, ...rest] = items;
          const leadSub = section.subcategories.find((s) => s.id === lead.subcategory);

          return (
            <div className="digest-card" key={section.id}>
              <h3>
                <Link href={`/category/${section.id}`}>{section.label}</Link>
              </h3>

              <Link className="digest-lead" href={`/articles/${lead.slug}`}>
                <span className="digest-lead-image">
                  <Thumb src={lead.image} alt={lead.imageAlt} />
                </span>
                {leadSub && <span className="digest-chip">{leadSub.label}</span>}
                <b>{lead.title}</b>
                <em>
                  {formatDate(lead.date)} · {lead.minutes} min read
                </em>
              </Link>

              {rest.length > 0 && (
                <ul>
                  {rest.map((article) => {
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
              )}

              <Link className="digest-more" href={`/category/${section.id}`}>
                All {section.label} <span>&rarr;</span>
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
