import { newId, now, read, update } from "./store";
import type { Lead } from "./types";

const COLLECTION = "leads";
const seed = (): Lead[] => [];

export async function listLeads(): Promise<Lead[]> {
  const leads = await read<Lead[]>(COLLECTION, seed);
  return [...leads].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export type LeadInput = {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  phone?: string;
  intent?: Lead["intent"];
  resourceId?: string | null;
  resourceTitle?: string;
  message?: string;
};

export async function createLead(input: LeadInput): Promise<Lead> {
  const lead: Lead = {
    id: newId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    company: input.company?.trim() || "",
    jobTitle: input.jobTitle?.trim() || "",
    phone: input.phone?.trim() || "",
    intent: input.intent ?? "download",
    resourceId: input.resourceId ?? null,
    resourceTitle: input.resourceTitle?.trim() || "",
    message: input.message?.trim() || "",
    createdAt: now()
  };

  await update<Lead[]>(COLLECTION, seed, (current) => [lead, ...current]);
  return lead;
}

export async function deleteLead(id: string): Promise<boolean> {
  let removed = false;
  await update<Lead[]>(COLLECTION, seed, (current) =>
    current.filter((lead) => {
      if (lead.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

export function leadsToCsv(leads: Lead[]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const rows = leads.map((lead) =>
    [lead.name, lead.email, lead.company, lead.jobTitle, lead.phone, lead.intent, lead.resourceTitle, lead.createdAt]
      .map(escape)
      .join(",")
  );
  return ["name,email,company,job_title,phone,intent,resource,captured_at", ...rows].join("\n");
}
