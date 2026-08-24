import type { MetadataRoute } from "next";
import { listArticles } from "@/lib/articles";
import { listResources } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import { siteUrl } from "@/lib/seo";
import { RESOURCE_TYPES } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sections, articles, resources] = await Promise.all([
    listSections(),
    listArticles({ status: "published" }),
    listResources({ status: "published" })
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: siteUrl("/insights"), changeFrequency: "daily", priority: 0.9 },
    { url: siteUrl("/resources"), changeFrequency: "weekly", priority: 0.9 },
    { url: siteUrl("/about"), changeFrequency: "monthly", priority: 0.6 },
    { url: siteUrl("/contact"), changeFrequency: "monthly", priority: 0.6 }
  ];

  return [
    ...staticPages,
    ...sections.map((section) => ({
      url: siteUrl(`/insights/${section.id}`),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...RESOURCE_TYPES.map((type) => ({
      url: siteUrl(`/resources/${type}`),
      changeFrequency: "weekly" as const,
      priority: 0.7
    })),
    ...articles.map((article) => ({
      url: siteUrl(`/articles/${article.slug}`),
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8
    })),
    ...resources.map((resource) => ({
      url: siteUrl(`/resources/${resource.type}/${resource.slug}`),
      lastModified: new Date(resource.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8
    }))
  ];
}
