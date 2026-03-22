import { buildUserProfileEmailHtml, type UserProfileEmailContent } from "@/lib/email/user-profile-email-html";
import { getEmailFrom, getResend } from "@/lib/email/resend-client";

export type SendUserProfileEmailInput = UserProfileEmailContent & {
  to: string;
  /** Defaults to a friendly subject line. */
  subject?: string;
};

/**
 * Sends a transactional profile email via Resend (avatar image, @username, early-believer rank, CTA).
 * Requires `RESEND_API_KEY`. Set `EMAIL_FROM` to your verified domain sender.
 */
export async function sendUserProfileEmail(
  input: SendUserProfileEmailInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const { to, subject, ...content } = input;
  const html = buildUserProfileEmailHtml(content);

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    to: [to.trim()],
    subject: subject?.trim() || `Hi ${content.displayName} — your SKL profile`,
    html,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, error: "Resend returned no message id" };
  }

  return { ok: true, id: data.id };
}
