import Link from "next/link";
import { formatDate, type Article } from "@/lib/types";
import Thumb from "./Thumb";

/**
 * A horizontal listing row: thumbnail, category labels, headline and byline.
 * Used on the pages whose job is "scan a lot of stories" — category,
 * sub-category and search — where a card grid wastes vertical space and
 * buries the metadata.
 *
 * The labels and the byline use the same quiet treatment as the rest of the
 * site (small electric-blue caps, dot separators). They were solid filled
 * blocks, which made a page of rows read as a wall of colour and pulled the
 * eye away from the headline — the one thing a scanner is actually looking
 * for.
 */
export default function ArticleRow({
  article,
  sectionLabel,
  subcategoryLabel
}: {
  article: Article;
  /** e.g. "Finance & FinTech" — the label that leads the row. */
  sectionLabel?: string;
  subcategoryLabel?: string;
}) {
  const href = `/articles/${article.slug}`;

  return (
    <article className="article-row">
      <Link className="article-row-image" href={href} aria-hidden="true" tabIndex={-1}>
        <Thumb src={article.image} alt={article.imageAlt} />
      </Link>

      <div className="article-row-body">
        <p className="article-row-chips">
          {sectionLabel && <span className="row-chip row-chip-primary">{sectionLabel}</span>}
          {subcategoryLabel && <span className="row-chip">{subcategoryLabel}</span>}
          {!sectionLabel && !subcategoryLabel && <span className="row-chip">{article.tag}</span>}
        </p>

        <h3>
          <Link href={href}>{article.title}</Link>
        </h3>

        {/* Date, author and read time on one line. Splitting the read time onto
            its own row gave a three-word fact a full line of its own. */}
        <p className="article-row-meta">
          <span>{formatDate(article.date)}</span>
          <i />
          <span className="article-row-author">{article.author}</span>
          <i />
          <span>{article.minutes} min read</span>
        </p>
      </div>
    </article>
  );
}
