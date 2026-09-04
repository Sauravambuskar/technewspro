import { fail, handler, ok, readJson, requireUser } from "@/lib/api";
import { deleteAd, getAdById, updateAd } from "@/lib/ads";
import { isAdPlacement, isAdType } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export const GET = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const ad = await getAdById(params.id);
  if (!ad) return fail("Ad not found.", 404);
  return ok(ad);
});

export const PATCH = handler(async (request: Request, { params }: Ctx) => {
  await requireUser();
  const payload = await readJson<Record<string, unknown>>(request);

  const ad = await updateAd(params.id, {
    name: typeof payload.name === "string" ? payload.name : undefined,
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

  if (!ad) return fail("Ad not found.", 404);
  return ok(ad);
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deleteAd(params.id);
  if (!removed) return fail("Ad not found.", 404);
  return ok({ id: params.id, deleted: true });
});
