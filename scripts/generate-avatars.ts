import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Resvg } from "@resvg/resvg-js";
import { ShieldAvatar } from "../components/shield-avatar";

type Options = {
  count: number;
  outDir: string;
  size: number;
};

const DEFAULT_COUNT = 100;
const DEFAULT_OUT_DIR = "generated-avatars";
const DEFAULT_SIZE = 256;

function parseInteger(value: string, flag: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

function parseArgs(argv: string[]): Options {
  let count = DEFAULT_COUNT;
  let outDir = DEFAULT_OUT_DIR;
  let size = DEFAULT_SIZE;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--count" && nextValue) {
      count = parseInteger(nextValue, "--count");
      index += 1;
      continue;
    }

    if (arg === "--size" && nextValue) {
      size = parseInteger(nextValue, "--size");
      index += 1;
      continue;
    }

    if (arg === "--out-dir" && nextValue) {
      outDir = nextValue.trim();
      if (!outDir) {
        throw new Error("--out-dir cannot be empty.");
      }
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { count, outDir, size };
}

function padNumber(value: number) {
  return value.toString().padStart(3, "0");
}

function renderAvatarSvg(seed: string, size: number) {
  const markup = renderToStaticMarkup(
    createElement(ShieldAvatar, {
      seed,
      size,
      showDebug: false,
    }),
  );

  return `<?xml version="1.0" encoding="UTF-8"?>\n${markup}\n`;
}

function renderAvatarPng(svg: string, size: number) {
  const renderer = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: size,
    },
  });

  return renderer.render().asPng();
}

async function main() {
  const { count, outDir, size } = parseArgs(process.argv.slice(2));
  const outputDir = resolve(process.cwd(), outDir);

  await mkdir(outputDir, { recursive: true });

  for (let index = 1; index <= count; index += 1) {
    const suffix = padNumber(index);
    const baseName = `avatar-${suffix}`;
    const seed = `generated-avatar-${suffix}`;
    const finalPath = join(outputDir, `${baseName}.png`);
    const svg = renderAvatarSvg(seed, size);
    const png = renderAvatarPng(svg, size);

    await writeFile(finalPath, png);
  }

  console.log(`Generated ${count} avatars in ${outputDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
