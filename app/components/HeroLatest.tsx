import Link from "next/link";
import { formatDate, type Article, type Section } from "@/lib/types";

/** The recent-headlines rail that sits beside the hero copy. */
export default function HeroLatest({
  articles,
  sections
}: {
  articles: Article[];
  sections: Section[];
}) {
  if (articles.length === 0) return null;

  const labels = new Map(sections.map((s) => [s.id, s.label]));
  const [top, ...rest] = articles;

  return (
    <aside className="hero-latest" aria-label="Recent insights">
      <div className="hero-latest-head">
        <p>RECENT</p>
        <Link href="/category">All categories &rarr;</Link>
      </div>

      <Link className="hero-latest-lead" href={`/articles/${top.slug}`}>
        <div className="hero-latest-lead-image">
          {top.image && <img src={top.image} alt="" />}
          <span>{top.tag}</span>
        </div>
        <h3>{top.title}</h3>
        <p className="hero-latest-meta">
          {labels.get(top.section) ?? top.section} · {formatDate(top.date)} · {top.minutes} min read
        </p>
      </Link>

      <div className="hero-latest-list">
        {rest.map((article) => (
          <Link className="hero-latest-item" href={`/articles/${article.slug}`} key={article.id}>
            <div className="hero-latest-thumb">
              {article.image && <img src={article.image} alt="" loading="lazy" />}
            </div>
            <div>
              <h4>{article.title}</h4>
              <p className="hero-latest-meta">
                {labels.get(article.section) ?? article.section} · {formatDate(article.date)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  );
}
