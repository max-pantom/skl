"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  ShieldAvatar,
} from "@/components/shield-avatar";
import { ADMIN_DEFAULT_AVATAR_PATH } from "@/lib/admin-avatar";
import { HERO_PROFILE_PARALLAX_PARAMS } from "@/lib/profile-hero-parallax-params";
import type { UserRole } from "@/lib/types";

type ProfileAvatarProps = {
  avatarUrl: string | null;
  displayName: string;
  /** Stable id — deterministic generated shield (PRNG from this string). */
  userId: string;
  /** Admins without an uploaded photo use {@link ADMIN_DEFAULT_AVATAR_PATH}. */
  role?: UserRole;
  /** Square edge length in px (default 100). */
  size?: number;
  /**
   * Hero profile: pointer 3D tilt with {@link HERO_PROFILE_PARALLAX_PARAMS}.
   * Box-shadow is removed while hovering (idle keeps a light shadow).
   */
  parallax?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * Circular slot: uploaded photo when set, otherwise seeded shield (same viewBox + layout as /test).
 * Colors/shape come from a deterministic PRNG keyed by `userId` only so the avatar stays stable if the handle changes.
 */
export function ProfileAvatar({
  avatarUrl,
  displayName,
  userId,
  role,
  size = 100,
  parallax = false,
}: ProfileAvatarProps) {
  if (parallax) {
    return (
      <ProfileAvatarParallaxHero
        avatarUrl={avatarUrl}
        displayName={displayName}
        userId={userId}
        role={role}
        size={size ?? 100}
      />
    );
  }

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

  if (role === "admin") {
    return (
      <span
        className="inline-flex shrink-0 overflow-hidden rounded-full bg-[#f4f4f4]"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${displayName} avatar`}
      >
        <img
          src={ADMIN_DEFAULT_AVATAR_PATH}
          alt=""
          width={size}
          height={size}
          className="h-full w-full object-contain p-[6%]"
          draggable={false}
        />
      </span>
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

function ProfileAvatarParallaxHero({
  avatarUrl,
  displayName,
  userId,
  role,
  size,
}: {
  avatarUrl: string | null;
  displayName: string;
  userId: string;
  role?: UserRole;
  size: number;
}) {
  const p = HERO_PROFILE_PARALLAX_PARAMS;
  const hasPhoto = Boolean(avatarUrl);
  const adminDefault = role === "admin" && !avatarUrl;

  const rootRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);

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
  /** No shadow on hover — keep idle shadow only. */
  const shadow = hover ? "none" : p.shadowIdle;

  const transform = `perspective(${p.perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(${translateZ}px) scale(${scale})`;

  const artLayerStyle: CSSProperties = useMemo(
    () => ({
      transform,
      transformOrigin: hasPhoto || adminDefault ? "50% 50%" : "50% 48%",
      transformStyle: "preserve-3d",
      transition: tracking
        ? "none"
        : `transform ${p.transitionMs}ms ${p.easing}, box-shadow ${p.transitionMs}ms ${p.easing}`,
      boxShadow: shadow,
      willChange: "transform",
    }),
    [transform, hasPhoto, adminDefault, tracking, p.transitionMs, p.easing, shadow],
  );

  const seed = userId;
  const avatarPx = Math.max(48, size);

  return (
    <div
      ref={rootRef}
      className="relative touch-none select-none"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${displayName} avatar`}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div className="flex h-full w-full items-center justify-center">
          {hasPhoto ? (
            <div className="pointer-events-none h-full w-full" style={artLayerStyle}>
              <img
                src={avatarUrl!}
                alt={displayName}
                width={avatarPx}
                height={avatarPx}
                className="block h-full w-full rounded-full object-cover"
                draggable={false}
              />
            </div>
          ) : adminDefault ? (
            <div className="pointer-events-none h-full w-full bg-[#f4f4f4]" style={artLayerStyle}>
              <img
                src={ADMIN_DEFAULT_AVATAR_PATH}
                alt=""
                width={avatarPx}
                height={avatarPx}
                className="block h-full w-full rounded-full object-contain p-[6%]"
                draggable={false}
              />
            </div>
          ) : (
            <div className="pointer-events-none inline-flex" style={artLayerStyle}>
              <ShieldAvatar
                seed={seed}
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
  );
}
