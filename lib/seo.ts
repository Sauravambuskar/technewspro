/** Absolute site URL, used for canonical links, sitemaps and JSON-LD. */
export function siteUrl(path = "") {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  const base = explicit || (vercel ? `https://${vercel}` : "http://localhost:3000");
  return `${base.replace(/\/$/, "")}${path}`;
}
