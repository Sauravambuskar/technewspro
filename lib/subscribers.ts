import { newId, now, read, update } from "./store";
import type { Subscriber } from "./types";

const COLLECTION = "subscribers";
const seed = (): Subscriber[] => [];

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function listSubscribers(): Promise<Subscriber[]> {
  const subscribers = await read<Subscriber[]>(COLLECTION, seed);
  return [...subscribers].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export type SubscribeResult = { status: "created" | "already-subscribed" | "resubscribed"; subscriber: Subscriber };

export async function subscribe(email: string, source = "website"): Promise<SubscribeResult> {
  const normalised = email.trim().toLowerCase();
  let result: SubscribeResult | undefined;

  await update<Subscriber[]>(COLLECTION, seed, (current) => {
    const existing = current.find((s) => s.email === normalised);
    if (existing) {
      if (existing.status === "subscribed") {
        result = { status: "already-subscribed", subscriber: existing };
        return current;
      }
      const revived: Subscriber = { ...existing, status: "subscribed", createdAt: now() };
      result = { status: "resubscribed", subscriber: revived };
      return current.map((s) => (s.id === existing.id ? revived : s));
    }

    const subscriber: Subscriber = {
      id: newId(),
      email: normalised,
      status: "subscribed",
      source,
      createdAt: now()
    };
    result = { status: "created", subscriber };
    return [subscriber, ...current];
  });

  return result!;
}

export async function setSubscriberStatus(id: string, status: Subscriber["status"]) {
  let saved: Subscriber | undefined;
  await update<Subscriber[]>(COLLECTION, seed, (current) =>
    current.map((s) => {
      if (s.id !== id) return s;
      saved = { ...s, status };
      return saved;
    })
  );
  return saved;
}

export async function deleteSubscriber(id: string) {
  let removed = false;
  await update<Subscriber[]>(COLLECTION, seed, (current) =>
    current.filter((s) => {
      if (s.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

export function toCsv(subscribers: Subscriber[]) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const rows = subscribers.map((s) => [s.email, s.status, s.source, s.createdAt].map(escape).join(","));
  return ["email,status,source,subscribed_at", ...rows].join("\n");
}
