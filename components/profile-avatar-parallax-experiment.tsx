"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  ShieldAvatar,
} from "@/components/shield-avatar";

/** Tunable 3D hover — use on `/test2`; copy JSON to port into `ProfileAvatar` wrapper later. */
export const DEFAULT_PARALLAX_PARAMS = {
  perspective: 900,
  maxRotateX: 14,
  maxRotateY: 18,
  tiltSensitivity: 1,
  idleScale: 1,
  hoverScale: 0.94,
  idleTranslateZ: 0,
  hoverTranslateZ: -14,
  transitionMs: 180,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  shadowIdle: "0 8px 24px rgba(36, 36, 36, 0.12)",
  shadowHover: "0 18px 40px rgba(36, 36, 36, 0.2)",
} as const;

export type ParallaxParams = {
  perspective: number;
  maxRotateX: number;
  maxRotateY: number;
  tiltSensitivity: number;
  idleScale: number;
  hoverScale: number;
  idleTranslateZ: number;
  hoverTranslateZ: number;
  transitionMs: number;
  easing: string;
  shadowIdle: string;
  shadowHover: string;
};

const SAMPLE_USER = {
  userId: "experiment-user-stable-id",
  displayName: "Preview user",
  photoUrl: "https://picsum.photos/seed/skl-avatar/400/400",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit = "",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  unit?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-[#5f5f5f]">
        {label}
        <span className="ml-1 tabular-nums text-[#242424]">
          {value}
          {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-[#242424]"
      />
    </label>
  );
}

export function ProfileAvatarParallaxExperiment() {
  const [mode, setMode] = useState<"shield" | "photo">("shield");
  const [size, setSize] = useState(120);

  const [p, setP] = useState<ParallaxParams>({ ...DEFAULT_PARALLAX_PARAMS });

  const rootRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);

  const copyText = useMemo(() => JSON.stringify(p, null, 2), [p]);

  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const sens = p.tiltSensitivity;
      setRy(clamp(x * 2 * p.maxRotateY * sens, -p.maxRotateY * 1.25, p.maxRotateY * 1.25));
      setRx(clamp(-y * 2 * p.maxRotateX * sens, -p.maxRotateX * 1.25, p.maxRotateX * 1.25));
      setTracking(true);
    },
    [p.maxRotateX, p.maxRotateY, p.tiltSensitivity],
  );

  const onLeave = useCallback(() => {
    setHover(false);
    setRx(0);
    setRy(0);
    setTracking(false);
  }, []);

  const translateZ = hover ? p.hoverTranslateZ : p.idleTranslateZ;
  const scale = hover ? p.hoverScale : p.idleScale;
  const shadow = hover ? p.shadowHover : p.shadowIdle;

  /** perspective() on the transformed layer avoids flattening from overflow-hidden ancestors in Chrome. */
  const transform = `perspective(${p.perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${translateZ}px) scale(${scale})`;

  const avatarPx = Math.max(48, size);

  /** 3D applies only to the art layer; the circular mask is an untransformed ancestor (shield uses clipToCircle=false). */
  const artLayerStyle: CSSProperties = useMemo(
    () => ({
      transform,
      transformOrigin: mode === "shield" ? "50% 48%" : "50% 50%",
      transformStyle: "preserve-3d",
      transition: tracking
        ? "none"
        : `transform ${p.transitionMs}ms ${p.easing}, box-shadow ${p.transitionMs}ms ${p.easing}`,
      boxShadow: shadow,
      willChange: "transform",
    }),
    [transform, mode, tracking, p.transitionMs, p.easing, shadow],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1056px] flex-col gap-10 px-4 pb-16">
      <div className="flex flex-col gap-2">
        <h1 className="text-[22px] font-semibold text-[#242424]">Profile avatar — 3D parallax (experiment)</h1>
        <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-[#5f5f5f]">
          Perspective and rotation apply to the <strong className="font-semibold text-[#242424]">artwork only</strong>{" "}
          (photo or SVG paths). The circular mask stays fixed in screen space so the shield&apos;s top and bottom read in
          depth; hover adds scale + translateZ.
        </p>
        <p className="text-[14px] font-medium text-[#8f8f8f]">
          <a href="/test/playground" className="text-[#242424] underline decoration-dotted underline-offset-4">
            Shield studio
          </a>{" "}
          ·{" "}
          <a href="/test" className="text-[#242424] underline decoration-dotted underline-offset-4">
            /test
          </a>
        </p>
      </div>

      <div className="relative isolate grid gap-10 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div className="relative z-20 space-y-4 rounded-2xl border border-zinc-200 bg-[#fafafa] p-5">
          <div className="flex flex-wrap gap-3">
            <label className="flex items-center gap-2 text-[14px] font-medium text-[#242424]">
              <input
                type="radio"
                name="mode"
                checked={mode === "shield"}
                onChange={() => setMode("shield")}
              />
              Generated shield
            </label>
            <label className="flex items-center gap-2 text-[14px] font-medium text-[#242424]">
              <input
                type="radio"
                name="mode"
                checked={mode === "photo"}
                onChange={() => setMode("photo")}
              />
              Photo
            </label>
          </div>

          <Slider label="Avatar size (px)" value={size} onChange={setSize} min={64} max={200} step={1} />

          <Slider label="Perspective" value={p.perspective} onChange={(v) => setP((s) => ({ ...s, perspective: v }))} min={400} max={1600} step={10} />

          <Slider label="Max rotate X (deg)" value={p.maxRotateX} onChange={(v) => setP((s) => ({ ...s, maxRotateX: v }))} min={0} max={28} step={0.5} />

          <Slider label="Max rotate Y (deg)" value={p.maxRotateY} onChange={(v) => setP((s) => ({ ...s, maxRotateY: v }))} min={0} max={32} step={0.5} />

          <Slider
            label="Tilt sensitivity"
            value={p.tiltSensitivity}
            onChange={(v) => setP((s) => ({ ...s, tiltSensitivity: v }))}
            min={0.25}
            max={2}
            step={0.05}
          />

          <Slider label="Idle scale" value={p.idleScale} onChange={(v) => setP((s) => ({ ...s, idleScale: v }))} min={0.85} max={1} step={0.005} />

          <Slider label="Hover scale (inset)" value={p.hoverScale} onChange={(v) => setP((s) => ({ ...s, hoverScale: v }))} min={0.8} max={1} step={0.005} />

          <Slider label="Idle translateZ (px)" value={p.idleTranslateZ} onChange={(v) => setP((s) => ({ ...s, idleTranslateZ: v }))} min={-40} max={40} step={1} />

          <Slider
            label="Hover translateZ (px)"
            value={p.hoverTranslateZ}
            onChange={(v) => setP((s) => ({ ...s, hoverTranslateZ: v }))}
            min={-60}
            max={20}
            step={1}
          />

          <Slider label="Transition (ms)" value={p.transitionMs} onChange={(v) => setP((s) => ({ ...s, transitionMs: v }))} min={0} max={500} step={10} />

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#5f5f5f]">Easing (CSS)</span>
            <input
              value={p.easing}
              onChange={(e) => setP((s) => ({ ...s, easing: e.target.value }))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-[13px] text-[#242424]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#5f5f5f]">Shadow idle</span>
            <input
              value={p.shadowIdle}
              onChange={(e) => setP((s) => ({ ...s, shadowIdle: e.target.value }))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-[12px] text-[#242424]"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[13px] font-medium text-[#5f5f5f]">Shadow hover</span>
            <input
              value={p.shadowHover}
              onChange={(e) => setP((s) => ({ ...s, shadowHover: e.target.value }))}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 font-mono text-[12px] text-[#242424]"
            />
          </label>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              type="button"
              className="rounded-full bg-[#242424] px-4 py-2 text-[14px] font-medium text-white transition hover:bg-[#3a3a3a]"
              onClick={async () => {
                await navigator.clipboard.writeText(copyText);
              }}
            >
              Copy parameters (JSON)
            </button>
            <button
              type="button"
              className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-[14px] font-medium text-[#242424] transition hover:bg-zinc-50"
              onClick={() => setP({ ...DEFAULT_PARALLAX_PARAMS })}
            >
              Reset defaults
            </button>
          </div>
        </div>

        <div className="relative z-10 flex min-h-[320px] flex-col items-center justify-center gap-6 overflow-x-hidden rounded-2xl border border-dashed border-zinc-300 bg-white p-8">
          {/* Fixed hit box stops hover flicker when the inner layer scales. */}
          <div
            ref={rootRef}
            className="relative touch-none select-none"
            style={{ width: size, height: size }}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={onLeave}
            onPointerMove={onMove}
          >
            {/* Fixed porthole — not transformed. 3D lives on the child so shield paths tilt inside the circle. */}
            <div className="absolute inset-0 overflow-hidden rounded-full">
              <div className="flex h-full w-full items-center justify-center">
                {mode === "photo" ? (
                  <div className="pointer-events-none h-full w-full" style={artLayerStyle}>
                    <img
                      src={SAMPLE_USER.photoUrl}
                      alt={SAMPLE_USER.displayName}
                      width={avatarPx}
                      height={avatarPx}
                      className="block h-full w-full rounded-full object-cover"
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="pointer-events-none inline-flex" style={artLayerStyle}>
                    <ShieldAvatar
                      seed={SAMPLE_USER.userId}
                      size={avatarPx}
                      showDebug={false}
                      includeOuterDisc={false}
                      clipToCircle={false}
                      avatarScale={DEFAULT_SHIELD_LAYOUT.avatarScale}
                      avatarOffsetX={DEFAULT_SHIELD_LAYOUT.avatarOffsetX}
                      avatarOffsetY={DEFAULT_SHIELD_LAYOUT.avatarOffsetY}
                      topStarScale={DEFAULT_TOP_STAR_SCALE}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <p className="max-w-sm text-center text-[13px] font-medium text-[#8f8f8f]">
            3D applies to the art only; the circle is a fixed mask. Leave to reset.
          </p>
        </div>
      </div>

      <details className="rounded-xl border border-zinc-200 bg-[#fafafa] p-4">
        <summary className="cursor-pointer text-[14px] font-semibold text-[#242424]">Raw JSON</summary>
        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed text-[#3f3f3f]">
          {copyText}
        </pre>
      </details>
    </div>
  );
}
