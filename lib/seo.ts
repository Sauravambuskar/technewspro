import type { Metadata } from "next";
import type { Seo } from "./types";

/** Absolute site URL, used for canonical links, sitemaps and JSON-LD. */
export function siteUrl(path = "") {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const base = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path}`;
}

type SeoDefaults = {
  /** The item's own title, before the site name is appended. */
  title: string;
  description: string;
  image?: string;
  /** Site-relative path, e.g. /articles/my-story. */
  path: string;
  siteName: string;
};

/**
 * Folds a stored Seo override onto the item's own title/description/image.
 * Every override is optional, so an untouched SEO box produces exactly the
 * metadata the page would have had before the box existed.
 */
export function buildMetadata(seo: Seo, defaults: SeoDefaults, extra?: Metadata): Metadata {
  const canonical = seo.canonicalUrl || siteUrl(defaults.path);
  const title = seo.metaTitle || `${defaults.title} | ${defaults.siteName}`;
  const description = seo.metaDescription || defaults.description;

  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const ogImage = seo.ogImage || defaults.image || "";

  const twitterTitle = seo.twitterTitle || ogTitle;
  const twitterDescription = seo.twitterDescription || ogDescription;
  const twitterImage = seo.twitterImage || ogImage;

  return {
    title,
    description,
    alternates: { canonical },
    robots: {
      index: seo.index,
      follow: seo.follow,
      noimageindex: seo.advanced.includes("noimageindex"),
      nosnippet: seo.advanced.includes("nosnippet"),
      // Next maps `noarchive` through the googleBot block.
      googleBot: { index: seo.index, follow: seo.follow, noarchive: seo.advanced.includes("noarchive") }
    },
    ...extra,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: canonical,
      siteName: defaults.siteName,
      images: ogImage ? [ogImage] : undefined,
      ...extra?.openGraph
    },
    twitter: {
      card: seo.twitterCard,
      title: twitterTitle,
      description: twitterDescription,
      images: twitterImage ? [twitterImage] : undefined,
      ...extra?.twitter
    }
  };
}
