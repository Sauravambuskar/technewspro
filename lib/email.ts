// Transactional email through Resend's HTTP API.
//
// Sending is deliberately optional: until RESEND_API_KEY is set the whole
// module no-ops and says so, so every form on the site keeps working exactly
// as it does today. Nothing here ever throws into a request handler — a failed
// notification must not fail the submission that triggered it.

const ENDPOINT = "https://api.resend.com/emails";

/** Resend's shared sender, which only delivers to your own account address. */
const TEST_SENDER = "onboarding@resend.dev";

export type EmailResult = { sent: boolean; skipped?: string; error?: string };

export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** True once mail can reach anyone, not just the Resend account owner. */
export function emailSenderVerified() {
  const from = process.env.EMAIL_FROM;
  return Boolean(from && !from.includes(TEST_SENDER));
}

export function emailSender() {
  return process.env.EMAIL_FROM || TEST_SENDER;
}

export async function sendEmail({
  to,
  subject,
  text,
  replyTo
}: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<EmailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false, skipped: "RESEND_API_KEY is not set." };
  if (!to.trim()) return { sent: false, skipped: "No recipient configured." };

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: emailSender(),
        to: [to.trim()],
        subject,
        text,
        ...(replyTo ? { reply_to: replyTo } : {})
      })
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return { sent: false, error: `Resend returned ${response.status}. ${detail.slice(0, 300)}` };
    }
    return { sent: true };
  } catch (error) {
    return { sent: false, error: (error as Error).message };
  }
}

/**
 * Sends without making the caller wait or care. Used from form handlers, where
 * the reader's submission has already been stored and must succeed regardless.
 */
export function notify(args: Parameters<typeof sendEmail>[0]) {
  void sendEmail(args).then((result) => {
    if (!result.sent && result.error) console.error("[email]", result.error);
  });
}
