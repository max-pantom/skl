"use client";

import { useId, useMemo } from "react";

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
function mulberry32(seed: number) {
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
const BOTTOM_PATH =
  "M59.4869 79.5474L69.4971 103.71H1.49707L11.5072 79.5474H20.1366L28.4209 66.4307H42.5733L50.8575 79.5474H59.4869Z";

const VB_H = 91;

/** Vertical gradient line (matches design defs) */
const GRAD_X1 = 35.4971;
const GRAD_Y1 = 0.445313;
const GRAD_X2 = 35.4971;
const GRAD_Y2 = 103.71;

const STAR_CX = 35.4971;
const STAR_CY = 31.5;
const STAR_OUTER_R = 31;

/** ~3.5% of seeds get 4 tips; otherwise 5–10 (4 is the hard minimum everywhere). */
const RARE_FOUR_TIP_PROBABILITY = 0.035;

/**
 * Layout target: Figma node 1636:464 — avatar sits in the recessed circle with ~60–70% of the
 * circle height, centered horizontally, bottom of the collar aligned to the bottom arc of the clip.
 */
const FRAME_VB = 100;
const FRAME_CLIP_R = 50;

/** Default shield position/scale inside the 100×100 viewBox circle. */
export const DEFAULT_SHIELD_LAYOUT = {
  avatarScale: 1.51,
  avatarOffsetX: 0,
  avatarOffsetY: -13,
} as const;

/** Product default for top-star radius (collar unchanged). */
export const DEFAULT_TOP_STAR_SCALE = 1.23;

/** Combined path bounds in shield space (bottom path extends below 91; matches design SVG extent) */
const SHIELD_BBOX = {
  minX: 0,
  maxX: 71,
  minY: 0.445313,
  maxY: 103.71,
} as const;

const SHIELD_CENTER_X = (SHIELD_BBOX.minX + SHIELD_BBOX.maxX) / 2;
const SHIELD_HEIGHT = SHIELD_BBOX.maxY - SHIELD_BBOX.minY;

/** Shield height as a fraction of the 100×100 frame (design: ~60–70% of circle height) */
const SHIELD_HEIGHT_IN_FRAME = 0.66;
/** Gap from frame bottom to lowest path point, in frame units */
const SHIELD_BOTTOM_INSET = 2.5;

/**
 * Star-like top with unequal point lengths: each vertex gets its own radius multiplier (seeded).
 * Alternates outer / inner shells like a classic star, but jitter breaks perfect symmetry.
 */
function buildIrregularStarPath(
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
  /** Multiplier on star outer radius (1 = legacy design size). */
  topStarScale: number;
  unifiedGradient: boolean;
  /** Unified (or top when split): gradient stops */
  topStop0: string;
  topStop1: string;
  /** Bottom — only when !unifiedGradient */
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

export type ShieldAvatarProps = {
  seed: string;
  /** Outer diameter in CSS pixels (viewBox stays 100×100). */
  size: number;
  showDebug: boolean;
  manual?: Partial<ShieldPaint> | undefined;
  /** Scale of the shield artwork inside the clip (1 = default fit). Does not resize the circle. */
  avatarScale?: number;
  /** Horizontal offset of the shield in viewBox units (0–100 frame). */
  avatarOffsetX?: number;
  /** Vertical offset of the shield in viewBox units. */
  avatarOffsetY?: number;
  /**
   * Outer-radius multiplier for the top star only (collar unchanged).
   * Omit to use seed (or manual) paint values.
   */
  topStarScale?: number;
};

export function ShieldAvatar({
  seed,
  size,
  showDebug,
  manual,
  avatarScale = DEFAULT_SHIELD_LAYOUT.avatarScale,
  avatarOffsetX = DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
  avatarOffsetY = DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
  topStarScale: topStarScaleProp,
}: ShieldAvatarProps) {
  const instanceId = useId().replace(/:/g, "");
  const base = useMemo(() => paramsFromSeed(seed), [seed]);
  const p: ShieldPaint = {
    ...base,
    ...manual,
    points: manual?.points ?? base.points,
    innerRatio: manual?.innerRatio ?? base.innerRatio,
    topStarScale: manual?.topStarScale ?? topStarScaleProp ?? base.topStarScale,
    unifiedGradient: manual?.unifiedGradient ?? base.unifiedGradient,
    topStop0: manual?.topStop0 ?? base.topStop0,
    topStop1: manual?.topStop1 ?? base.topStop1,
    bottomStop0: manual?.bottomStop0 ?? base.bottomStop0,
    bottomStop1: manual?.bottomStop1 ?? base.bottomStop1,
    stroke: manual?.stroke ?? base.stroke,
    strokeWidth: manual?.strokeWidth ?? base.strokeWidth,
  };

  const uid = `${instanceId}-${hashString(seed)}`;
  const topPath = useMemo(
    () =>
      buildIrregularStarPath(
        seed,
        STAR_CX,
        STAR_CY,
        STAR_OUTER_R * p.topStarScale,
        p.innerRatio,
        p.points,
      ),
    [seed, p.points, p.innerRatio, p.topStarScale],
  );

  const botFill = p.unifiedGradient ? `url(#${uid}-g-top)` : `url(#${uid}-g-bot)`;
  const topFill = `url(#${uid}-g-top)`;

  const shieldTransform = useMemo(() => {
    const s = (FRAME_VB * SHIELD_HEIGHT_IN_FRAME) / SHIELD_HEIGHT;
    const tx = FRAME_VB / 2 - s * SHIELD_CENTER_X;
    const ty = FRAME_VB - SHIELD_BOTTOM_INSET - s * SHIELD_BBOX.maxY;
    return `translate(${tx} ${ty}) scale(${s})`;
  }, []);

  const avatarContentTransform = useMemo(() => {
    const cx = FRAME_VB / 2;
    const cy = FRAME_VB / 2;
    return `translate(${avatarOffsetX} ${avatarOffsetY}) translate(${cx} ${cy}) scale(${avatarScale}) translate(${-cx} ${-cy})`;
  }, [avatarScale, avatarOffsetX, avatarOffsetY]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${FRAME_VB} ${FRAME_VB}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 overflow-hidden rounded-full"
      aria-hidden
    >
      <defs>
        <filter
          id={`${uid}-frameFilter`}
          x="0"
          y="-3"
          width="100"
          height="103"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology radius={2} operator="dilate" in="SourceAlpha" result="effect1_innerShadow" />
          <feOffset dy={-3} />
          <feGaussianBlur stdDeviation={5.55} />
          <feComposite in2="hardAlpha" operator="arithmetic" k2={-1} k3={1} />
          <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
          <feBlend mode="normal" in2="shape" result="effect1_innerShadow" />
        </filter>
        <clipPath id={`${uid}-avatarClip`} clipPathUnits="userSpaceOnUse">
          <circle cx={FRAME_VB / 2} cy={FRAME_VB / 2} r={FRAME_CLIP_R} />
        </clipPath>
        <linearGradient id={`${uid}-g-top`} x1={GRAD_X1} y1={GRAD_Y1} x2={GRAD_X2} y2={GRAD_Y2} gradientUnits="userSpaceOnUse">
          <stop stopColor={p.topStop0} />
          <stop offset="1" stopColor={p.topStop1} />
        </linearGradient>
        {!p.unifiedGradient && (
          <linearGradient id={`${uid}-g-bot`} x1={GRAD_X1} y1={GRAD_Y1} x2={GRAD_X2} y2={GRAD_Y2} gradientUnits="userSpaceOnUse">
            <stop stopColor={p.bottomStop0} />
            <stop offset="1" stopColor={p.bottomStop1} />
          </linearGradient>
        )}
      </defs>

      <g filter={`url(#${uid}-frameFilter)`}>
        <rect width={FRAME_VB} height={FRAME_VB} rx={FRAME_VB / 2} fill="#F0F0F0" />
      </g>

      <g clipPath={`url(#${uid}-avatarClip)`}>
        <g transform={avatarContentTransform}>
          <g transform={shieldTransform}>
            <path d={BOTTOM_PATH} fill={botFill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round" />
            <path d={topPath} fill={topFill} stroke={p.stroke} strokeWidth={p.strokeWidth} strokeLinejoin="round" />
            {showDebug && (
              <g opacity={0.55} pointerEvents="none">
                <line x1={GRAD_X1} y1={0} x2={GRAD_X1} y2={VB_H} stroke="#a1a1aa" strokeWidth={0.35} />
                <circle cx={STAR_CX} cy={STAR_CY} r={2} fill="#f472b6" />
              </g>
            )}
          </g>
        </g>
      </g>

      {showDebug && (
        <circle
          cx={FRAME_VB / 2}
          cy={FRAME_VB / 2}
          r={FRAME_CLIP_R}
          fill="none"
          stroke="#f97316"
          strokeWidth={0.6}
          strokeDasharray="3 3"
          opacity={0.85}
          pointerEvents="none"
        />
      )}
    </svg>
  );
}
