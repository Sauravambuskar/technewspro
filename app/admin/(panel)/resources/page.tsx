import Link from "next/link";
import { allResources } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import PageHead from "../../components/PageHead";
import ResourceTable from "./ResourceTable";

export const dynamic = "force-dynamic";

export default async function ResourcesAdmin() {
  const [resources, sections] = await Promise.all([allResources(), listSections()]);

  return (
    <>
      <PageHead eyebrow="RESOURCE CENTER" title="Resources">
        <Link className="adm-btn adm-btn-accent" href="/admin/resources/new">+ New resource</Link>
      </PageHead>
      <ResourceTable resources={resources} sections={sections} />
    </>
  );
}
