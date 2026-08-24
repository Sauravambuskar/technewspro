import { listSubscribers } from "@/lib/subscribers";
import PageHead from "../../components/PageHead";
import SubscriberTable from "./SubscriberTable";

export const dynamic = "force-dynamic";

export default async function SubscribersAdmin() {
  const subscribers = await listSubscribers();

  return (
    <>
      <PageHead eyebrow="AUDIENCE" title="Subscribers">
        <a className="adm-btn adm-btn-ghost" href="/api/subscribers?format=csv">Export CSV</a>
      </PageHead>
      <SubscriberTable subscribers={subscribers} />
    </>
  );
}
