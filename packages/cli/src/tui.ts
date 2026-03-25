import { stdin as input, stdout as output } from "node:process";
import readline from "node:readline";
import readlinePromises from "node:readline/promises";

import { loginCli, logoutCli, whoAmICli } from "./auth.js";
import { diffSkills } from "./diff.js";
import { inspectSkill } from "./inspect.js";
import { installSkill } from "./install.js";
import { publishSkill, updateSkill } from "./publish.js";
import { readCliState } from "./state.js";

type TuiAction = {
  key: string;
  label: string;
  run: (ctx: TuiRuntime) => Promise<void>;
};

type TuiRuntime = {
  registry?: string;
  redraw: () => Promise<void>;
  ask: (label: string, defaultValue?: string) => Promise<string>;
  runTask: (label: string, task: () => Promise<void>) => Promise<void>;
  pushLog: (line: string) => void;
};

function ansi(code: string) {
  return `\u001b[${code}`;
}

function clearScreen() {
  output.write(`${ansi("2J")}${ansi("H")}`);
}

function stripAnsi(value: string) {
  return value.replace(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "");
}

function truncate(value: string, width: number) {
  const plain = stripAnsi(value);
  if (plain.length <= width) {
    return value;
  }
  return `${plain.slice(0, Math.max(0, width - 1))}…`;
}

function padVisible(value: string, width: number) {
  const plain = stripAnsi(value);
  if (plain.length >= width) {
    return truncate(value, width);
  }
  return `${value}${" ".repeat(width - plain.length)}`;
}

function formatPaneLine(left: string, right: string, leftWidth: number, rightWidth: number) {
  return `${padVisible(left, leftWidth)} │ ${padVisible(right, rightWidth)}\n`;
}

function title(text: string) {
  return `${ansi("1;33m")}${text}${ansi("0m")}`;
}

function muted(text: string) {
  return `${ansi("2m")}${text}${ansi("0m")}`;
}

function accent(text: string) {
  return `${ansi("36m")}${text}${ansi("0m")}`;
}

function success(text: string) {
  return `${ansi("32m")}${text}${ansi("0m")}`;
}

function danger(text: string) {
  return `${ansi("31m")}${text}${ansi("0m")}`;
}

function viewerInitials(displayName: string) {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) {
    return "SK";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function makeAvatarLines(displayName?: string) {
  if (!displayName?.trim()) {
    return [
      muted("Avatar"),
      "┌────┐",
      "│ ?? │",
      "└────┘",
    ];
  }

  const initials = viewerInitials(displayName).padEnd(2, " ").slice(0, 2);
  return [
    muted("Avatar"),
    "┌────┐",
    `│ ${accent(initials)} │`,
    "└────┘",
  ];
}

export async function runTui(options: { registry?: string }) {
  if (!input.isTTY || !output.isTTY) {
    throw new Error("TUI mode requires a terminal.");
  }

  let selected = 0;
  let busy = false;
  let status = "Ready";
  let prompting = false;
  let closed = false;
  let rendering = false;
  const logs: string[] = [];

  const pushLog = (line: string) => {
    const chunks = String(line)
      .split(/\r?\n/)
      .map((entry) => entry.trimEnd())
      .filter(Boolean);
    for (const chunk of chunks) {
      logs.push(chunk);
    }
    while (logs.length > 16) {
      logs.shift();
    }
  };

  const redraw = async () => {
    if (closed || rendering || prompting) {
      return;
    }

    rendering = true;
    try {
      const state = await readCliState();
      const width = output.columns || 100;
      const height = output.rows || 28;
      const leftWidth = Math.max(28, Math.floor(width * 0.34));
      const rightWidth = width - leftWidth - 3;
      const horizontal = "─".repeat(Math.max(10, width));
      const actions = buildActions();
      const viewer = state.viewer ? `${state.viewer.displayName} (@${state.viewer.username})` : "Not connected";
      const avatarLines = makeAvatarLines(state.viewer?.displayName);
      const registry = options.registry || state.registry;

      clearScreen();
      output.write(`${title("SKL")}  terminal UI\n`);
      output.write(`${horizontal}\n`);
      output.write(formatPaneLine(muted("Actions"), muted("Status"), leftWidth, rightWidth));

      const infoLines = [
        `Registry: ${registry}`,
        `Account: ${viewer}`,
        ...avatarLines,
        `State: ${busy ? "Busy" : "Idle"}`,
        `Message: ${status}`,
        "",
        muted("Logs"),
        ...logs.slice(-Math.max(4, height - 12)),
      ];

      for (let i = 0; i < Math.max(actions.length, infoLines.length); i += 1) {
        const action = actions[i];
        const info = infoLines[i] ?? "";
        let left = "";
        if (action) {
          const active = i === selected;
          const prefix = active ? accent(">") : " ";
          const body = `${action.key}. ${action.label}`;
          left = active ? `${prefix} ${title(body)}` : `  ${body}`;
        }
        output.write(formatPaneLine(left, info, leftWidth, rightWidth));
      }

      output.write(`${horizontal}\n`);
      output.write(`${muted("Keys:")} ↑/↓ move  enter run  number jump  r refresh  q quit\n`);
    } finally {
      rendering = false;
    }
  };

  const ask = async (label: string, defaultValue?: string) => {
    prompting = true;
    input.setRawMode(false);
    output.write(`${ansi("?25h")}\n`);
    const rl = readlinePromises.createInterface({ input, output });
    const suffix = defaultValue ? ` [${defaultValue}]` : "";
    const answer = (await rl.question(`${label}${suffix}: `)).trim();
    rl.close();
    input.setRawMode(true);
    output.write(ansi("?25l"));
    prompting = false;
    await redraw();
    return answer || defaultValue || "";
  };

  const runTask = async (label: string, task: () => Promise<void>) => {
    if (busy) {
      return;
    }

    busy = true;
    status = label;
    await redraw();

    const originalLog = console.log;
    const originalError = console.error;
    console.log = (...args: unknown[]) => pushLog(args.map(String).join(" "));
    console.error = (...args: unknown[]) => pushLog(args.map(String).join(" "));

    try {
      await task();
      status = success(`${label} complete`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      pushLog(`Error: ${message}`);
      status = danger(`${label} failed`);
    } finally {
      console.log = originalLog;
      console.error = originalError;
      busy = false;
      await redraw();
    }
  };

  const ctx: TuiRuntime = {
    registry: options.registry,
    redraw,
    ask,
    runTask,
    pushLog,
  };

  const buildActions = (): TuiAction[] => [
    {
      key: "1",
      label: "Login",
      run: async () => {
        await runTask("Login", async () => {
          await loginCli({ registry: options.registry });
        });
      },
    },
    {
      key: "2",
      label: "Who Am I",
      run: async () => {
        await runTask("Who Am I", async () => {
          await whoAmICli({ registry: options.registry });
        });
      },
    },
    {
      key: "3",
      label: "Add / Install Skill",
      run: async () => {
        const query = await ask("Slug or search phrase");
        await runTask("Install Skill", async () => {
          await installSkill({ slugSpec: query, registry: options.registry });
        });
      },
    },
    {
      key: "4",
      label: "Inspect Skill",
      run: async () => {
        const slug = await ask("Skill slug or search phrase");
        await runTask("Inspect Skill", async () => {
          await inspectSkill({ slug, registry: options.registry });
        });
      },
    },
    {
      key: "5",
      label: "Diff Versions",
      run: async () => {
        const left = await ask("Left ref (slug@version)");
        const right = await ask("Right ref (slug@version)");
        await runTask("Diff Versions", async () => {
          await diffSkills({ left, right, registry: options.registry });
        });
      },
    },
    {
      key: "6",
      label: "Publish",
      run: async () => {
        const maybePath = await ask("Path (optional)");
        await runTask("Publish", async () => {
          await publishSkill({ path: maybePath || undefined, registry: options.registry });
        });
      },
    },
    {
      key: "7",
      label: "Update",
      run: async () => {
        const value = await ask("Path or slug (optional)");
        await runTask("Update", async () => {
          await updateSkill({ pathOrSlug: value || undefined, registry: options.registry });
        });
      },
    },
    {
      key: "8",
      label: "Logout",
      run: async () => {
        await runTask("Logout", async () => {
          await logoutCli({ registry: options.registry });
        });
      },
    },
    {
      key: "9",
      label: "Refresh",
      run: async () => {
        status = "Refreshed";
        await redraw();
      },
    },
    {
      key: "0",
      label: "Quit",
      run: async () => {
        teardown();
      },
    },
  ];

  const onKeypress = async (_str: string, key: { name?: string; sequence?: string; ctrl?: boolean }) => {
    if (busy || prompting) {
      if (key.ctrl && key.name === "c") {
        teardown();
      }
      return;
    }

    if (key.ctrl && key.name === "c") {
      teardown();
      return;
    }

    const actions = buildActions();

    if (key.name === "up") {
      selected = (selected - 1 + actions.length) % actions.length;
      await redraw();
      return;
    }

    if (key.name === "down") {
      selected = (selected + 1) % actions.length;
      await redraw();
      return;
    }

    if (key.name === "return") {
      await actions[selected]!.run(ctx);
      return;
    }

    if (key.name === "q") {
      teardown();
      return;
    }

    if (key.name === "r") {
      status = "Refreshed";
      await redraw();
      return;
    }

    if (key.sequence && /^[0-9]$/.test(key.sequence)) {
      const index = actions.findIndex((action) => action.key === key.sequence);
      if (index >= 0) {
        selected = index;
        await redraw();
      }
    }
  };

  const teardown = () => {
    closed = true;
    input.off("keypress", onKeypress);
    input.setRawMode(false);
    output.write(`${ansi("?25h")}${ansi("0m")}`);
    clearScreen();
    process.exit(0);
  };

  readline.emitKeypressEvents(input);
  input.setRawMode(true);
  output.write(ansi("?25l"));
  input.on("keypress", onKeypress);
  await redraw();
}
