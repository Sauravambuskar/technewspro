import { handler, ok, requireUser } from "@/lib/api";
import { allArticles } from "@/lib/articles";
import { listLeads } from "@/lib/leads";
import { listMessages } from "@/lib/messages";
import { allResources } from "@/lib/resources";
import { listSections } from "@/lib/sections";
import { listSubscribers } from "@/lib/subscribers";
import { listTicker } from "@/lib/ticker";
import { RESOURCE_TYPES } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireUser();
  const [articles, resources, leads, subscribers, messages, sections, ticker] = await Promise.all([
    allArticles(),
    allResources(),
    listLeads(),
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
    resources: {
      total: resources.length,
      published: resources.filter((r) => r.status === "published").length,
      drafts: resources.filter((r) => r.status === "draft").length,
      gated: resources.filter((r) => r.gated).length,
      downloads: resources.reduce((sum, r) => sum + r.downloads, 0),
      byType: RESOURCE_TYPES.map((type) => ({
        type,
        count: resources.filter((r) => r.type === type).length
      }))
    },
    leads: {
      total: leads.length,
      byIntent: Object.entries(
        leads.reduce<Record<string, number>>((counts, lead) => {
          counts[lead.intent] = (counts[lead.intent] ?? 0) + 1;
          return counts;
        }, {})
      ).map(([intent, count]) => ({ intent, count }))
    },
    subscribers: {
      total: subscribers.length,
      active: subscribers.filter((s) => s.status === "subscribed").length
    },
    messages: { total: messages.length, unread: messages.filter((m) => !m.read).length },
    sections: sections.length,
    ticker: { total: ticker.length, enabled: ticker.filter((t) => t.enabled).length },
    byCategory: sections.map((section) => ({
      id: section.id,
      label: section.label,
      articles: articles.filter((a) => a.section === section.id).length,
      resources: resources.filter((r) => r.category === section.id).length
    }))
  });
});
