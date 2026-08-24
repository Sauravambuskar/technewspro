import { listArticles } from "@/lib/articles";
import { getSettings } from "@/lib/settings";
import PageHead from "../../components/PageHead";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsAdmin() {
  const [settings, published] = await Promise.all([getSettings(), listArticles({ status: "published" })]);

  return (
    <>
      <PageHead eyebrow="CONFIGURATION" title="Site settings" />
      <SettingsForm
        settings={settings}
        featurable={published.map(({ slug, title }) => ({ slug, title }))}
      />
    </>
  );
}
