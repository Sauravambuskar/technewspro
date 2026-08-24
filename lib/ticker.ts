import { newId, read, update, write } from "./store";
import { seedTicker } from "./seed";
import type { TickerItem } from "./types";

const COLLECTION = "ticker";
const seed = () => seedTicker();

export async function listTicker(onlyEnabled = false): Promise<TickerItem[]> {
  const items = await read<TickerItem[]>(COLLECTION, seed);
  const sorted = [...items].sort((a, b) => a.order - b.order);
  return onlyEnabled ? sorted.filter((item) => item.enabled) : sorted;
}

export async function createTickerItem(text: string): Promise<TickerItem> {
  const items = await listTicker();
  const item: TickerItem = {
    id: newId(),
    text: text.trim(),
    order: items.length ? Math.max(...items.map((i) => i.order)) + 1 : 1,
    enabled: true
  };
  await update<TickerItem[]>(COLLECTION, seed, (current) => [...current, item]);
  return item;
}

export async function updateTickerItem(id: string, input: Partial<TickerItem>) {
  let saved: TickerItem | undefined;
  await update<TickerItem[]>(COLLECTION, seed, (current) =>
    current.map((item) => {
      if (item.id !== id) return item;
      saved = {
        ...item,
        text: input.text?.trim() ?? item.text,
        order: input.order ?? item.order,
        enabled: input.enabled ?? item.enabled
      };
      return saved;
    })
  );
  return saved;
}

export async function deleteTickerItem(id: string) {
  let removed = false;
  await update<TickerItem[]>(COLLECTION, seed, (current) =>
    current.filter((item) => {
      if (item.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

export async function replaceTicker(items: TickerItem[]) {
  return write(COLLECTION, items);
}
