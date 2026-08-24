import { handler, ok, requireUser } from "@/lib/api";
import { allArticles } from "@/lib/articles";
import { listMessages } from "@/lib/messages";
import { listSections } from "@/lib/sections";
import { listSubscribers } from "@/lib/subscribers";
import { listTicker } from "@/lib/ticker";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireUser();
  const [articles, subscribers, messages, sections, ticker] = await Promise.all([
    allArticles(),
    listSubscribers(),
    listMessages(),
    listSections(),
    listTicker()
  ]);

  return ok({
    articles: {
      total: articles.length,
      published: articles.filter((a) => a.status === "published").length,
      drafts: articles.filter((a) => a.status === "draft").length,
      views: articles.reduce((sum, a) => sum + a.views, 0)
    },
    subscribers: {
      total: subscribers.length,
      active: subscribers.filter((s) => s.status === "subscribed").length
    },
    messages: { total: messages.length, unread: messages.filter((m) => !m.read).length },
    sections: sections.length,
    ticker: { total: ticker.length, enabled: ticker.filter((t) => t.enabled).length },
    bySection: sections.map((section) => ({
      id: section.id,
      label: section.label,
      count: articles.filter((a) => a.section === section.id).length
    }))
  });
});
