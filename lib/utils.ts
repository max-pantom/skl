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
