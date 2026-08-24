import { allArticles } from "@/lib/articles";
import { listSections } from "@/lib/sections";
import PageHead from "../../components/PageHead";
import SectionManager from "./SectionManager";

export const dynamic = "force-dynamic";

export default async function SectionsAdmin() {
  const [sections, articles] = await Promise.all([listSections(), allArticles()]);

  const counts: Record<string, number> = {};
  for (const article of articles) counts[article.section] = (counts[article.section] ?? 0) + 1;

  return (
    <>
      <PageHead eyebrow="STRUCTURE" title="Sections" />
      <SectionManager sections={sections} counts={counts} />
    </>
  );
}
