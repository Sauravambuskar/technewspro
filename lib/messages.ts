import { newId, now, read, update } from "./store";
import type { Message } from "./types";

const COLLECTION = "messages";
const seed = (): Message[] => [];

export async function listMessages(): Promise<Message[]> {
  const messages = await read<Message[]>(COLLECTION, seed);
  return [...messages].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function createMessage(input: {
  name: string;
  email: string;
  subject?: string;
  body: string;
}): Promise<Message> {
  const message: Message = {
    id: newId(),
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    subject: input.subject?.trim() || "Website enquiry",
    body: input.body.trim(),
    read: false,
    createdAt: now()
  };
  await update<Message[]>(COLLECTION, seed, (current) => [message, ...current]);
  return message;
}

export async function setMessageRead(id: string, read: boolean) {
  let saved: Message | undefined;
  await update<Message[]>(COLLECTION, seed, (current) =>
    current.map((m) => {
      if (m.id !== id) return m;
      saved = { ...m, read };
      return saved;
    })
  );
  return saved;
}

export async function deleteMessage(id: string) {
  let removed = false;
  await update<Message[]>(COLLECTION, seed, (current) =>
    current.filter((m) => {
      if (m.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}
