#!/usr/bin/env node
import { Command } from "commander";

import { diffSkills } from "./diff.js";
import { inspectSkill } from "./inspect.js";
import { loginCli, logoutCli, whoAmICli } from "./auth.js";
import { installSkill, parseSlugSpec } from "./install.js";
import { publishSkill, updateSkill } from "./publish.js";
import { DEFAULT_REGISTRY } from "./registry.js";
import { runTui } from "./tui.js";

function createProgram() {
  const program = new Command();

  program
    .name("skl")
    .description("CLI for installing, inspecting, and publishing skills from the SKL registry")
    .version("0.2.0");

  program
    .command("login")
    .description("Connect this CLI to your SKL account")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .option("--no-open", "Do not try to open the browser automatically")
    .action(async (options: { registry?: string; open?: boolean }) => {
      await loginCli({
        registry: options.registry,
        openBrowser: options.open,
      });
    });

  program
    .command("logout")
    .description("Disconnect this CLI from your SKL account")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .action(async (options: { registry?: string }) => {
      await logoutCli(options);
    });

  program
    .command("whoami")
    .description("Show the currently connected SKL account")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .option("--json", "Emit JSON output")
    .action(async (options: { registry?: string; json?: boolean }) => {
      await whoAmICli(options);
    });

  program
    .command("install")
    .alias("i")
    .alias("add")
    .description("Download a skill bundle or a single file from a version")
    .argument("[slug]", "Skill slug, slug@version, or slug@version:path/to/file")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .option("-o, --dir <path>", "Output directory")
    .option("--target <preset>", "Install preset: cursor → ~/.cursor/skills/<slug>")
    .option("-t, --token <token>", "Bearer token for authenticated installs")
    .option("--dry-run", "Show what would be installed without writing files")
    .option("--json", "Emit JSON output")
    .option("--verbose", "Show request and manifest details")
    .action(
      async (
        slugArg: string | undefined,
        options: {
          registry?: string;
          dir?: string;
          target?: string;
          token?: string;
          dryRun?: boolean;
          json?: boolean;
          verbose?: boolean;
        },
      ) => {
        if (slugArg) {
          parseSlugSpec(slugArg);
        }

        if (options.target && options.target !== "cursor") {
          throw new Error(`Unknown --target "${options.target}". Supported: cursor`);
        }

        const result = await installSkill({
          slugSpec: slugArg,
          registry: options.registry,
          outDir: options.dir,
          target: options.target === "cursor" ? "cursor" : undefined,
          token: options.token,
          dryRun: options.dryRun,
          json: options.json,
          verbose: options.verbose,
        });

        if (!options.json) {
          if ("files" in result.payload) {
            console.log(`Installed ${result.payload.title} v${result.payload.version} → ${result.root}`);
            console.log(`Files: ${result.payload.files.map((file) => file.path).join(", ")}`);
          } else {
            console.log(`Installed ${result.payload.slug}${result.payload.version ? `@${result.payload.version}` : ""}:${result.payload.filePath} → ${result.root}`);
          }
        }
      },
    );

  program
    .command("inspect")
    .description("Inspect metadata, versions, files, and author details for a skill")
    .argument("[slug]", "Skill slug")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .option("-t, --token <token>", "Bearer token for authenticated access")
    .option("--json", "Emit JSON output")
    .action(async (slug: string | undefined, options: { registry?: string; token?: string; json?: boolean }) => {
      await inspectSkill({
        slug,
        registry: options.registry,
        token: options.token,
        json: options.json,
      });
    });

  program
    .command("diff")
    .description("Compare two skill versions")
    .argument("[left]", "Left ref in slug@version form")
    .argument("[right]", "Right ref in slug@version form")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .option("-t, --token <token>", "Bearer token for authenticated access")
    .option("--json", "Emit JSON output")
    .action(
      async (
        left: string | undefined,
        right: string | undefined,
        options: { registry?: string; token?: string; json?: boolean },
      ) => {
        await diffSkills({
          left,
          right,
          registry: options.registry,
          token: options.token,
          json: options.json,
        });
      },
    );

  program
    .command("publish")
    .description("Publish a local skill folder or SKILL.md")
    .argument("[path]", "Path to a folder or markdown entry file")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .option("--dry-run", "Validate and preview without uploading")
    .option("--json", "Emit JSON output")
    .action(async (inputPath: string | undefined, options: { registry?: string; dryRun?: boolean; json?: boolean }) => {
      await publishSkill({
        path: inputPath,
        registry: options.registry,
        dryRun: options.dryRun,
        json: options.json,
      });
    });

  program
    .command("update")
    .description("Push a new version from the local project")
    .argument("[pathOrSlug]", "Optional path override or remote skill slug")
    .option("-r, --registry <url>", `Registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .option("--dry-run", "Validate and preview without uploading")
    .option("--json", "Emit JSON output")
    .action(async (pathOrSlug: string | undefined, options: { registry?: string; dryRun?: boolean; json?: boolean }) => {
      await updateSkill({
        pathOrSlug,
        registry: options.registry,
        dryRun: options.dryRun,
        json: options.json,
      });
    });

  program
    .command("shell")
    .alias("tui")
    .description("Open the full-screen SKL terminal UI")
    .option("-r, --registry <url>", `Default registry base URL (default: saved state or ${DEFAULT_REGISTRY})`)
    .action(async (options: { registry?: string }) => {
      await runTui(options);
    });

  return program;
}

async function main() {
  const program = createProgram();

  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    program.error(error instanceof Error ? error.message : String(error));
  }
}

main();
