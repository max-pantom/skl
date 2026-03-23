import { escapeHtml } from "@/lib/email/escape-html";
import { getEmailFrom, getResend } from "@/lib/email/resend-client";

type SendAuthVerificationEmailInput = {
  displayName: string;
  to: string;
  verifyUrl: string;
};

export async function sendAuthVerificationEmail(
  input: SendAuthVerificationEmailInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const resend = getResend();

  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY is not set" };
  }

  const displayName = escapeHtml(input.displayName.trim() || "there");
  const verifyUrl = input.verifyUrl.trim();

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#f6f6f4;color:#242424;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <div style="background:#ffffff;border:1px solid rgba(36,36,36,0.12);border-radius:28px;padding:32px;">
        <p style="margin:0 0 12px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#8f8f8f;">SKL Claim</p>
        <h1 style="margin:0 0 14px;font-size:28px;line-height:1;color:#242424;">Verify your email</h1>
        <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#4b4b4b;">
          Hi ${displayName}, click the button below to verify your email and finish claiming your profile card.
        </p>
        <p style="margin:0 0 28px;">
          <a href="${verifyUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:#242424;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">
            Verify email
          </a>
        </p>
        <p style="margin:0;font-size:14px;line-height:1.5;color:#8f8f8f;">
          If the button does not work, open this link:
          <br />
          <a href="${verifyUrl}" style="color:#242424;word-break:break-all;">${escapeHtml(verifyUrl)}</a>
        </p>
      </div>
    </div>
  </body>
</html>`;

  const { data, error } = await resend.emails.send({
    from: getEmailFrom(),
    html,
    subject: "Verify your email for SKL",
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
