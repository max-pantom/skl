/** Pure shield math + colors — safe for server routes (no React). */

/** FNV-1a 32-bit — stable hash for any seed string */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Mulberry32 PRNG from a 32-bit seed */
export function mulberry32(seed: number) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${Math.round(h % 360)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

/** Bottom “collar” — fixed geometry (from design SVG) */
export const BOTTOM_PATH =
  "M59.4869 79.5474L69.4971 103.71H1.49707L11.5072 79.5474H20.1366L28.4209 66.4307H42.5733L50.8575 79.5474H59.4869Z";

export const VB_H = 91;

/** Vertical gradient line (matches design defs) */
export const GRAD_X1 = 35.4971;
export const GRAD_Y1 = 0.445313;
export const GRAD_X2 = 35.4971;
export const GRAD_Y2 = 103.71;

export const STAR_CX = 35.4971;
export const STAR_CY = 31.5;
export const STAR_OUTER_R = 31;

/** ~3.5% of seeds get 4 tips; otherwise 5–10 (4 is the hard minimum everywhere). */
const RARE_FOUR_TIP_PROBABILITY = 0.035;

export const FRAME_VB = 100;
export const FRAME_CLIP_R = 50;

/** Default shield position/scale inside the 100×100 viewBox circle. */
export const DEFAULT_SHIELD_LAYOUT = {
  avatarScale: 1.51,
  avatarOffsetX: 0,
  avatarOffsetY: -13,
} as const;

/** Product default for top-star radius (collar unchanged). */
export const DEFAULT_TOP_STAR_SCALE = 1.23;

export const SHIELD_BBOX = {
  minX: 0,
  maxX: 71,
  minY: 0.445313,
  maxY: 103.71,
} as const;

export const SHIELD_CENTER_X = (SHIELD_BBOX.minX + SHIELD_BBOX.maxX) / 2;
export const SHIELD_HEIGHT = SHIELD_BBOX.maxY - SHIELD_BBOX.minY;

/** Shield height as a fraction of the 100×100 frame (design: ~60–70% of circle height) */
export const SHIELD_HEIGHT_IN_FRAME = 0.66;
/** Gap from frame bottom to lowest path point, in frame units */
export const SHIELD_BOTTOM_INSET = 2.5;

/**
 * Star-like top with unequal point lengths: each vertex gets its own radius multiplier (seeded).
 */
export function buildIrregularStarPath(
  seed: string,
  cx: number,
  cy: number,
  outerR: number,
  innerRatio: number,
  tips: number,
): string {
  const tipsN = Math.max(4, Math.min(10, Math.round(tips)));
  const n = tipsN * 2;
  const rnd = mulberry32(hashString(seed) ^ 0x2f6a3d1d);
  const parts: string[] = [];
  for (let i = 0; i < n; i++) {
    const isOuter = i % 2 === 0;
    const base = isOuter ? outerR : outerR * innerRatio;
    const jitter = 0.48 + rnd() * 0.52;
    const r = base * jitter;
    const a = (i * Math.PI) / tipsN - Math.PI / 2;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    parts.push(`${i === 0 ? "M" : "L"}${x.toFixed(4)} ${y.toFixed(4)}`);
  }
  return `${parts.join("")}Z`;
}

export type ShieldPaint = {
  points: number;
  innerRatio: number;
  topStarScale: number;
  unifiedGradient: boolean;
  topStop0: string;
  topStop1: string;
  bottomStop0: string;
  bottomStop1: string;
  stroke: string;
  strokeWidth: number;
};

export function paramsFromSeed(seed: string): ShieldPaint {
  const h = hashString(seed.trim() || "anonymous");
  const rnd = mulberry32(h);

  const points = rnd() < RARE_FOUR_TIP_PROBABILITY ? 4 : 5 + Math.floor(rnd() * 6);
  const innerRatio = 0.28 + rnd() * 0.22;
  const unifiedGradient = rnd() > 0.35;

  const th0 = rnd() * 360;
  const th1 = (th0 + 40 + rnd() * 80) % 360;
  const bh0 = (th0 + 180 + rnd() * 40) % 360;
  const bh1 = (bh0 + 30 + rnd() * 60) % 360;
  const sat = 55 + rnd() * 40;
  const l0 = 35 + rnd() * 20;
  const l1 = 55 + rnd() * 25;

  const topStop0 = hsl(th0, sat, l0);
  const topStop1 = hsl(th1, sat, l1);
  const bottomStop0 = hsl(bh0, sat - 5, l0 - 5);
  const bottomStop1 = hsl(bh1, sat - 5, l1 - 5);

  const strokeHue = (th0 + rnd() * 40) % 360;
  const stroke = hsl(strokeHue, 85 + rnd() * 15, 50 + rnd() * 15);

  return {
    points,
    innerRatio,
    topStarScale: DEFAULT_TOP_STAR_SCALE,
    unifiedGradient,
    topStop0,
    topStop1,
    bottomStop0,
    bottomStop1,
    stroke,
    strokeWidth: 1.25 + rnd() * 1.25,
  };
}

export function shieldTransformString(): string {
  const s = (FRAME_VB * SHIELD_HEIGHT_IN_FRAME) / SHIELD_HEIGHT;
  const tx = FRAME_VB / 2 - s * SHIELD_CENTER_X;
  const ty = FRAME_VB - SHIELD_BOTTOM_INSET - s * SHIELD_BBOX.maxY;
  return `translate(${tx} ${ty}) scale(${s})`;
}

export function avatarContentTransformString(
  avatarScale: number,
  avatarOffsetX: number,
  avatarOffsetY: number,
): string {
  const cx = FRAME_VB / 2;
  const cy = FRAME_VB / 2;
  return `translate(${avatarOffsetX} ${avatarOffsetY}) translate(${cx} ${cy}) scale(${avatarScale}) translate(${-cx} ${-cy})`;
}
