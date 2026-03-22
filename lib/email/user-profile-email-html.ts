import { absoluteUrl, getAppBaseUrl } from "@/lib/email/app-base-url";
import { escapeHtml } from "@/lib/email/escape-html";

export type UserProfileEmailContent = {
  displayName: string;
  username: string;
  userId: string;
  avatarUrl: string | null;
  earlyBelieverRank: number | null;
};

function avatarImageSrc(c: UserProfileEmailContent): string {
  if (c.avatarUrl?.trim()) {
    return absoluteUrl(c.avatarUrl.trim());
  }
  const base = getAppBaseUrl();
  return `${base}/api/users/${encodeURIComponent(c.userId)}/avatar.svg`;
}

/**
 * Simple HTML email: avatar, display name, @username, early-believer #, profile link.
 * Inline styles for broad client support.
 */
export function buildUserProfileEmailHtml(c: UserProfileEmailContent): string {
  const profileUrl = `${getAppBaseUrl()}/u/${encodeURIComponent(c.username)}`;
  const imgSrc = avatarImageSrc(c);
  const name = escapeHtml(c.displayName);
  const handle = escapeHtml(c.username);
  const rankLine =
    c.earlyBelieverRank != null
      ? `<p style="margin:16px 0 0;font-size:15px;color:#242424;">You’re <strong>#${c.earlyBelieverRank}</strong> — early believer.</p>`
      : "";

  return `<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#fafafa;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fafafa;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:480px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;padding:28px 24px;">
          <tr>
            <td align="center">
              <img src="${escapeHtml(imgSrc)}" alt="" width="120" height="120" style="display:block;border-radius:9999px;border:1px solid #e4e4e7;object-fit:cover;" />
              <h1 style="margin:20px 0 8px;font-size:20px;font-weight:600;color:#242424;">Hi ${name}</h1>
              <p style="margin:0;font-size:16px;color:#52525b;">You’re signed up as <strong>@${handle}</strong></p>
              ${rankLine}
              <p style="margin:24px 0 0;font-size:15px;line-height:1.5;color:#3f3f46;">
                Your profile and generated avatar are tied to this account — open SKL anytime to browse skills and publish your own.
              </p>
              <p style="margin:28px 0 0;">
                <a href="${escapeHtml(profileUrl)}" style="display:inline-block;background:#242424;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 22px;border-radius:9999px;">View your profile</a>
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-size:12px;color:#a1a1aa;">SKL · ${escapeHtml(getAppBaseUrl())}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
