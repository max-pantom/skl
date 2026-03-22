"use client";

import { useId, useMemo } from "react";

import { ADMIN_DEFAULT_AVATAR_PATH } from "@/lib/admin-avatar";
import {
  DEFAULT_SHIELD_LAYOUT,
  FRAME_CLIP_R,
  FRAME_VB,
  SHIELD_BBOX,
  SHIELD_HEIGHT,
  avatarContentTransformString,
  shieldTransformString,
} from "@/lib/shield-avatar-core";

type AdminAvatarCircleProps = {
  size: number;
  /**
   * When true, matches default {@link ShieldAvatar}: light gray disc + inner shadow + circular clip.
   * When false, matches parallax hero {@link ShieldAvatar}: artwork only (parent supplies the round mask).
   */
  includeOuterDisc?: boolean;
};

/**
 * Admin default artwork inside the same circular frame as seeded {@link ShieldAvatar} shields.
 */
export function AdminAvatarCircle({ size, includeOuterDisc = true }: AdminAvatarCircleProps) {
  const rawId = useId().replace(/:/g, "");
  const uid = useMemo(() => `adm-${rawId}`, [rawId]);

  /** Same transform chain as {@link ShieldAvatar} so the admin asset fills the circle like seeded shields. */
  const shieldTransform = useMemo(() => shieldTransformString(), []);
  const avatarContentTransform = useMemo(
    () =>
      avatarContentTransformString(
        DEFAULT_SHIELD_LAYOUT.avatarScale,
        DEFAULT_SHIELD_LAYOUT.avatarOffsetX,
        DEFAULT_SHIELD_LAYOUT.avatarOffsetY,
      ),
    [],
  );

  const inner = (
    <g transform={avatarContentTransform}>
      <g transform={shieldTransform}>
        <image
          href={ADMIN_DEFAULT_AVATAR_PATH}
          x={SHIELD_BBOX.minX}
          y={SHIELD_BBOX.minY}
          width={SHIELD_BBOX.maxX - SHIELD_BBOX.minX}
          height={SHIELD_HEIGHT}
          preserveAspectRatio="xMidYMid meet"
        />
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
      className={includeOuterDisc ? "shrink-0 overflow-hidden rounded-full" : "shrink-0 overflow-visible"}
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
        {includeOuterDisc ? (
          <clipPath id={`${uid}-avatarClip`} clipPathUnits="userSpaceOnUse">
            <circle cx={FRAME_VB / 2} cy={FRAME_VB / 2} r={FRAME_CLIP_R} />
          </clipPath>
        ) : null}
      </defs>

      {includeOuterDisc ? (
        <g filter={`url(#${uid}-frameFilter)`}>
          <rect width={FRAME_VB} height={FRAME_VB} rx={FRAME_VB / 2} fill="#F0F0F0" />
        </g>
      ) : null}

      {includeOuterDisc ? <g clipPath={`url(#${uid}-avatarClip)`}>{inner}</g> : inner}
    </svg>
  );
}
