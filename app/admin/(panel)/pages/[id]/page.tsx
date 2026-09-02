import { notFound } from "next/navigation";
import { getPageById } from "@/lib/pages";
import PageHead from "../../../components/PageHead";
import PageEditor from "../PageEditor";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: { id: string } }) {
  const page = await getPageById(params.id);
  if (!page) notFound();

  return (
    <>
      <PageHead eyebrow={`CONTENT / ${page.status.toUpperCase()}`} title="Edit page" />
      <PageEditor page={page} />
    </>
  );
}
