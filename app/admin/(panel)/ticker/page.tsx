import { listTicker } from "@/lib/ticker";
import PageHead from "../../components/PageHead";
import TickerManager from "./TickerManager";

export const dynamic = "force-dynamic";

export default async function TickerAdmin() {
  const items = await listTicker();

  return (
    <>
      <PageHead eyebrow="HOMEPAGE" title="News ticker" />
      <TickerManager items={items} />
    </>
  );
}
