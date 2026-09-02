import { allForms } from "@/lib/forms";
import PageHead from "../../../components/PageHead";
import PageEditor from "../PageEditor";

export const dynamic = "force-dynamic";

export default async function NewPage() {
  const forms = await allForms();

  return (
    <>
      <PageHead eyebrow="CONTENT / NEW" title="Create a page" />
      <PageEditor forms={forms} />
    </>
  );
}
