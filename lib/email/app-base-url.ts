/** Canonical public origin for links and asset URLs in emails. */
export function getAppBaseUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
  return raw.replace(/\/$/, "");
}

export function absoluteUrl(pathOrUrl: string): string {
  const t = pathOrUrl.trim();
  if (t.startsWith("http://") || t.startsWith("https://")) {
    return t;
  }
  const path = t.startsWith("/") ? t : `/${t}`;
  return `${getAppBaseUrl()}${path}`;
}
