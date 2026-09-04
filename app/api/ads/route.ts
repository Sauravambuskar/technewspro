import { handler, ok, readJson, requireString, requireUser } from "@/lib/api";
import { allAds, createAd } from "@/lib/ads";
import { isAdPlacement, isAdType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await requireUser();
  return ok(await allAds());
});

export const POST = handler(async (request: Request) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);
  const name = requireString(payload.name, "name", { max: 200 });

  const ad = await createAd({
    name,
    placement: isAdPlacement(payload.placement) ? payload.placement : undefined,
    type: isAdType(payload.type) ? payload.type : undefined,
    image: typeof payload.image === "string" ? payload.image : undefined,
    imageAlt: typeof payload.imageAlt === "string" ? payload.imageAlt : undefined,
    href: typeof payload.href === "string" ? payload.href : undefined,
    html: typeof payload.html === "string" ? payload.html : undefined,
    enabled: typeof payload.enabled === "boolean" ? payload.enabled : undefined,
    startsAt: typeof payload.startsAt === "string" ? payload.startsAt : undefined,
    endsAt: typeof payload.endsAt === "string" ? payload.endsAt : undefined
  });

  return ok(ad, { status: 201 });
});
