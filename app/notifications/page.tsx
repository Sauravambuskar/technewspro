import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { getSiteChrome } from "@/lib/site";
import NotificationDemo from "./NotificationDemo";
import "./notifications.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notification styles | SalesInfoPro",
  description: "Interactive notification states for the SalesInfoPro publishing experience.",
  robots: { index: false, follow: true }
};

export default async function NotificationsPage() {
  const { settings, nav, menu, footerPages, ads } = await getSiteChrome();

  return (
    <main className="notification-page">
      <div className="topline" />
      <SiteHeader menu={menu} siteName={settings.siteName} ad={ads.header} />
      <NotificationDemo />
      <SiteFooter nav={nav} settings={settings} pages={footerPages} ad={ads.footer} />
    </main>
  );
}
