/** Default when neither --registry nor SKL_REGISTRY is set (local dev). */
export const DEFAULT_REGISTRY = "http://localhost:3000";

export function normalizeRegistryBase(url: string): string {
  const trimmed = url.trim().replace(/\/+$/, "");
  if (!trimmed) {
    throw new Error("Registry URL is empty");
  }
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Registry must be http or https");
    }
    return `${parsed.origin}`;
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`Invalid registry URL: ${url}`);
    }
    throw e;
  }
}

export function bundleUrl(registryBase: string, slug: string, version?: string): URL {
  const base = normalizeRegistryBase(registryBase);
  const url = new URL(`${base}/api/skills/${encodeURIComponent(slug)}/bundle`);
  if (version) {
    url.searchParams.set("version", version);
  }
  return url;
}
