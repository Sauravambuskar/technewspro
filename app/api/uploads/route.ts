import { fail, handler, ok, requireUser, HttpError } from "@/lib/api";
import { saveImage } from "@/lib/images";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  await requireUser();

  const form = await request.formData().catch(() => {
    throw new HttpError("Expected multipart/form-data with a \"file\" field.");
  });
  const file = form.get("file");
  if (!(file instanceof File)) return fail('Missing "file" in the upload.');

  const saved = await saveImage(file);
  return ok(saved, { status: 201 });
});
