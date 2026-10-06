import type { Metadata } from "next";
import MainCategoriesLanding from "../components/MainCategoriesLanding";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Main categories | Sales Info Pro",
  description: "A simplified view of the main Sales Info Pro coverage categories.",
  alternates: { canonical: siteUrl("/main-categories") },
  robots: { index: false, follow: true }
};

export default async function MainCategoriesVersion() {
  return <MainCategoriesLanding />;
}
