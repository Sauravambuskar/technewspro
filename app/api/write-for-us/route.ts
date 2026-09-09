import { fail, handler, ok, readJson, requireString } from "@/lib/api";
import { notify } from "@/lib/email";
import { createMessage } from "@/lib/messages";
import { getSettings } from "@/lib/settings";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { EMAIL_RE } from "@/lib/subscribers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = handler(async (request: Request) => {
  if (!rateLimit(clientKey(request, "write-for-us"), { limit: 3, windowMs: 60_000 }).allowed) {
    return fail("Too many pitches sent. Try again shortly.", 429);
  }

  const payload = await readJson<Record<string, unknown>>(request);
  const name = requireString(payload.name, "name", { max: 120 });
  const email = requireString(payload.email, "email", { max: 200 });
  const topic = requireString(payload.topic, "topic", { max: 160 });
  const pitch = requireString(payload.pitch, "pitch", { max: 5000 });
  const portfolio = typeof payload.portfolio === "string" ? payload.portfolio.trim() : "";
  if (!EMAIL_RE.test(email)) return fail("Enter a valid email address.");

  const body = portfolio ? `${pitch}\n\nPortfolio / sample: ${portfolio}` : pitch;

  const message = await createMessage({
    name,
    email,
    body,
    subject: `Write for us: ${topic}`
  });

  const settings = await getSettings();
  if (settings.notifyOnMessage && settings.notifyEmail) {
    notify({
      to: settings.notifyEmail,
      replyTo: message.email,
      subject: `New pitch: ${topic}`,
      text: `${message.name} <${message.email}> pitched:\n\n${message.body}\n\nRead it in the panel: /admin/messages`
    });
  }

  return ok({ id: message.id, message: "Thanks — we'll review your pitch and get back to you." }, { status: 201 });
});
