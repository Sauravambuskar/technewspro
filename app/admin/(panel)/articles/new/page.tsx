import { listSections } from "@/lib/sections";
import PageHead from "../../../components/PageHead";
import ArticleEditor from "../ArticleEditor";

export const dynamic = "force-dynamic";

export default async function NewArticle() {
  const sections = await listSections();

  return (
    <>
      <PageHead eyebrow="CONTENT / NEW" title="Write a story" />
      <ArticleEditor sections={sections} />
    </>
  );
}
