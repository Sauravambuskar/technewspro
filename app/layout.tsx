import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { seedSettings } from "@/lib/seed";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  // This layout wraps the prerendered routes too (/robots.txt, the 404), so it
  // runs during `next build` — where the database is not reachable. Fall back to
  // the seeded defaults rather than failing the build; every real page overrides
  // these anyway, and the live request re-reads settings from the database.
  let settings = seedSettings();
  try {
    settings = await getSettings();
  } catch {
    // Build-time or database outage — the defaults above are good enough here.
  }

  return {
    title: settings.metaTitle,
    description: settings.metaDescription
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
