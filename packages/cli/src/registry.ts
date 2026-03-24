/** Default when neither --registry nor saved state is set (local dev). */
export const DEFAULT_REGISTRY = "http://localhost:3000";

export type RequestOptions = {
  registry?: string;
  token?: string;
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
};

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
    return parsed.origin;
  } catch (e) {
    if (e instanceof TypeError) {
      throw new Error(`Invalid registry URL: ${url}`);
    }
    throw e;
  }
}

function apiUrl(registryBase: string, pathname: string) {
  const base = normalizeRegistryBase(registryBase);
  return new URL(`${base}${pathname.startsWith("/") ? pathname : `/${pathname}`}`);
}

export function bundleUrl(registryBase: string, slug: string, version?: string): URL {
  const url = apiUrl(registryBase, `/api/skills/${encodeURIComponent(slug)}/bundle`);
  if (version) {
    url.searchParams.set("version", version);
  }
  return url;
}

export function rawUrl(registryBase: string, slug: string, version?: string, filePath?: string): URL {
  const url = apiUrl(registryBase, `/api/skills/${encodeURIComponent(slug)}/raw`);
  if (version) {
    url.searchParams.set("version", version);
  }
  if (filePath) {
    url.searchParams.set("path", filePath);
  }
  return url;
}

export function manifestUrl(registryBase: string, slug: string, version?: string): URL {
  const url = apiUrl(registryBase, `/api/skills/${encodeURIComponent(slug)}/manifest`);
  if (version) {
    url.searchParams.set("version", version);
  }
  return url;
}

export function inspectUrl(registryBase: string, slug: string): URL {
  const url = apiUrl(registryBase, `/api/skills/${encodeURIComponent(slug)}`);
  url.searchParams.set("include", "versions");
  return url;
}

export function deviceStartUrl(registryBase: string): URL {
  return apiUrl(registryBase, "/api/cli/auth/device");
}

export function devicePollUrl(registryBase: string): URL {
  return apiUrl(registryBase, "/api/cli/auth/poll");
}

export function cliMeUrl(registryBase: string): URL {
  return apiUrl(registryBase, "/api/cli/me");
}

export function cliLogoutUrl(registryBase: string): URL {
  return apiUrl(registryBase, "/api/cli/auth/logout");
}

export function cliPreviewUrl(registryBase: string): URL {
  return apiUrl(registryBase, "/api/cli/skills/preview");
}

export function cliPublishUrl(registryBase: string): URL {
  return apiUrl(registryBase, "/api/cli/skills/publish");
}

export function cliUpdateUrl(registryBase: string, slug: string): URL {
  return apiUrl(registryBase, `/api/cli/skills/${encodeURIComponent(slug)}/update`);
}

export async function requestJson<T>(url: URL, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    accept: "application/json",
    ...(options.headers ?? {}),
  };

  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  if (options.token?.trim()) {
    headers.authorization = `Bearer ${options.token.trim()}`;
  }

  const response = await fetch(url, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const text = await response.text();
  let payload: unknown = null;

  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
        ? payload.error
        : typeof payload === "string" && payload
          ? payload
          : `Registry returned ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}
