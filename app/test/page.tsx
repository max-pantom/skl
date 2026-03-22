"use client";

import { useCallback, useId, useMemo, useState } from "react";

/** FNV-1a 32-bit — stable hash for any seed string */
function hashString(input: string): number {
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

const VB_W = 71;
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

/** Default shield position/scale inside the circle (matches design tuning: 1.51×, 0, −13 viewBox units). */
const DEFAULT_SHIELD_LAYOUT = {
  avatarScale: 1.51,
  avatarOffsetX: 0,
  avatarOffsetY: -13,
} as const;

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

type ShieldPaint = {
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

function paramsFromSeed(seed: string): ShieldPaint {
  const h = hashString(seed.trim() || "anonymous");
  const rnd = mulberry32(h);

  const points =
    rnd() < RARE_FOUR_TIP_PROBABILITY ? 4 : 5 + Math.floor(rnd() * 6);
  const innerRatio = 0.28 + rnd() * 0.22;
  const topStarScale = 1.06 + rnd() * 0.1;
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
    topStarScale,
    unifiedGradient,
    topStop0,
    topStop1,
    bottomStop0,
    bottomStop1,
    stroke,
    strokeWidth: 1.25 + rnd() * 1.25,
  };
}

type ShieldAvatarProps = {
  seed: string;
  /** Outer diameter in CSS pixels (the circular frame). */
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

function ShieldAvatar({
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

  /**
   * Scale by height to match Figma, then translate so bbox is centered on x and bottom-aligned on y:
   * x' = tx + s·x, y' = ty + s·y with tx = 50 − s·centerX, ty = 100 − inset − s·maxY.
   */
  const shieldTransform = useMemo(() => {
    const s = (FRAME_VB * SHIELD_HEIGHT_IN_FRAME) / SHIELD_HEIGHT;
    const tx = FRAME_VB / 2 - s * SHIELD_CENTER_X;
    const ty = FRAME_VB - SHIELD_BOTTOM_INSET - s * SHIELD_BBOX.maxY;
    return `translate(${tx} ${ty}) scale(${s})`;
  }, []);

  /** Shield position/size inside the circle — does not change the outer frame. */
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

const SAMPLE_SEEDS = [
  "alice",
  "bob_42",
  "user_8f3a2c",
  "skl-registry",
  "a-very-long-username-for-testing-uniqueness",
  "テスト",
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim());
  if (!m) return null;
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) };
}

function rgbToHex(r: number, g: number, b: number) {
  const x = (n: number) => n.toString(16).padStart(2, "0");
  return `#${x(Math.round(r))}${x(Math.round(g))}${x(Math.round(b))}`;
}

/** Rough HSL → hex for color inputs (good enough for UI) */
function hslStringToHex(hslStr: string): string {
  const m = /hsl\(\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*\)/i.exec(hslStr);
  if (!m) return "#686868";
  let h = parseFloat(m[1]) / 360;
  const s = parseFloat(m[2]) / 100;
  const l = parseFloat(m[3]) / 100;
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const hk = (t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const r = hk(h + 1 / 3);
  const g = hk(h);
  const b = hk(h - 1 / 3);
  return rgbToHex(r * 255, g * 255, b * 255);
}

export default function TestAvatarPage() {
  const [seed, setSeed] = useState("debug-seed-1");
  const [showDebug, setShowDebug] = useState(true);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  /** Shield inside the circle — shared by every preview on this page. */
  const [avatarScale, setAvatarScale] = useState(DEFAULT_SHIELD_LAYOUT.avatarScale);
  const [avatarOffsetX, setAvatarOffsetX] = useState(DEFAULT_SHIELD_LAYOUT.avatarOffsetX);
  const [avatarOffsetY, setAvatarOffsetY] = useState(DEFAULT_SHIELD_LAYOUT.avatarOffsetY);
  const [copiedLayoutKey, setCopiedLayoutKey] = useState<string>("");

  const [topStarPlayground, setTopStarPlayground] = useState(1.1);
  const [topStarManual, setTopStarManual] = useState(1.1);

  const [points, setPoints] = useState(5);
  const [innerRatio, setInnerRatio] = useState(0.38);
  const [unifiedGradient, setUnifiedGradient] = useState(true);
  const [topStop0, setTopStop0] = useState("#686868");
  const [topStop1, setTopStop1] = useState("#181818");
  const [bottomStop0, setBottomStop0] = useState("#686868");
  const [bottomStop1, setBottomStop1] = useState("#181818");
  const [stroke, setStroke] = useState("#00fc43");
  const [strokeWidth, setStrokeWidth] = useState(2);

  const derived = useMemo(() => paramsFromSeed(seed), [seed]);

  const topStarValue = overrideEnabled ? topStarManual : topStarPlayground;
  const setTopStarValue = useCallback((v: number) => {
    if (overrideEnabled) setTopStarManual(v);
    else setTopStarPlayground(v);
  }, [overrideEnabled]);

  const pointsDisp = overrideEnabled ? points : derived.points;
  const innerRatioDisp = overrideEnabled ? innerRatio : derived.innerRatio;
  const unifiedDisp = overrideEnabled ? unifiedGradient : derived.unifiedGradient;
  const top0Disp = overrideEnabled ? topStop0 : hslStringToHex(derived.topStop0);
  const top1Disp = overrideEnabled ? topStop1 : hslStringToHex(derived.topStop1);
  const bot0Disp = overrideEnabled ? bottomStop0 : hslStringToHex(derived.bottomStop0);
  const bot1Disp = overrideEnabled ? bottomStop1 : hslStringToHex(derived.bottomStop1);
  const strokeDisp = overrideEnabled ? stroke : hslStringToHex(derived.stroke);
  const strokeWidthDisp = overrideEnabled ? strokeWidth : derived.strokeWidth;

  const randomizeSeed = useCallback(() => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const s = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    setSeed(`rnd-${s}`);
  }, []);

  const manual: ShieldPaint | undefined = overrideEnabled
    ? {
        points,
        innerRatio,
        topStarScale: topStarManual,
        unifiedGradient,
        topStop0,
        topStop1,
        bottomStop0,
        bottomStop1,
        stroke,
        strokeWidth,
      }
    : undefined;

  const syncFromSeed = useCallback(() => {
    const d = paramsFromSeed(seed);
    setPoints(d.points);
    setInnerRatio(d.innerRatio);
    setUnifiedGradient(d.unifiedGradient);
    setTopStop0(hslStringToHex(d.topStop0));
    setTopStop1(hslStringToHex(d.topStop1));
    setBottomStop0(hslStringToHex(d.bottomStop0));
    setBottomStop1(hslStringToHex(d.bottomStop1));
    setStroke(hslStringToHex(d.stroke));
    setStrokeWidth(d.strokeWidth);
    setTopStarManual(d.topStarScale);
  }, [seed]);

  const layoutProps = {
    avatarScale,
    avatarOffsetX,
    avatarOffsetY,
  } as const;

  const copyLayoutValue = useCallback((key: string, text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedLayoutKey(key);
    window.setTimeout(() => setCopiedLayoutKey(""), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2 border-b border-zinc-200 pb-6 dark:border-zinc-800">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Internal</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Shield avatar playground</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Layout matches{" "}
          <a
            href="https://www.figma.com/design/7CEkYWa9qILAR44XxKckGe/Studio?node-id=1636-464"
            className="text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-900 dark:text-zinc-100 dark:decoration-zinc-600 dark:hover:decoration-zinc-300"
            target="_blank"
            rel="noreferrer"
          >
            Figma 1636:464
          </a>
          : recessed 100×100 circle, shield ~66% of frame height, centered horizontally, collar bottom aligned to the
          clip. Irregular star (seeded), gradients + stroke — debug only.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="skl-surface space-y-6 p-6">
          <div className="flex flex-wrap items-end gap-6">
            <div className="flex flex-col items-center gap-2">
              <ShieldAvatar
                seed={seed}
                size={160}
                showDebug={showDebug}
                manual={manual}
                topStarScale={overrideEnabled ? undefined : topStarPlayground}
                {...layoutProps}
              />
              <span className="font-mono text-[10px] text-zinc-500">160px frame</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldAvatar
                seed={seed}
                size={48}
                showDebug={false}
                manual={manual}
                topStarScale={overrideEnabled ? undefined : topStarPlayground}
                {...layoutProps}
              />
              <span className="font-mono text-[10px] text-zinc-500">48px frame</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ShieldAvatar
                seed={seed}
                size={32}
                showDebug={false}
                manual={manual}
                topStarScale={overrideEnabled ? undefined : topStarPlayground}
                {...layoutProps}
              />
              <span className="font-mono text-[10px] text-zinc-500">32px frame</span>
            </div>
          </div>

          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">Sample seeds</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_SEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeed(s)}
                  className="rounded-none border border-zinc-300 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-ink hover:border-zinc-900 dark:border-zinc-600 dark:bg-zinc-900 dark:hover:border-zinc-400"
                >
                  {s.length > 24 ? `${s.slice(0, 24)}…` : s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">Uniqueness grid</p>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 12 }, (_, i) => {
                const s = `${seed}::${i}`;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <ShieldAvatar
                      seed={s}
                      size={56}
                      showDebug={false}
                      manual={manual}
                      topStarScale={overrideEnabled ? undefined : topStarPlayground}
                      {...layoutProps}
                    />
                    <span className="font-mono text-[9px] text-zinc-400">{i}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="skl-surface p-4">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Seed</h2>
            <label className="block space-y-1.5">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">String</span>
              <textarea
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                rows={3}
                className="skl-input resize-y font-mono text-xs"
                spellCheck={false}
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="skl-btn skl-btn-primary rounded-none text-xs" onClick={randomizeSeed}>
                Random seed
              </button>
              <button
                type="button"
                className="skl-btn skl-btn-secondary rounded-none text-xs"
                onClick={() => void navigator.clipboard.writeText(seed)}
              >
                Copy
              </button>
              <button type="button" className="skl-btn skl-btn-secondary rounded-none text-xs" onClick={syncFromSeed}>
                Load seed into controls
              </button>
            </div>
            <p className="mt-3 font-mono text-[10px] leading-relaxed text-zinc-500">hash: {hashString(seed).toString(16)}</p>
          </div>

          <div className="skl-surface p-4">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Mode</h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={overrideEnabled}
                onChange={(e) => {
                  const on = e.target.checked;
                  setOverrideEnabled(on);
                  if (on) syncFromSeed();
                }}
                className="rounded border-zinc-400"
              />
              Manual controls (off = values from seed only)
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showDebug}
                onChange={(e) => setShowDebug(e.target.checked)}
                className="rounded border-zinc-400"
              />
              Debug overlay (gradient axis + star center)
            </label>
          </div>

          <div className="skl-surface space-y-3 p-4">
            <h2 className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Top star</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Scales the <strong className="font-medium text-zinc-800 dark:text-zinc-200">star only</strong> (collar
              unchanged). Manual mode off: slider overrides seed size. Manual on: same slider edits the manual preset.
            </p>
            <Slider
              label="Top size (radius ×)"
              min={75}
              max={140}
              value={Math.round(topStarValue * 100)}
              onChange={(n) => setTopStarValue(n / 100)}
              format={(n) => `${(n / 100).toFixed(2)}×`}
            />
          </div>

          <div className="skl-surface space-y-3 p-4">
            <h2 className="mb-1 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Shield in circle</h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Adjusts the <strong className="font-medium text-zinc-800 dark:text-zinc-200">shield only</strong> inside the
              fixed circular frame. Values use the 100×100 SVG viewBox for X/Y. Applied to every preview on this page.
            </p>
            <Slider
              label="Shield scale"
              min={25}
              max={200}
              value={Math.round(avatarScale * 100)}
              onChange={(n) => setAvatarScale(n / 100)}
              format={(n) => `${(n / 100).toFixed(2)}×`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                Exact
                <input
                  type="number"
                  min={0.25}
                  max={2}
                  step={0.01}
                  value={avatarScale}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isFinite(v)) return;
                    setAvatarScale(Math.min(2, Math.max(0.25, v)));
                  }}
                  className="skl-input w-[4.5rem] font-mono text-xs tabular-nums"
                />
              </label>
              <button
                type="button"
                className="skl-btn skl-btn-secondary rounded-none text-xs"
                onClick={() => copyLayoutValue("scale", String(avatarScale))}
              >
                {copiedLayoutKey === "scale" ? "Copied" : "Copy"}
              </button>
            </div>
            <Slider
              label="Offset X"
              min={-50}
              max={50}
              value={Math.round(avatarOffsetX)}
              onChange={(n) => setAvatarOffsetX(n)}
              format={(n) => `${n}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                Exact
                <input
                  type="number"
                  min={-50}
                  max={50}
                  step={1}
                  value={avatarOffsetX}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isFinite(v)) return;
                    setAvatarOffsetX(Math.min(50, Math.max(-50, Math.round(v))));
                  }}
                  className="skl-input w-[4.5rem] font-mono text-xs tabular-nums"
                />
              </label>
              <button
                type="button"
                className="skl-btn skl-btn-secondary rounded-none text-xs"
                onClick={() => copyLayoutValue("x", String(avatarOffsetX))}
              >
                {copiedLayoutKey === "x" ? "Copied" : "Copy"}
              </button>
            </div>
            <Slider
              label="Offset Y"
              min={-50}
              max={50}
              value={Math.round(avatarOffsetY)}
              onChange={(n) => setAvatarOffsetY(n)}
              format={(n) => `${n}`}
            />
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                Exact
                <input
                  type="number"
                  min={-50}
                  max={50}
                  step={1}
                  value={avatarOffsetY}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (!Number.isFinite(v)) return;
                    setAvatarOffsetY(Math.min(50, Math.max(-50, Math.round(v))));
                  }}
                  className="skl-input w-[4.5rem] font-mono text-xs tabular-nums"
                />
              </label>
              <button
                type="button"
                className="skl-btn skl-btn-secondary rounded-none text-xs"
                onClick={() => copyLayoutValue("y", String(avatarOffsetY))}
              >
                {copiedLayoutKey === "y" ? "Copied" : "Copy"}
              </button>
            </div>
            <button
              type="button"
              className="skl-btn skl-btn-primary w-full rounded-none text-xs"
              onClick={() =>
                copyLayoutValue(
                  "all",
                  `${avatarScale}\t${avatarOffsetX}\t${avatarOffsetY}`,
                )
              }
            >
              {copiedLayoutKey === "all" ? "Copied scale, X, Y (tab-separated)" : "Copy scale + X + Y"}
            </button>
          </div>

          <div className="skl-surface space-y-3 p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Shape (top star)</h2>
            <Slider
              label="Points (tips, min 4)"
              min={4}
              max={10}
              value={pointsDisp}
              onChange={setPoints}
              disabled={!overrideEnabled}
            />
            <Slider
              label="Inner / outer ratio"
              min={22}
              max={55}
              value={Math.round(innerRatioDisp * 100)}
              onChange={(n) => setInnerRatio(n / 100)}
              disabled={!overrideEnabled}
              format={(n) => `${(n / 100).toFixed(2)}`}
            />
          </div>

          <div className="skl-surface space-y-3 p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Gradients (vertical)</h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={unifiedDisp}
                onChange={(e) => setUnifiedGradient(e.target.checked)}
                disabled={!overrideEnabled}
                className="rounded border-zinc-400"
              />
              One gradient for top + bottom
            </label>
            <ColorRow label="Top — stop 0 (top)" value={top0Disp} onChange={setTopStop0} disabled={!overrideEnabled} />
            <ColorRow label="Top — stop 1 (bottom of grad)" value={top1Disp} onChange={setTopStop1} disabled={!overrideEnabled} />
            {!unifiedDisp && (
              <>
                <ColorRow label="Bottom — stop 0" value={bot0Disp} onChange={setBottomStop0} disabled={!overrideEnabled} />
                <ColorRow label="Bottom — stop 1" value={bot1Disp} onChange={setBottomStop1} disabled={!overrideEnabled} />
              </>
            )}
          </div>

          <div className="skl-surface space-y-3 p-4">
            <h2 className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Stroke</h2>
            <ColorRow label="Color" value={strokeDisp} onChange={setStroke} disabled={!overrideEnabled} />
            <Slider
              label="Width"
              min={0}
              max={40}
              value={Math.round(strokeWidthDisp * 10)}
              onChange={(n) => setStrokeWidth(n / 10)}
              disabled={!overrideEnabled}
              format={(n) => `${(n / 10).toFixed(1)}`}
            />
          </div>

          <div className="skl-surface p-4">
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">From seed (reference)</h2>
            <dl className="space-y-1 font-mono text-[10px] text-zinc-600 dark:text-zinc-400">
              <div className="flex justify-between gap-2">
                <dt>points</dt>
                <dd>{derived.points}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>innerRatio</dt>
                <dd>{derived.innerRatio.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>topStarScale</dt>
                <dd>{derived.topStarScale.toFixed(2)}×</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt>unified grad</dt>
                <dd>{derived.unifiedGradient ? "yes" : "no"}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function normalizeHexForPicker(value: string): string {
  const t = value.trim().replace(/^#/, "");
  if (/^[\da-f]{6}$/i.test(t)) return `#${t.toLowerCase()}`;
  const raw = value.trim();
  const rgb = hexToRgb(raw.startsWith("#") ? raw : `#${raw}`);
  return rgb ? rgbToHex(rgb.r, rgb.g, rgb.b) : "#888888";
}

function ColorRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const pickerHex = normalizeHexForPicker(value);
  return (
    <label className={`flex items-center gap-2 ${disabled ? "opacity-60" : ""}`}>
      <span className="w-[140px] shrink-0 text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
      <input
        type="color"
        value={pickerHex}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-0.5 dark:border-zinc-600 dark:bg-zinc-900"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="skl-input min-w-0 flex-1 font-mono text-xs"
        spellCheck={false}
      />
    </label>
  );
}

function Slider({
  label,
  min,
  max,
  value,
  onChange,
  disabled,
  format,
}: {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
  format?: (n: number) => string;
}) {
  const display = format ? format(value) : String(value);
  return (
    <label className={`block space-y-1 ${disabled ? "opacity-60" : ""}`}>
      <span className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400">
        {label}
        <span className="font-mono tabular-nums text-zinc-500">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full accent-zinc-900 dark:accent-zinc-100"
      />
    </label>
  );
}
