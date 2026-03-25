import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { cliLogoutUrl, cliMeUrl, devicePollUrl, deviceStartUrl, normalizeRegistryBase, requestJson, resolveRegistryBase } from "./registry.js";
import { clearCliState, readCliState, writeCliState } from "./state.js";

const execFileAsync = promisify(execFile);

type DeviceStartResponse = {
  ok: boolean;
  deviceCode: string;
  userCode: string;
  verificationUrl: string;
  expiresAt: string;
  intervalSeconds: number;
};

type DevicePollResponse =
  | { ok: true; status: "pending" }
  | { ok: true; status: "approved"; token: string; viewer: { id: string; username: string; displayName: string } }
  | { ok: false; status: "expired" | "rejected" | "already_exchanged" };

type WhoAmIResponse = {
  ok: true;
  viewer: {
    id: string;
    username: string;
    displayName: string;
  };
};

async function openBrowser(url: string) {
  const platform = process.platform;
  if (platform === "darwin") {
    await execFileAsync("open", [url]);
    return;
  }
  if (platform === "win32") {
    await execFileAsync("cmd", ["/c", "start", "", url]);
    return;
  }
  await execFileAsync("xdg-open", [url]);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function loginCli(options: { registry?: string; openBrowser?: boolean }) {
  const state = await readCliState();
  const registry = await resolveRegistryBase(options.registry?.trim() || state.registry);
  const start = await requestJson<DeviceStartResponse>(deviceStartUrl(registry), {
    registry,
    method: "POST",
  });

  console.log(`Open this link to connect the CLI:\n${start.verificationUrl}`);
  console.log(`Code: ${start.userCode}`);

  if (options.openBrowser !== false) {
    try {
      await openBrowser(start.verificationUrl);
    } catch {
      console.log("Could not open a browser automatically. Open the link manually.");
    }
  }

  const expiresAt = new Date(start.expiresAt).getTime();

  while (Date.now() < expiresAt) {
    await sleep(start.intervalSeconds * 1000);
    const result = await requestJson<DevicePollResponse>(devicePollUrl(registry), {
      registry,
      method: "POST",
      body: {
        deviceCode: start.deviceCode,
      },
    });

    if (result.ok && result.status === "pending") {
      continue;
    }

    if (!result.ok) {
      throw new Error(`CLI login ${result.status}.`);
    }

    await writeCliState({
      registry,
      token: result.token,
      viewer: result.viewer,
      projects: state.projects,
    });

    console.log(`Connected as ${result.viewer.displayName} (@${result.viewer.username}).`);
    return result.viewer;
  }

  throw new Error("CLI login expired.");
}

export async function whoAmICli(options: { registry?: string; json?: boolean }) {
  const state = await readCliState();
  const registry = await resolveRegistryBase(options.registry?.trim() || state.registry);
  const token = state.token?.trim();

  if (!token) {
    throw new Error("Not logged in. Run `skl login` first.");
  }

  const payload = await requestJson<WhoAmIResponse>(cliMeUrl(registry), {
    registry,
    token,
  });

  await writeCliState({
    registry,
    token,
    viewer: payload.viewer,
    projects: state.projects,
  });

  if (options.json) {
    console.log(JSON.stringify(payload.viewer, null, 2));
    return;
  }

  console.log(`${payload.viewer.displayName} (@${payload.viewer.username})`);
}

export async function logoutCli(options: { registry?: string }) {
  const state = await readCliState();
  const registry = await resolveRegistryBase(options.registry?.trim() || state.registry);

  if (state.token?.trim()) {
    try {
      await requestJson<{ ok: true }>(cliLogoutUrl(registry), {
        registry,
        method: "POST",
        token: state.token,
      });
    } catch {
      // local state should still be cleared
    }
  }

  await clearCliState();
  console.log("CLI session cleared.");
}
