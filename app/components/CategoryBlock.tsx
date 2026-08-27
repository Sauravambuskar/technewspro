import Link from "next/link";
import { RESOURCE_TYPE_LABELS, formatDate, type Article, type Resource, type Section } from "@/lib/types";

type Props = {
  section: Section;
  articles: Article[];
  resources: Resource[];
  /** Alternates the background so consecutive blocks stay legible. */
  tone: "light" | "tint";
};

export default function CategoryBlock({ section, articles, resources, tone }: Props) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles;
  const secondary = rest.slice(0, 4);
  const related = resources.slice(0, 2);

  return (
    <section className={`cat-block cat-${tone}`} id={section.id}>
      <div className="section-heading">
        <p>{section.eyebrow}</p>
        <h2>{section.heading}</h2>
        <Link href={`/category/${section.id}`}>{section.cta} <span>&rarr;</span></Link>
      </div>

      <div className="cat-layout">
        <article className="cat-lead">
          <Link href={`/articles/${lead.slug}`} className="cat-lead-image">
            {lead.image && <img src={lead.image} alt="" loading="lazy" />}
            <span>{lead.tag}</span>
          </Link>
          <p className="cat-lead-meta">{formatDate(lead.date)} · {lead.minutes} min read</p>
          <h3><Link href={`/articles/${lead.slug}`}>{lead.title}</Link></h3>
          <p className="cat-lead-dek">{lead.dek}</p>
          <Link href={`/articles/${lead.slug}`} className="read-link dark-link">
            Read the analysis <span>&rarr;</span>
          </Link>
        </article>

        <div className="cat-rest">
          {secondary.map((article, i) => (
            <Link className="cat-item" href={`/articles/${article.slug}`} key={article.id}>
              <div className="cat-item-image">
                {article.image && <img src={article.image} alt="" loading="lazy" />}
              </div>
              <div className="cat-item-body">
                <span>0{i + 2} / {article.tag}</span>
                <h4>{article.title}</h4>
                <p>{formatDate(article.date)} · {article.minutes} min read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {related.length > 0 && (
        <div className="cat-research">
          <p className="cat-research-label">RELATED RESEARCH</p>
          <div className="cat-research-row">
            {related.map((resource) => (
              <Link
                className="cat-research-card"
                href={`/resources/${resource.type}/${resource.slug}`}
                key={resource.id}
              >
                {resource.image && <img src={resource.image} alt="" loading="lazy" />}
                <div>
                  <span>
                    {RESOURCE_TYPE_LABELS[resource.type].singular}
                    {resource.gated ? " · gated" : ""}
                  </span>
                  <h4>{resource.title}</h4>
                  <p>{resource.pages > 0 ? `${resource.pages} pages` : "Open access"}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
