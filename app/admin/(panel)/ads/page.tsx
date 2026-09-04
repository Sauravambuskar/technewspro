import { allAds } from "@/lib/ads";
import PageHead from "../../components/PageHead";
import AdManager from "./AdManager";

export const dynamic = "force-dynamic";

export default async function AdsAdmin() {
  const ads = await allAds();

  return (
    <>
      <PageHead eyebrow="MONETISATION" title="Ads" />
      <AdManager ads={ads} />
    </>
  );
}
