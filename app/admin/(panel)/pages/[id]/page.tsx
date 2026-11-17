import { notFound } from "next/navigation";
import { allForms } from "@/lib/forms";
import { getPageById } from "@/lib/pages";
import PageHead from "../../../components/PageHead";
import PageEditor from "../PageEditor";

export const dynamic = "force-dynamic";

export default async function EditPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [page, forms] = await Promise.all([getPageById(params.id), allForms()]);
  if (!page) notFound();

  return (
    <>
      <PageHead eyebrow={`CONTENT / ${page.status.toUpperCase()}`} title="Edit page" />
      <PageEditor page={page} forms={forms} />
    </>
  );
}
