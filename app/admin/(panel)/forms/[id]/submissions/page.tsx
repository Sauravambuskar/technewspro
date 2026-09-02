import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormById, listSubmissions } from "@/lib/forms";
import PageHead from "../../../../components/PageHead";
import SubmissionTable from "./SubmissionTable";

export const dynamic = "force-dynamic";

export default async function FormSubmissions({ params }: { params: { id: string } }) {
  const form = await getFormById(params.id);
  if (!form) notFound();

  const submissions = await listSubmissions(form.id);

  return (
    <>
      <PageHead eyebrow="RESPONSES" title={form.name}>
        <Link className="adm-btn adm-btn-ghost" href={`/admin/forms/${form.id}`}>Edit the form</Link>
        {submissions.length > 0 && (
          <a className="adm-btn adm-btn-ghost" href={`/api/forms/${form.id}/submissions?format=csv`}>
            Export CSV
          </a>
        )}
      </PageHead>
      <SubmissionTable form={form} submissions={submissions} />
    </>
  );
}
