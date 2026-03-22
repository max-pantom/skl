import { Resend } from "resend";

let client: Resend | null = null;

export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return null;
  }
  client ??= new Resend(key);
  return client;
}

/** From address; must be a verified sender/domain in Resend. */
export function getEmailFrom(): string {
  return process.env.EMAIL_FROM?.trim() || "SKL <onboarding@resend.dev>";
}
