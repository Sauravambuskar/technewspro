import { read, write } from "./store";
import { seedSettings } from "./seed";
import type { Settings } from "./types";

const COLLECTION = "settings";
const seed = () => seedSettings();

// Contact details to enforce on every load — ensures live DB stays in sync
// after a code deploy without requiring a manual admin save.
const CONTACT_OVERRIDES: Partial<Settings> = {
  contactEmail: "marketing@salesinfopro.com",
  contactPhone: "",
  contactAddress: "433 Plaza Real, Suite 275, Boca Raton, FL 33432",
};

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

  const afterBrand = migrated !== serialized ? (JSON.parse(migrated) as Settings) : settings;

  // Apply contact detail overrides so live DB always reflects the latest values.
  const needsContactUpdate =
    afterBrand.contactEmail !== CONTACT_OVERRIDES.contactEmail ||
    afterBrand.contactPhone !== CONTACT_OVERRIDES.contactPhone ||
    afterBrand.contactAddress !== CONTACT_OVERRIDES.contactAddress;

  if (migrated !== serialized || needsContactUpdate) {
    const next = { ...afterBrand, ...CONTACT_OVERRIDES };
    await write(COLLECTION, next);
    return next;
  }

  return afterBrand;
}

export async function saveSettings(input: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...input };
  await write(COLLECTION, next);
  return next;
}
