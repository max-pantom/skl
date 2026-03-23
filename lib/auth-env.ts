/** Env-only checks safe to import from any bundle (no `next/headers`). */

export function isGoogleOAuthConfigured() {
  const id = process.env.GOOGLE_CLIENT_ID?.trim();
  const secret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  return Boolean(id && secret);
}
