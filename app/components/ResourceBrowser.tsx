"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  RESOURCE_TYPE_LABELS,
  formatDate,
  type Resource,
  type ResourceType,
  type Section
} from "@/lib/types";

type Props = {
  resources: Resource[];
  sections: Section[];
  /** When set the type filter is hidden — the page is already scoped to one type. */
  lockedType?: ResourceType;
};

export default function ResourceBrowser({ resources, sections, lockedType }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | "all">(lockedType ?? "all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");

  const labels = useMemo(() => new Map(sections.map((s) => [s.id, s.label])), [sections]);

  const visible = useMemo(() => {
    const term = query.trim().toLowerCase();

    const filtered = resources.filter((resource) => {
      if (type !== "all" && resource.type !== type) return false;
      if (category !== "all" && resource.category !== category) return false;
      if (!term) return true;
      return [resource.title, resource.summary, resource.highlights.join(" ")].some((value) =>
        value.toLowerCase().includes(term)
      );
    });

    return filtered.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "oldest") return a.date < b.date ? -1 : 1;
      return a.date < b.date ? 1 : -1;
    });
  }, [resources, query, type, category, sort]);

  const availableTypes = useMemo(
    () => Array.from(new Set(resources.map((r) => r.type))),
    [resources]
  );

  return (
    <>
      <div className="resource-filters" role="search">
        <input
          type="search"
          placeholder="Search titles and summaries…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search resources"
        />

        {!lockedType && (
          <label>
            <span className="sr-only">Filter by type</span>
            <select value={type} onChange={(e) => setType(e.target.value as ResourceType | "all")}>
              <option value="all">All formats</option>
              {availableTypes.map((value) => (
                <option key={value} value={value}>{RESOURCE_TYPE_LABELS[value].plural}</option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span className="sr-only">Filter by category</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All categories</option>
            {sections.map((section) => (
              <option key={section.id} value={section.id}>{section.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="sr-only">Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">A–Z</option>
          </select>
        </label>

        <p className="resource-count" aria-live="polite">
          {visible.length} of {resources.length}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className="resource-empty">
          Nothing matches those filters yet. Try clearing the search or choosing another category.
        </p>
      ) : (
        <div className="resource-grid">
          {visible.map((resource) => (
            <article className="resource-card" key={resource.id}>
              <div className="resource-card-image">
                {resource.image && <img src={resource.image} alt={resource.imageAlt} loading="lazy" />}
                <span className="resource-type">{RESOURCE_TYPE_LABELS[resource.type].singular}</span>
                {resource.gated && <span className="resource-gated">Gated</span>}
              </div>
              <div className="resource-card-body">
                <p className="resource-card-cat">{labels.get(resource.category) ?? resource.category}</p>
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
          ))}
        </div>
      )}
    </>
  );
}
