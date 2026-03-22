"use client";

import { useCallback, useMemo, useState } from "react";

import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  ShieldAvatar,
  hashString,
  paramsFromSeed,
  type ShieldPaint,
} from "@/components/shield-avatar";

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
  const [avatarScale, setAvatarScale] = useState<number>(DEFAULT_SHIELD_LAYOUT.avatarScale);
  const [avatarOffsetX, setAvatarOffsetX] = useState<number>(DEFAULT_SHIELD_LAYOUT.avatarOffsetX);
  const [avatarOffsetY, setAvatarOffsetY] = useState<number>(DEFAULT_SHIELD_LAYOUT.avatarOffsetY);
  const [copiedLayoutKey, setCopiedLayoutKey] = useState<string>("");

  const [topStarPlayground, setTopStarPlayground] = useState(DEFAULT_TOP_STAR_SCALE);
  const [topStarManual, setTopStarManual] = useState(DEFAULT_TOP_STAR_SCALE);

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
      <p className="text-sm text-zinc-600">
        <a href="/test" className="text-zinc-900 underline decoration-zinc-400 underline-offset-2">
          ← Studio mock (Figma 1631:506)
        </a>
      </p>
      <header className="space-y-2 border-b border-zinc-200 pb-6">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">Internal</p>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Shield avatar playground</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
          Layout matches{" "}
          <a
            href="https://www.figma.com/design/7CEkYWa9qILAR44XxKckGe/Studio?node-id=1636-464"
            className="text-zinc-900 underline decoration-zinc-400 underline-offset-2 hover:decoration-zinc-900"
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
                  className="rounded-none border border-zinc-300 bg-zinc-50 px-2.5 py-1 font-mono text-xs text-ink hover:border-zinc-900"
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
              <span className="text-xs text-zinc-600">String</span>
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
            <p className="text-xs text-zinc-600">
              Scales the <strong className="font-medium text-zinc-800">star only</strong> (collar
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
            <p className="text-xs text-zinc-600">
              Adjusts the <strong className="font-medium text-zinc-800">shield only</strong> inside the
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
              <label className="flex items-center gap-2 text-xs text-zinc-600">
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
              <label className="flex items-center gap-2 text-xs text-zinc-600">
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
              <label className="flex items-center gap-2 text-xs text-zinc-600">
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
            <dl className="space-y-1 font-mono text-[10px] text-zinc-600">
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
      <span className="w-[140px] shrink-0 text-xs text-zinc-600">{label}</span>
      <input
        type="color"
        value={pickerHex}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 w-12 cursor-pointer rounded border border-zinc-300 bg-white p-0.5"
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
      <span className="flex justify-between text-xs text-zinc-600">
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
        className="w-full accent-zinc-900"
      />
    </label>
  );
}
