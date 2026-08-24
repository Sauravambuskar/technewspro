import { notFound } from "next/navigation";
import { getArticleById } from "@/lib/articles";
import { listSections } from "@/lib/sections";
import PageHead from "../../../components/PageHead";
import ArticleEditor from "../ArticleEditor";

export const dynamic = "force-dynamic";

export default async function EditArticle({ params }: { params: { id: string } }) {
  const [article, sections] = await Promise.all([getArticleById(params.id), listSections()]);
  if (!article) notFound();

  return (
    <>
      <PageHead eyebrow={`CONTENT / ${article.status.toUpperCase()}`} title="Edit story" />
      <ArticleEditor article={article} sections={sections} />
    </>
  );
}
