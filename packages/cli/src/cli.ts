#!/usr/bin/env node
import { Command } from "commander";

import { installSkill, parseSlugSpec } from "./install.js";
import { DEFAULT_REGISTRY } from "./registry.js";

const program = new Command();

program.name("skl").description("CLI for installing skills from the SKL registry").version("0.1.0");

program
  .command("install")
  .alias("i")
  .description("Download a skill from the registry (one bundle request; counts as one download)")
  .argument("<slug>", "Skill slug, or slug@version")
  .option(
    "-r, --registry <url>",
    `Registry base URL (default: SKL_REGISTRY env or ${DEFAULT_REGISTRY})`,
  )
  .option("-o, --dir <path>", "Output directory (default: ./.skl/skills/<slug> or ~/.cursor/skills/<slug> with --target)")
  .option("--target <preset>", "Install preset: cursor → ~/.cursor/skills/<slug>")
  .option("-t, --token <token>", "Bearer token for authenticated installs (default: SKL_TOKEN env)")
  .action(async (slugArg: string, options: { registry?: string; dir?: string; target?: string; token?: string }) => {
    try {
      parseSlugSpec(slugArg);
    } catch (e) {
      program.error(e instanceof Error ? e.message : String(e));
      return;
    }

    if (options.target && options.target !== "cursor") {
      program.error(`Unknown --target "${options.target}". Supported: cursor`);
      return;
    }

    try {
      const { root, payload } = await installSkill({
        slugSpec: slugArg,
        registry: options.registry,
        outDir: options.dir,
        target: options.target === "cursor" ? "cursor" : undefined,
        token: options.token,
      });

      console.log(`Installed ${payload.title} v${payload.version} → ${root}`);
      console.log(`Files: ${payload.files.map((f) => f.path).join(", ")}`);
    } catch (e) {
      program.error(e instanceof Error ? e.message : String(e));
    }
  });

program.parse();
