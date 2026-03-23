import { escapeHtml } from "@/lib/email/escape-html";
import { getEmailFrom, getResend } from "@/lib/email/resend-client";

type SendAuthVerificationEmailInput = {
  otp: string;
  to: string;
};

export async function sendAuthVerificationEmail(
  input: SendAuthVerificationEmailInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const resend = getResend();

  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const otp = escapeHtml(input.otp.trim());

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f6f6f4;color:#242424;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="background:#ffffff;border:1px solid rgba(36,36,36,0.12);border-radius:28px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8f8f8f;">SKL Claim</p>
        <h1 style="margin:0 0 14px;font-size:28px;line-height:1;color:#242424;">Your verification code</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#4b4b4b;">
          Enter this 5-digit code in the claim form to verify your email and finish claiming your profile card.
        </p>
        <p style="margin:0;font-size:14px;line-height:1.5;color:#8f8f8f;">
          Verification code
        </p>
        <p style="margin:14px 0 0;font-size:40px;line-height:1;letter-spacing:0.24em;font-weight:700;color:#242424;">${otp}</p>
      </div>
    </div>
  </body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    html,
    subject: "Your SKL verification code",
    to: [input.to.trim()],
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data?.id) {
    return { ok: false, error: "Resend returned no message id" };
  }

  return { ok: true, id: data.id };
}
