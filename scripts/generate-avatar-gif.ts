import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import type { GifColor, GifPalette } from "gifenc";
import { GIFEncoder, applyPalette, quantize } from "gifenc";
import { PNG } from "pngjs";

type Options = {
  background: [number, number, number] | null;
  frameHeight: number;
  frameWidth: number;
  delay: number;
  inDir: string;
  outFile?: string;
  repeat: number;
};

const DEFAULT_BACKGROUND = "#ffffff";
const DEFAULT_DELAY = 100;
const DEFAULT_FRAME_SIZE = 600;
const DEFAULT_INPUT_DIR = "generated-avatars";
const DEFAULT_OUTPUT_NAME = "avatars.gif";
const DEFAULT_REPEAT = 0;

type ExactPaletteResult = {
  indexedPixels: Uint8Array;
  palette: GifPalette;
};

function parsePositiveInteger(value: string, flag: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new Error(`${flag} must be a positive integer.`);
  }
  return parsed;
}

function parseRepeat(value: string) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < -1) {
    throw new Error("--repeat must be -1, 0, or a positive integer.");
  }
  return parsed;
}

function parseBackground(value: string) {
  const trimmed = value.trim().toLowerCase();

  if (trimmed === "transparent") {
    return null;
  }

  const normalized = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((segment) => `${segment}${segment}`)
          .join("")
      : normalized;

  if (!/^[\da-f]{6}$/i.test(expanded)) {
    throw new Error("--background must be a hex color like #ffffff or the literal value transparent.");
  }

  return [
    Number.parseInt(expanded.slice(0, 2), 16),
    Number.parseInt(expanded.slice(2, 4), 16),
    Number.parseInt(expanded.slice(4, 6), 16),
  ] as [number, number, number];
}

function formatBackground(background: [number, number, number] | null) {
  if (!background) {
    return "transparent";
  }

  return `#${background.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function parseArgs(argv: string[]): Options {
  let background = parseBackground(DEFAULT_BACKGROUND);
  let delay = DEFAULT_DELAY;
  let frameHeight = DEFAULT_FRAME_SIZE;
  let frameWidth = DEFAULT_FRAME_SIZE;
  let inDir = DEFAULT_INPUT_DIR;
  let outFile: string | undefined;
  let repeat = DEFAULT_REPEAT;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const nextValue = argv[index + 1];

    if (arg === "--") {
      continue;
    }

    if (arg === "--loop") {
      repeat = 0;
      continue;
    }

    if (arg === "--background" && nextValue) {
      background = parseBackground(nextValue);
      index += 1;
      continue;
    }

    if ((arg === "--in-dir" || arg === "--input-dir") && nextValue) {
      inDir = nextValue.trim();
      if (!inDir) {
        throw new Error(`${arg} cannot be empty.`);
      }
      index += 1;
      continue;
    }

    if ((arg === "--out-file" || arg === "--output") && nextValue) {
      outFile = nextValue.trim();
      if (!outFile) {
        throw new Error(`${arg} cannot be empty.`);
      }
      index += 1;
      continue;
    }

    if ((arg === "--frame-width" || arg === "--width") && nextValue) {
      frameWidth = parsePositiveInteger(nextValue, arg);
      index += 1;
      continue;
    }

    if ((arg === "--frame-height" || arg === "--height") && nextValue) {
      frameHeight = parsePositiveInteger(nextValue, arg);
      index += 1;
      continue;
    }

    if ((arg === "--frame-size" || arg === "--canvas-size") && nextValue) {
      const size = parsePositiveInteger(nextValue, arg);
      frameWidth = size;
      frameHeight = size;
      index += 1;
      continue;
    }

    if ((arg === "--delay" || arg === "--frame-delay") && nextValue) {
      delay = parsePositiveInteger(nextValue, arg);
      index += 1;
      continue;
    }

    if (arg === "--repeat" && nextValue) {
      repeat = parseRepeat(nextValue);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return { background, delay, frameHeight, frameWidth, inDir, outFile, repeat };
}

function getOutputPath(inDir: string, outFile?: string) {
  if (outFile) {
    return resolve(process.cwd(), outFile);
  }

  return resolve(process.cwd(), inDir, DEFAULT_OUTPUT_NAME);
}

function getTransparentIndex(palette: Array<number[]>) {
  return palette.findIndex((color) => color[3] === 0);
}

function normalizeTransparentPixels(rgba: Uint8Array | Uint8ClampedArray) {
  const normalized = new Uint8Array(rgba.length);

  for (let index = 0; index < rgba.length; index += 4) {
    const alpha = rgba[index + 3] > 127 ? 255 : 0;
    normalized[index] = alpha === 0 ? 0 : rgba[index];
    normalized[index + 1] = alpha === 0 ? 0 : rgba[index + 1];
    normalized[index + 2] = alpha === 0 ? 0 : rgba[index + 2];
    normalized[index + 3] = alpha;
  }

  return normalized;
}

function centerOnCanvas(
  rgba: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  canvasWidth: number,
  canvasHeight: number,
  background: [number, number, number] | null,
) {
  if (width > canvasWidth || height > canvasHeight) {
    throw new Error(
      `Source PNG ${width}x${height} does not fit inside the ${canvasWidth}x${canvasHeight} frame.`,
    );
  }

  const canvas = new Uint8Array(canvasWidth * canvasHeight * 4);

  for (let index = 0; index < canvas.length; index += 4) {
    if (background) {
      canvas[index] = background[0];
      canvas[index + 1] = background[1];
      canvas[index + 2] = background[2];
      canvas[index + 3] = 255;
      continue;
    }

    canvas[index] = 0;
    canvas[index + 1] = 0;
    canvas[index + 2] = 0;
    canvas[index + 3] = 0;
  }

  const offsetX = Math.floor((canvasWidth - width) / 2);
  const offsetY = Math.floor((canvasHeight - height) / 2);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const sourceIndex = (y * width + x) * 4;
      const targetIndex = ((y + offsetY) * canvasWidth + (x + offsetX)) * 4;

      if (background) {
        const alpha = rgba[sourceIndex + 3] / 255;
        const inverseAlpha = 1 - alpha;

        canvas[targetIndex] = Math.round(rgba[sourceIndex] * alpha + background[0] * inverseAlpha);
        canvas[targetIndex + 1] = Math.round(
          rgba[sourceIndex + 1] * alpha + background[1] * inverseAlpha,
        );
        canvas[targetIndex + 2] = Math.round(
          rgba[sourceIndex + 2] * alpha + background[2] * inverseAlpha,
        );
        canvas[targetIndex + 3] = 255;
        continue;
      }

      canvas[targetIndex] = rgba[sourceIndex];
      canvas[targetIndex + 1] = rgba[sourceIndex + 1];
      canvas[targetIndex + 2] = rgba[sourceIndex + 2];
      canvas[targetIndex + 3] = rgba[sourceIndex + 3];
    }
  }

  return canvas;
}

function buildExactPalette(
  rgba: Uint8Array | Uint8ClampedArray,
  includeAlpha: boolean,
): ExactPaletteResult | null {
  const palette: GifPalette = [];
  const indexedPixels = new Uint8Array(rgba.length / 4);
  const colorIndexes = new Map<string, number>();

  for (let rgbaIndex = 0, pixelIndex = 0; rgbaIndex < rgba.length; rgbaIndex += 4, pixelIndex += 1) {
    const key = includeAlpha
      ? `${rgba[rgbaIndex]},${rgba[rgbaIndex + 1]},${rgba[rgbaIndex + 2]},${rgba[rgbaIndex + 3]}`
      : `${rgba[rgbaIndex]},${rgba[rgbaIndex + 1]},${rgba[rgbaIndex + 2]}`;
    let paletteIndex = colorIndexes.get(key);

    if (paletteIndex === undefined) {
      if (palette.length === 256) {
        return null;
      }

      paletteIndex = palette.length;
      const color: GifColor = includeAlpha
        ? [rgba[rgbaIndex], rgba[rgbaIndex + 1], rgba[rgbaIndex + 2], rgba[rgbaIndex + 3]]
        : [rgba[rgbaIndex], rgba[rgbaIndex + 1], rgba[rgbaIndex + 2]];
      palette.push(color);
      colorIndexes.set(key, paletteIndex);
    }

    indexedPixels[pixelIndex] = paletteIndex;
  }

  return { indexedPixels, palette };
}

function encodeFrame(rgba: Uint8Array | Uint8ClampedArray, background: [number, number, number] | null) {
  if (background) {
    const exactPalette = buildExactPalette(rgba, false);

    if (exactPalette) {
      return {
        indexedPixels: exactPalette.indexedPixels,
        palette: exactPalette.palette,
        transparent: false,
        transparentIndex: -1,
      };
    }

    const palette = quantize(rgba, 256, {
      format: "rgb565",
    });

    return {
      indexedPixels: applyPalette(rgba, palette, "rgb565"),
      palette,
      transparent: false,
      transparentIndex: -1,
    };
  }

  const normalized = normalizeTransparentPixels(rgba);
  const exactPalette = buildExactPalette(normalized, true);

  if (exactPalette) {
    return {
      indexedPixels: exactPalette.indexedPixels,
      palette: exactPalette.palette,
      transparent: true,
      transparentIndex: getTransparentIndex(exactPalette.palette),
    };
  }

  const palette = quantize(normalized, 256, {
    clearAlpha: true,
    clearAlphaThreshold: 127,
    format: "rgba4444",
    oneBitAlpha: true,
  });
  const transparentIndex = getTransparentIndex(palette);

  return {
    indexedPixels: applyPalette(normalized, palette, "rgba4444"),
    palette,
    transparent: transparentIndex >= 0,
    transparentIndex,
  };
}

async function getPngPaths(inputDir: string) {
  const entries = await readdir(inputDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".png")
    .map((entry) => join(inputDir, entry.name))
    .sort((left, right) =>
      left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" }),
    );
}

async function main() {
  const { background, delay, frameHeight, frameWidth, inDir, outFile, repeat } = parseArgs(
    process.argv.slice(2),
  );
  const inputDir = resolve(process.cwd(), inDir);
  const outputPath = getOutputPath(inDir, outFile);
  const pngPaths = await getPngPaths(inputDir);

  if (pngPaths.length === 0) {
    throw new Error(`No PNG files found in ${inputDir}`);
  }

  const gif = GIFEncoder();

  for (const [index, pngPath] of pngPaths.entries()) {
    const pngBuffer = await readFile(pngPath);
    const png = PNG.sync.read(pngBuffer);

    const framedPixels = centerOnCanvas(
      png.data,
      png.width,
      png.height,
      frameWidth,
      frameHeight,
      background,
    );
    const frame = encodeFrame(framedPixels, background);

    gif.writeFrame(frame.indexedPixels, frameWidth, frameHeight, {
      delay,
      dispose: frame.transparent ? 2 : -1,
      palette: frame.palette,
      repeat: index === 0 ? repeat : undefined,
      transparent: frame.transparent,
      transparentIndex: frame.transparentIndex >= 0 ? frame.transparentIndex : 0,
    });
  }

  gif.finish();

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, gif.bytesView());

  console.log(
    `Created GIF with ${pngPaths.length} frames at ${outputPath} using ${formatBackground(background)} background in a ${frameWidth}x${frameHeight} frame`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
