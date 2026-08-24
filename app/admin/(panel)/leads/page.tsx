import { listLeads } from "@/lib/leads";
import PageHead from "../../components/PageHead";
import LeadTable from "./LeadTable";

export const dynamic = "force-dynamic";

export default async function LeadsAdmin() {
  const leads = await listLeads();

  return (
    <>
      <PageHead eyebrow="AUDIENCE" title="Leads">
        <a className="adm-btn adm-btn-ghost" href="/api/leads?format=csv">Export CSV</a>
      </PageHead>
      <LeadTable leads={leads} />
    </>
  );
}
