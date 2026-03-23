"use client";

import type { CSSProperties } from "react";
import { useCallback, useMemo, useRef, useState } from "react";

import { AdminAvatarCircle } from "@/components/admin-avatar-circle";
import {
  DEFAULT_SHIELD_LAYOUT,
  DEFAULT_TOP_STAR_SCALE,
  ShieldAvatar,
} from "@/components/shield-avatar";
import { HERO_PROFILE_PARALLAX_PARAMS } from "@/lib/profile-hero-parallax-params";
import type { UserRole } from "@/lib/types";

type ProfileAvatarProps = {
  /** Unused for display — SKL uses seeded shields; kept for call-site / data compatibility. */
  avatarUrl: string | null;
  displayName: string;
  /** Stable id — deterministic shield (PRNG from this string). */
  userId: string;
  /** Admins: {@link AdminAvatarCircle} when circular; on ID layouts (`clipCircle` false) a letter only, no frame. */
  role?: UserRole;
  size?: number;
  /**
   * Hero profile: pointer 3D tilt with {@link HERO_PROFILE_PARALLAX_PARAMS}.
   * Box-shadow is removed while hovering (idle keeps a light shadow).
   */
  parallax?: boolean;
  /**
   * When false, no circular clip on the shield / no circle variant for admin (letter tile). The artwork only — no extra frame.
   */
  clipCircle?: boolean;
  /**
   * Parent supplies a fixed circle (e.g. overflow-hidden rounded-full). Shield omits the outer gray ring.
   */
  nestedCircle?: boolean;
  /**
   * Admin-only override for card layouts that should not reuse the circular admin framing.
   */
  adminClipCircle?: boolean;
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/**
 * SKL avatar only: seeded {@link ShieldAvatar} for members, admin treatment for `role === "admin"`.
 * `avatarUrl` is ignored.
 */
export function ProfileAvatar({
  avatarUrl: _avatarUrl,
  displayName,
  userId,
  role,
  size = 100,
  parallax = false,
  clipCircle = true,
  nestedCircle = false,
  adminClipCircle = clipCircle,
}: ProfileAvatarProps) {
  void _avatarUrl;

  if (parallax) {
    return (
      <ProfileAvatarParallaxHero displayName={displayName} userId={userId} role={role} size={size ?? 100} />
    );
  }

  if (role === "admin") {
    if (!clipCircle) {
      return (
        <span
          role="img"
          aria-label={`${displayName} avatar`}
          className="inline-flex shrink-0 items-center justify-center overflow-hidden"
          style={{
            width: size,
            height: size,
          }}
        >
          <AdminAvatarCircle size={size} includeOuterDisc={false} clipToCircle={adminClipCircle} />
        </span>
      );
    }
    return (
      <span
        className={nestedCircle ? "flex h-full w-full shrink-0 items-center justify-center" : "inline-flex shrink-0"}
        role="img"
        aria-label={`${displayName} avatar`}
      >
        <AdminAvatarCircle size={size} includeOuterDisc={!nestedCircle} clipToCircle />
      </span>
    );
  }

  const seed = userId;

  const shield = (
    <ShieldAvatar
      seed={seed}
      size={size}
      showDebug={false}
      clipToCircle={nestedCircle || clipCircle}
      includeOuterDisc={nestedCircle ? false : clipCircle}
      avatarScale={DEFAULT_SHIELD_LAYOUT.avatarScale}
      avatarOffsetX={DEFAULT_SHIELD_LAYOUT.avatarOffsetX}
      avatarOffsetY={DEFAULT_SHIELD_LAYOUT.avatarOffsetY}
      topStarScale={DEFAULT_TOP_STAR_SCALE}
    />
  );

  if (!clipCircle && !nestedCircle) {
    return (
      <span
        className="inline-flex shrink-0 items-center justify-center overflow-hidden"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`${displayName} avatar`}
      >
        {shield}
      </span>
    );
  }

  return (
    <span
      className={nestedCircle ? "flex h-full w-full shrink-0 items-center justify-center" : "inline-flex shrink-0"}
      role="img"
      aria-label={`${displayName} avatar`}
    >
      {shield}
    </span>
  );
}

function ProfileAvatarParallaxHero({
  displayName,
  userId,
  role,
  size,
}: {
  displayName: string;
  userId: string;
  role?: UserRole;
  size: number;
}) {
  const p = HERO_PROFILE_PARALLAX_PARAMS;
  const isAdmin = role === "admin";

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
      transformOrigin: isAdmin ? "50% 50%" : "50% 48%",
      transformStyle: "preserve-3d",
      transition: tracking
        ? "none"
        : `transform ${p.transitionMs}ms ${p.easing}, box-shadow ${p.transitionMs}ms ${p.easing}`,
      boxShadow: shadow,
      willChange: "transform",
    }),
    [transform, isAdmin, tracking, p.transitionMs, p.easing, shadow],
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
          {isAdmin ? (
            <div className="pointer-events-none inline-flex" style={artLayerStyle}>
              <AdminAvatarCircle size={avatarPx} includeOuterDisc={false} clipToCircle={false} />
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
