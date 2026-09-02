import Link from "next/link";
import { formatDate, type Article } from "@/lib/types";

export default function ArticleCard({ article, showDate = false }: { article: Article; showDate?: boolean }) {
  return (
    <article className="review-card">
      <div className="review-image">
        {article.image && <img src={article.image} alt={article.imageAlt} loading="lazy" />}
        <span>{article.tag}</span>
      </div>
      <h3>{article.title}</h3>
      <p>{article.dek}</p>
      {showDate && (
        <p className="card-meta">
          {formatDate(article.date)} · {article.minutes} min read
        </p>
      )}
      <Link href={`/articles/${article.slug}`}>Read insight <b>&#8599;</b></Link>
    </article>
  );
}
