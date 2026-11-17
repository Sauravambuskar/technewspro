import { notFound } from "next/navigation";
import { getResourceById } from "@/lib/resources";
import { allForms } from "@/lib/forms";
import { listSections } from "@/lib/sections";
import PageHead from "../../../components/PageHead";
import ResourceEditor from "../ResourceEditor";

export const dynamic = "force-dynamic";

export default async function EditResource(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const [resource, sections, forms] = await Promise.all([getResourceById(params.id), listSections(), allForms()]);
  if (!resource) notFound();

  return (
    <>
      <PageHead eyebrow={`RESOURCE CENTER / ${resource.status.toUpperCase()}`} title="Edit resource" />
      <ResourceEditor resource={resource} sections={sections} forms={forms} />
    </>
  );
}
