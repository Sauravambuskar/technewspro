import PageHead from "../../../components/PageHead";
import FormEditor from "../FormEditor";

export const dynamic = "force-dynamic";

export default function NewForm() {
  return (
    <>
      <PageHead eyebrow="CONTENT / NEW" title="Build a form" />
      <FormEditor />
    </>
  );
}
