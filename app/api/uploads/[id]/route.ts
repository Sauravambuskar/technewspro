import { fail, handler, ok, requireUser } from "@/lib/api";
import { deleteImage, getImage } from "@/lib/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

// Public: images are embedded on public pages (articles, resources, …), so
// this is served the same way any external image URL would be.
export const GET = handler(async (_request: Request, { params }: Ctx) => {
  const image = await getImage(params.id);
  if (!image) return fail("Image not found.", 404);

  return new Response(image.data, {
    headers: {
      "content-type": image.mimeType,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      // Uploaded SVG files are useful for editorial artwork, but they should
      // never become a same-origin script document when opened directly.
      ...(image.mimeType === "image/svg+xml"
        ? { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" }
        : {})
    }
  });
});

export const DELETE = handler(async (_request: Request, { params }: Ctx) => {
  await requireUser();
  const removed = await deleteImage(params.id);
  if (!removed) return fail("Image not found.", 404);
  return ok({ id: params.id, deleted: true });
});
