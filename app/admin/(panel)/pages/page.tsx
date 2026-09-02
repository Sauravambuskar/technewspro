import Link from "next/link";
import { allPages } from "@/lib/pages";
import PageHead from "../../components/PageHead";
import PageTable from "./PageTable";

export const dynamic = "force-dynamic";

export default async function PagesAdmin() {
  const pages = await allPages();

  return (
    <>
      <PageHead eyebrow="CONTENT" title="Pages">
        <Link className="adm-btn adm-btn-accent" href="/admin/pages/new">+ New page</Link>
      </PageHead>
      <PageTable pages={pages} />
    </>
  );
}
