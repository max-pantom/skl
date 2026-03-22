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
};

/**
 * 100×100 circular slot: uploaded photo when set, otherwise seeded shield (same 100×100 viewBox + layout as /test).
 * Colors/shape come from a deterministic PRNG keyed by `userId` only so the avatar stays stable if the handle changes.
 */
export function ProfileAvatar({ avatarUrl, displayName, userId }: ProfileAvatarProps) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        className="size-[100px] rounded-full object-cover"
      />
    );
  }

  const seed = userId;

  return (
    <span className="inline-flex" role="img" aria-label={`${displayName} avatar`}>
      <ShieldAvatar
        seed={seed}
        size={100}
        showDebug={false}
        avatarScale={DEFAULT_SHIELD_LAYOUT.avatarScale}
        avatarOffsetX={DEFAULT_SHIELD_LAYOUT.avatarOffsetX}
        avatarOffsetY={DEFAULT_SHIELD_LAYOUT.avatarOffsetY}
        topStarScale={DEFAULT_TOP_STAR_SCALE}
      />
    </span>
  );
}
