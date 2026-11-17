import { listSections } from "@/lib/sections";
import { allForms } from "@/lib/forms";
import PageHead from "../../../components/PageHead";
import ResourceEditor from "../ResourceEditor";

export const dynamic = "force-dynamic";

export default async function NewResource() {
  const [sections, forms] = await Promise.all([listSections(), allForms()]);

  return (
    <>
      <PageHead eyebrow="RESOURCE CENTER / NEW" title="Add a resource" />
      <ResourceEditor sections={sections} forms={forms} />
    </>
  );
}
