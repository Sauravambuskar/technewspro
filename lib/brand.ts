/** Rewrites legacy public-facing brand copy while keeping stored URLs stable. */
export function currentBrandText(value: string): string {
  return value
    .replaceAll("Tech News Pro", "Sales Info Pro")
    .replaceAll("TECH NEWS PRO", "SALES INFO PRO")
    .replaceAll("technewspro.com", "salesinfopro.com");
}
