import { notFound } from "next/navigation";
import { getResourceById } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import PageHead from "../../../components/PageHead";
import ResourceEditor from "../ResourceEditor";

export const dynamic = "force-dynamic";

export default async function EditResource({ params }: { params: { id: string } }) {
  const [resource, sections] = await Promise.all([getResourceById(params.id), listSections()]);
  if (!resource) notFound();

  return (
    <>
      <PageHead eyebrow={`RESOURCE CENTER / ${resource.status.toUpperCase()}`} title="Edit resource" />
      <ResourceEditor resource={resource} sections={sections} />
    </>
  );
}
