import { read, write } from "./store";
import { seedSettings } from "./seed";
import type { Settings } from "./types";

const COLLECTION = "settings";
const seed = () => seedSettings();

export async function getSettings(): Promise<Settings> {
  // Merge over the defaults so a settings file written by an older build still
  // resolves every field the UI expects.
  return { ...seedSettings(), ...(await read<Partial<Settings>>(COLLECTION, seed)) } as Settings;
}

export async function saveSettings(input: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...input };
  await write(COLLECTION, next);
  return next;
}
