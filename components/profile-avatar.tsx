"use client";

import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  ShieldAvatar,
} from "@/components/shield-avatar";

type ProfileAvatarProps = {
  avatarUrl: string | null;
  displayName: string;
  /** Stable id — deterministic generated shield (PRNG from this string). */
  userId: string;
  /** Square edge length in px (default 100). */
  size?: number;
};

/**
 * Circular slot: uploaded photo when set, otherwise seeded shield (same viewBox + layout as /test).
 * Colors/shape come from a deterministic PRNG keyed by `userId` only so the avatar stays stable if the handle changes.
 */
export function ProfileAvatar({ avatarUrl, displayName, userId, size = 100 }: ProfileAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  const seed = userId;

  return (
    <span className="inline-flex shrink-0" role="img" aria-label={`${displayName} avatar`}>
      <ShieldAvatar
        seed={seed}
        size={size}
        showDebug={false}
        avatarScale={DEFAULT_SHIELD_LAYOUT.avatarScale}
        avatarOffsetX={DEFAULT_SHIELD_LAYOUT.avatarOffsetX}
        avatarOffsetY={DEFAULT_SHIELD_LAYOUT.avatarOffsetY}
        topStarScale={DEFAULT_TOP_STAR_SCALE}
      />
    </span>
  );
}
