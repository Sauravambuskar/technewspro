import { fail, handler, ok, requireUser } from "@/lib/api";
import { emailConfigured, emailSender, emailSenderVerified, sendEmail } from "@/lib/email";
import { getSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Sends one message to the configured address, so setup can be checked. */
export const POST = handler(async () => {
  await requireUser();

  if (!emailConfigured()) {
    return fail("Email isn't set up yet — RESEND_API_KEY is missing from the project's environment variables.");
  }

  const settings = await getSettings();
  if (!settings.notifyEmail) return fail("Add a notification address first, then save.");

  const result = await sendEmail({
    to: settings.notifyEmail,
    subject: `Test from ${settings.siteName}`,
    text: `This is a test.\n\nIf you're reading it, notifications are working and will be sent from ${emailSender()}.`
  });

  if (!result.sent) {
    return fail(
      result.error ??
        (emailSenderVerified()
          ? "Sending failed."
          : `Sending failed. While using ${emailSender()}, Resend only delivers to the address that owns the Resend account.`)
    );
  }

  return ok({ sent: true, to: settings.notifyEmail, from: emailSender() });
});
