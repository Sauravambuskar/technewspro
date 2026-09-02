import { fail, handler, ok, readJson, requireUser, requireString } from "@/lib/api";
import { notify } from "@/lib/email";
import { createLead, leadsToCsv, listLeads } from "@/lib/leads";
import { getSettings } from "@/lib/settings";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { getResourceById, recordDownload } from "@/lib/resources";
import { EMAIL_RE } from "@/lib/subscribers";
import type { Lead } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const INTENTS: Lead["intent"][] = ["download", "syndication", "partnership", "general"];

export const GET = handler(async (request: Request) => {
  await requireUser();
  const leads = await listLeads();

  if (new URL(request.url).searchParams.get("format") === "csv") {
    return new Response(leadsToCsv(leads), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="leads-${new Date().toISOString().slice(0, 10)}.csv"`
      }
    });
  }

  return ok(leads);
});

/** Public: the resource download gate and the partnership enquiry form. */
export const POST = handler(async (request: Request) => {
  if (!rateLimit(clientKey(request, "leads"), { limit: 5, windowMs: 60_000 }).allowed) {
    return fail("Too many submissions. Try again in a minute.", 429);
  }

  const payload = await readJson<Record<string, unknown>>(request);
  const name = requireString(payload.name, "name", { max: 120 });
  const email = requireString(payload.email, "email", { max: 200 });
  if (!EMAIL_RE.test(email)) return fail("Enter a valid business email address.");

  const intent = INTENTS.includes(payload.intent as Lead["intent"])
    ? (payload.intent as Lead["intent"])
    : "download";

  // Only trust the resource title we hold, never one supplied by the client.
  const resource =
    typeof payload.resourceId === "string" ? await getResourceById(payload.resourceId) : undefined;

  const lead = await createLead({
    name,
    email,
    company: typeof payload.company === "string" ? payload.company : undefined,
    jobTitle: typeof payload.jobTitle === "string" ? payload.jobTitle : undefined,
    phone: typeof payload.phone === "string" ? payload.phone : undefined,
    intent,
    resourceId: resource?.id ?? null,
    resourceTitle: resource?.title ?? "",
    message: typeof payload.message === "string" ? payload.message : undefined
  });

  if (resource) await recordDownload(resource.id);

  const settings = await getSettings();
  if (settings.notifyOnLead && settings.notifyEmail) {
    notify({
      to: settings.notifyEmail,
      replyTo: lead.email,
      subject: `New ${lead.intent} lead: ${lead.name}`,
      text: [
        `${lead.name} <${lead.email}>`,
        lead.company && `Company: ${lead.company}`,
        lead.jobTitle && `Role: ${lead.jobTitle}`,
        lead.phone && `Phone: ${lead.phone}`,
        lead.resourceTitle && `Wanted: ${lead.resourceTitle}`,
        lead.message && `\n${lead.message}`,
        "\nAll leads: /admin/leads"
      ]
        .filter(Boolean)
        .join("\n")
    });
  }

  return ok(
    {
      id: lead.id,
      message: resource
        ? "Thanks — your download is ready below."
        : "Thanks — your enquiry is with the team.",
      // Empty when no file has been attached yet; the UI falls back to the on-page content.
      fileUrl: resource?.fileUrl ?? ""
    },
    { status: 201 }
  );
});
