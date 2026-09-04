import Link from "next/link";
import { formatDate, type Article } from "@/lib/types";
import Thumb from "./Thumb";

/**
 * A dense horizontal listing row: thumbnail, category chips, headline, byline
 * and read time. Used on the pages whose job is "scan a lot of stories" —
 * category, sub-category and search — where a card grid wastes vertical space
 * and buries the metadata.
 */
export default function ArticleRow({
  article,
  sectionLabel,
  subcategoryLabel
}: {
  article: Article;
  /** e.g. "Finance & FinTech" — the chip that leads the row. */
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
        <div className="article-row-chips">
          {sectionLabel && <span className="row-chip row-chip-primary">{sectionLabel}</span>}
          {subcategoryLabel && <span className="row-chip">{subcategoryLabel}</span>}
          {!sectionLabel && !subcategoryLabel && <span className="row-chip">{article.tag}</span>}
        </div>

        <h3>
          <Link href={href}>{article.title}</Link>
        </h3>

        <p className="article-row-meta">
          <span>{formatDate(article.date)}</span>
          <i />
          <span className="article-row-author">{article.author}</span>
        </p>

        <p className="article-row-time">
          {/* A clock, drawn inline so the row costs no extra request. */}
          <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
            <circle cx="8" cy="8" r="6.6" fill="none" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 4.4V8l2.5 1.6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {article.minutes} min read
        </p>
      </div>
    </article>
  );
}
