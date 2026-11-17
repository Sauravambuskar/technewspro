import { notFound } from "next/navigation";
import { getFormById } from "@/lib/forms";
import PageHead from "../../../components/PageHead";
import FormEditor from "../FormEditor";

export const dynamic = "force-dynamic";

export default async function EditForm(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const form = await getFormById(params.id);
  if (!form) notFound();

  return (
    <>
      <PageHead eyebrow={`CONTENT / ${form.status.toUpperCase()}`} title="Edit form" />
      <FormEditor form={form} />
    </>
  );
}
