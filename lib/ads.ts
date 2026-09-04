import { newId, now, read, update } from "./store";
import { adIsLive, isAdPlacement, isAdType, type Ad, type AdPlacement } from "./types";

const COLLECTION = "ads";
// Ads are sold, not seeded — a new site simply has none.
const seed = (): Ad[] => [];

export async function allAds(): Promise<Ad[]> {
  const ads = await read<Ad[]>(COLLECTION, seed);
  return ads
    .map((ad) => ({
      ...ad,
      placement: isAdPlacement(ad.placement) ? ad.placement : "header",
      type: isAdType(ad.type) ? ad.type : "image",
      imageAlt: ad.imageAlt ?? "",
      startsAt: ad.startsAt ?? "",
      endsAt: ad.endsAt ?? "",
      impressions: ad.impressions ?? 0,
      clicks: ad.clicks ?? 0
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getAdById(id: string) {
  return (await allAds()).find((ad) => ad.id === id);
}

/**
 * The ad to show in a slot right now: enabled, inside its date window, and the
 * most recently created when several qualify. Returns undefined for an empty
 * slot, which renders nothing at all.
 */
export async function activeAd(placement: AdPlacement): Promise<Ad | undefined> {
  const ads = await allAds();
  return ads.find((ad) => ad.placement === placement && adIsLive(ad));
}

/** Every slot's current ad in one pass, so a page render costs one read. */
export async function activeAds(): Promise<Partial<Record<AdPlacement, Ad>>> {
  const ads = await allAds();
  const live: Partial<Record<AdPlacement, Ad>> = {};
  for (const ad of ads) {
    if (adIsLive(ad) && !live[ad.placement]) live[ad.placement] = ad;
  }
  return live;
}

export type AdInput = Partial<Omit<Ad, "id" | "createdAt" | "updatedAt" | "impressions" | "clicks">>;

export async function createAd(input: AdInput & { name: string }): Promise<Ad> {
  const stamp = now();
  const ad: Ad = {
    id: newId(),
    name: input.name.trim(),
    placement: isAdPlacement(input.placement) ? input.placement : "header",
    type: isAdType(input.type) ? input.type : "image",
    image: input.image?.trim() || "",
    imageAlt: input.imageAlt?.trim() || "",
    href: input.href?.trim() || "",
    html: input.html?.trim() || "",
    enabled: input.enabled ?? false,
    startsAt: input.startsAt?.trim() || "",
    endsAt: input.endsAt?.trim() || "",
    impressions: 0,
    clicks: 0,
    createdAt: stamp,
    updatedAt: stamp
  };

  await update<Ad[]>(COLLECTION, seed, (current) => [ad, ...current]);
  return ad;
}

export async function updateAd(id: string, input: AdInput): Promise<Ad | undefined> {
  let saved: Ad | undefined;

  await update<Ad[]>(COLLECTION, seed, (current) =>
    current.map((ad) => {
      if (ad.id !== id) return ad;
      saved = {
        ...ad,
        name: input.name?.trim() ?? ad.name,
        placement: isAdPlacement(input.placement) ? input.placement : ad.placement,
        type: isAdType(input.type) ? input.type : ad.type,
        image: input.image?.trim() ?? ad.image,
        imageAlt: input.imageAlt?.trim() ?? ad.imageAlt,
        href: input.href?.trim() ?? ad.href,
        html: input.html !== undefined ? input.html.trim() : ad.html,
        enabled: input.enabled ?? ad.enabled,
        startsAt: input.startsAt !== undefined ? input.startsAt.trim() : ad.startsAt,
        endsAt: input.endsAt !== undefined ? input.endsAt.trim() : ad.endsAt,
        updatedAt: now()
      };
      return saved;
    })
  );

  return saved;
}

export async function deleteAd(id: string): Promise<boolean> {
  let removed = false;
  await update<Ad[]>(COLLECTION, seed, (current) =>
    current.filter((ad) => {
      if (ad.id !== id) return true;
      removed = true;
      return false;
    })
  );
  return removed;
}

export async function recordAdImpression(id: string) {
  await update<Ad[]>(COLLECTION, seed, (current) =>
    current.map((ad) => (ad.id === id ? { ...ad, impressions: ad.impressions + 1 } : ad))
  );
}

/** Counts the click and hands back where to send the reader. */
export async function recordAdClick(id: string): Promise<string | undefined> {
  let destination: string | undefined;
  await update<Ad[]>(COLLECTION, seed, (current) =>
    current.map((ad) => {
      if (ad.id !== id) return ad;
      destination = ad.href;
      return { ...ad, clicks: ad.clicks + 1 };
    })
  );
  return destination;
}
