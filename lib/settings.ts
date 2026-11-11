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

// Keep the footer buttons in the intended order. Older installations used an
// RSS button here, which is now Instagram; retain the configured X/LinkedIn
// destinations while giving the replacement its proper Instagram destination.
function normaliseFooterSocials(socials: Settings["socials"]): Settings["socials"] {
  const defaults = seedSettings().socials;
  const byId = new Map(socials.map((social) => [social.id, social]));
  const fallback = (id: string) => defaults.find((social) => social.id === id)!;

  return [
    { ...fallback("x"), ...byId.get("x"), id: "x", label: "X (Twitter)" },
    { ...fallback("instagram"), ...byId.get("instagram"), id: "instagram", label: "Instagram" },
    { ...fallback("linkedin"), ...byId.get("linkedin"), id: "linkedin", label: "LinkedIn" }
  ];
}

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
  const footerSocials = normaliseFooterSocials(afterBrand.socials);
  const needsSocialUpdate = JSON.stringify(footerSocials) !== JSON.stringify(afterBrand.socials);

  // Apply contact detail overrides so live DB always reflects the latest values.
  const needsContactUpdate =
    afterBrand.contactEmail !== CONTACT_OVERRIDES.contactEmail ||
    afterBrand.contactPhone !== CONTACT_OVERRIDES.contactPhone ||
    afterBrand.contactAddress !== CONTACT_OVERRIDES.contactAddress;

  if (migrated !== serialized || needsContactUpdate || needsSocialUpdate) {
    const next = { ...afterBrand, ...CONTACT_OVERRIDES, socials: footerSocials };
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
