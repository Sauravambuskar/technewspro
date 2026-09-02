import PageHead from "../../../components/PageHead";
import PageEditor from "../PageEditor";

export const dynamic = "force-dynamic";

export default function NewPage() {
  return (
    <>
      <PageHead eyebrow="CONTENT / NEW" title="Create a page" />
      <PageEditor />
    </>
  );
}
