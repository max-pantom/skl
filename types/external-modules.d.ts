declare module "gifenc" {
  export type GifColor = [number, number, number] | [number, number, number, number];
  export type GifPalette = GifColor[];

  export type QuantizeOptions = {
    clearAlpha?: boolean;
    clearAlphaColor?: number;
    clearAlphaThreshold?: number;
    format?: "rgb565" | "rgb444" | "rgba4444";
    oneBitAlpha?: boolean | number;
  };

  export type WriteFrameOptions = {
    delay?: number;
    dispose?: number;
    first?: boolean;
    palette?: GifPalette;
    repeat?: number;
    transparent?: boolean;
    transparentIndex?: number;
  };

  export type GifEncoderInstance = {
    bytes(): Uint8Array;
    bytesView(): Uint8Array;
    finish(): void;
    reset(): void;
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: WriteFrameOptions,
    ): void;
    writeHeader(): void;
  };

  export function GIFEncoder(options?: {
    auto?: boolean;
    initialCapacity?: number;
  }): GifEncoderInstance;

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: GifPalette,
    format?: "rgb565" | "rgb444" | "rgba4444",
  ): Uint8Array;

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: QuantizeOptions,
  ): GifPalette;
}

declare module "pngjs" {
  export type DecodedPng = {
    data: Buffer;
    height: number;
    width: number;
  };

  export class PNG {
    static sync: {
      read(data: Buffer | Uint8Array): DecodedPng;
    };
  }
}
