import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";
import { listPages } from "@/lib/pages";
import { listResources } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import { siteUrl } from "@/lib/seo";
import { RESOURCE_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, articles, resources, pages] = await Promise.all([
    listSections(),
    listArticles({ status: "published" }),
    listResources({ status: "published" }),
    listPages("published")
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/category"), changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/resources"), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 }
  ];

  return [
    ...staticPages,
    ...sections.map((section) => ({
      url: siteUrl(`/category/${section.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    // Only sub-categories with at least one published article are indexable —
    // an empty sub-category is a thin page and stays out of the sitemap.
    ...sections.flatMap((section) =>
      section.subcategories
        .filter((sub) => articles.some((a) => a.section === section.id && a.subcategory === sub.id))
        .map((sub) => ({
          url: siteUrl(`/category/${section.id}/${sub.id}`),
          changeFrequency: "weekly" as const,
          priority: 0.6
        }))
    ),
    ...RESOURCE_TYPES.map((type) => ({
      url: siteUrl(`/resources/${type}`),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    // A page marked noindex in its SEO box shouldn't be submitted for crawling either.
    ...articles
      .filter((article) => article.seo.index)
      .map((article) => ({
        url: siteUrl(`/articles/${article.slug}`),
        lastModified: new Date(article.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8
      })),
    ...resources
      .filter((resource) => resource.seo.index)
      .map((resource) => ({
        url: siteUrl(`/resources/${resource.type}/${resource.slug}`),
        lastModified: new Date(resource.updatedAt),
        changeFrequency: "monthly" as const,
        priority: 0.8
      })),
    ...pages
      .filter((page) => page.seo.index)
      .map((page) => ({
        url: siteUrl(`/${page.slug}`),
        lastModified: new Date(page.updatedAt),
        changeFrequency: "yearly" as const,
        priority: 0.4
      }))
  ];
}
