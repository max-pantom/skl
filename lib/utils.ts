export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

export function absoluteUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return new URL(path, baseUrl).toString();
}

/** Host + `/u/` for claim username field (public profiles live at `/u/:username`). */
export function publicProfilePathPrefix() {
  try {
    const u = new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
    return `${u.host}/u/`;
  } catch {
    return "localhost:3000/u/";
  }
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function sanitizeUsername(value: string) {
  const cleaned = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned.slice(0, 32) || "user";
}

export function parseCommaSeparatedList(value: FormDataEntryValue | string | null | undefined) {
  const input = typeof value === "string" ? value : value?.toString() ?? "";

  return input
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function getString(value: FormDataEntryValue | null | undefined) {
  return typeof value === "string" ? value.trim() : "";
}

export function withQuery(path: string, params: Record<string, string | undefined | null>) {
  const [pathname, existing] = path.split("?");
  const searchParams = new URLSearchParams(existing ?? "");

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      searchParams.delete(key);
      continue;
    }

    searchParams.set(key, value);
  }

  const query = searchParams.toString();
  return query ? `${pathname}?${query}` : pathname;
}

/** Normalize Better Auth / Postgres messages when `users.username` violates uniqueness. */
export function formatSignUpErrorMessage(raw: string | undefined, fallback: string): string {
  if (!raw) {
    return fallback;
  }
  const m = raw.toLowerCase();
  if (
    m.includes("users_username_idx") ||
    m.includes("duplicate key") ||
    m.includes("unique constraint") ||
    (m.includes("username") && (m.includes("unique") || m.includes("taken") || m.includes("exists")))
  ) {
    return "That username is already taken.";
  }
  return raw;
}

/** Studio claim card footer — `dd-mm-yy` (e.g. 23-03-26). */
export function formatClaimCardFooterDate(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${dd}-${mm}-${yy}`;
}
