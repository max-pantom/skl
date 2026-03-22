"use client";

import React, { useId, useMemo } from "react";

import {
  BOTTOM_PATH,
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  FRAME_CLIP_R,
  FRAME_VB,
  GRAD_X1,
  GRAD_X2,
  GRAD_Y1,
  GRAD_Y2,
  STAR_CX,
  STAR_CY,
  STAR_OUTER_R,
  VB_H,
  avatarContentTransformString,
  buildIrregularStarPath,
  hashString,
  paramsFromSeed,
  shieldTransformString,
  type ShieldPaint,
} from "@/lib/shield-avatar-core";

/** Re-export for consumers that only need hashing / layout constants. */
export { hashString, paramsFromSeed, DEFAULT_SHIELD_LAYOUT, DEFAULT_TOP_STAR_SCALE };
export type { ShieldPaint };

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
  /** When false, omit the light gray outer disc — use when a parent provides the circular frame (e.g. parallax shell). */
  includeOuterDisc?: boolean;
  /**
   * When false, omit the inner SVG circular clip. Use when a parent masks with CSS (e.g. overflow-hidden
   * rounded-full) so the mask stays in screen space while the SVG tilts in 3D — only the paths move.
   */
  clipToCircle?: boolean;
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
  includeOuterDisc = true,
  clipToCircle = true,
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

  const shieldTransform = useMemo(() => shieldTransformString(), []);
  const avatarContentTransform = useMemo(
    () => avatarContentTransformString(avatarScale, avatarOffsetX, avatarOffsetY),
    [avatarScale, avatarOffsetX, avatarOffsetY],
  );

  const shieldArt = (
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
  );

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${FRAME_VB} ${FRAME_VB}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={clipToCircle ? "shrink-0 overflow-hidden rounded-full" : "shrink-0 overflow-visible"}
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
        {clipToCircle ? (
          <clipPath id={`${uid}-avatarClip`} clipPathUnits="userSpaceOnUse">
            <circle cx={FRAME_VB / 2} cy={FRAME_VB / 2} r={FRAME_CLIP_R} />
          </clipPath>
        ) : null}
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

      {includeOuterDisc ? (
        <g filter={`url(#${uid}-frameFilter)`}>
          <rect width={FRAME_VB} height={FRAME_VB} rx={FRAME_VB / 2} fill="#F0F0F0" />
        </g>
      ) : null}

      {clipToCircle ? <g clipPath={`url(#${uid}-avatarClip)`}>{shieldArt}</g> : shieldArt}

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
