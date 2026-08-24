import Link from "next/link";
import { allArticles } from "@/lib/articles";
import { listSections } from "@/lib/sections";
import PageHead from "../../components/PageHead";
import ArticleTable from "./ArticleTable";

export const dynamic = "force-dynamic";

export default async function ArticlesAdmin() {
  const [articles, sections] = await Promise.all([allArticles(), listSections()]);

  return (
    <>
      <PageHead eyebrow="CONTENT" title="Articles">
        <Link className="adm-btn adm-btn-accent" href="/admin/articles/new">+ New story</Link>
      </PageHead>
      <ArticleTable articles={articles} sections={sections} />
    </>
  );
}
