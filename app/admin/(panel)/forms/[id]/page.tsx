import { notFound } from "next/navigation";
import { getFormById } from "@/lib/forms";
import PageHead from "../../../components/PageHead";
import FormEditor from "../FormEditor";

export const dynamic = "force-dynamic";

export default async function EditForm({ params }: { params: { id: string } }) {
  const form = await getFormById(params.id);
  if (!form) notFound();

  return (
    <>
      <PageHead eyebrow={`CONTENT / ${form.status.toUpperCase()}`} title="Edit form" />
      <FormEditor form={form} />
    </>
  );
}
