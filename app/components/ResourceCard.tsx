import Link from "next/link";
import { RESOURCE_TYPE_LABELS, formatDate, type Resource } from "@/lib/types";

export default function ResourceCard({ resource }: { resource: Resource }) {
  const label = RESOURCE_TYPE_LABELS[resource.type].singular;

  return (
    <article className="resource-card">
      <div className="resource-card-image">
        {resource.image && <img src={resource.image} alt={resource.imageAlt} loading="lazy" />}
        <span className="resource-type">{label}</span>
        {resource.gated && <span className="resource-gated">Gated</span>}
      </div>
      <div className="resource-card-body">
        <h3>{resource.title}</h3>
        <p>{resource.summary}</p>
        <div className="resource-card-meta">
          <span>{formatDate(resource.date)}</span>
          {resource.pages > 0 && <span>{resource.pages} pages</span>}
        </div>
        <Link href={`/resources/${resource.type}/${resource.slug}`}>
          {resource.gated ? "Get the download" : "Read now"} <b>&#8599;</b>
        </Link>
      </div>
    </article>
  );
}
