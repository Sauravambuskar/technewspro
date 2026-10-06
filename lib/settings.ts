import { read, write } from "./store";
import { seedSettings } from "./seed";
import type { Settings } from "./types";

const COLLECTION = "settings";
const seed = () => seedSettings();

export async function getSettings(): Promise<Settings> {
  // Merge over the defaults so a settings file written by an older build still
  // resolves every field the UI expects.
  const settings = { ...seedSettings(), ...(await read<Partial<Settings>>(COLLECTION, seed)) } as Settings;

  // Carry existing installations across the Tech News Pro -> Sales Info Pro
  // rebrand. This updates the live database-backed settings after deploy too,
  // rather than changing only fresh installs that use the seed values.
  const serialized = JSON.stringify(settings);
  const migrated = serialized
    .replaceAll("Tech News Pro", "Sales Info Pro")
    .replaceAll("TECH NEWS PRO", "SALES INFO PRO")
    .replaceAll("technewspro.com", "salesinfopro.com");

  if (migrated !== serialized) {
    const next = JSON.parse(migrated) as Settings;
    await write(COLLECTION, next);
    return next;
  }

  return settings;
}

export async function saveSettings(input: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...input };
  await write(COLLECTION, next);
  return next;
}
