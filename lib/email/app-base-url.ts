function normalizeOrigin(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }

  const href = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    return new URL(href).origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(value: string): boolean {
  return /^https?:\/\/(localhost|127(?:\.\d{1,3}){3})(?::\d+)?$/i.test(value);
}

/** Canonical public origin for links and asset URLs in emails. */
export function getAppBaseUrl(): string {
  const emailOrigin = normalizeOrigin(process.env.EMAIL_PUBLIC_APP_URL);
  if (emailOrigin) {
    return emailOrigin;
  }

  const betterAuthOrigin = normalizeOrigin(process.env.BETTER_AUTH_URL);
  if (betterAuthOrigin && !isLocalOrigin(betterAuthOrigin)) {
    return betterAuthOrigin;
  }

  const nextPublicOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (nextPublicOrigin) {
    return nextPublicOrigin;
  }

  const vercelProductionOrigin = normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL);
  if (vercelProductionOrigin) {
    return vercelProductionOrigin;
  }

  const vercelOrigin = normalizeOrigin(process.env.VERCEL_URL);
  if (vercelOrigin) {
    return vercelOrigin;
  }

  if (betterAuthOrigin) {
    return betterAuthOrigin;
  }

  return "http://localhost:3000";
}

export function absoluteUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) {
    return t;
  }
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${getAppBaseUrl()}${path}`;
}
