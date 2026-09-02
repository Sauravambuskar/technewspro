import Link from "next/link";
import { allForms, countSubmissions } from "@/lib/forms";
import PageHead from "../../components/PageHead";
import FormTable from "./FormTable";

export const dynamic = "force-dynamic";

export default async function FormsAdmin() {
  const [forms, counts] = await Promise.all([allForms(), countSubmissions()]);

  return (
    <>
      <PageHead eyebrow="CONTENT" title="Forms">
        <Link className="adm-btn adm-btn-accent" href="/admin/forms/new">+ New form</Link>
      </PageHead>
      <FormTable forms={forms} counts={counts} />
    </>
  );
}
