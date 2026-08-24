import { listSections } from "@/lib/sections";
import PageHead from "../../../components/PageHead";
import ResourceEditor from "../ResourceEditor";

export const dynamic = "force-dynamic";

export default async function NewResource() {
  const sections = await listSections();

  return (
    <>
      <PageHead eyebrow="RESOURCE CENTER / NEW" title="Add a resource" />
      <ResourceEditor sections={sections} />
    </>
  );
}
