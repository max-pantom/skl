"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";

import { ProfileAvatar } from "@/components/profile-avatar";
import type { RecentPassportClaimant, UserRole } from "@/lib/types";
import { cn } from "@/lib/utils";

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

/** Pointer tilt on hover — gentler than hero avatar (wide card). */
const MEMBER_CARD_HOVER_PARALLAX = {
  perspective: 1100,
  maxRotateX: 7,
  maxRotateY: 10,
  tiltSensitivity: 0.88,
  transitionMs: 420,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
} as const;

export type MemberIdCardProps = {
  displayName: string;
  primaryName?: string;
  footerDate: string;
  earlyBelieverRank: number | null;
  userId: string;
  role: UserRole;
  avatarUrl: string | null;
  portraitBaseSize?: number;
  portraitScale?: number;
  portraitOffsetRight?: number;
  portraitOffsetY?: number;
  portraitOpacity?: number;
  portraitRotateDeg?: number;
  showPortrait?: boolean;
  showRank?: boolean;
  showDate?: boolean;
  rankLabelOpacity?: number;
  dateLabelOpacity?: number;
  nameFontSize?: number;
  nameOffsetX?: number;
  nameOffsetY?: number;
  nameRotateDeg?: number;
  rankBlockOffsetX?: number;
  rankBlockOffsetY?: number;
  dateOffsetX?: number;
  dateOffsetY?: number;
  minHeight?: number;
  cardBackground?: string;
  cardRadius?: number;
  shadowX?: number;
  shadowY?: number;
  shadowOpacity?: number;
  /** 3D tilt following pointer while hovered. */
  hoverParallax?: boolean;
  /** Newest-first list (e.g. {@link getRecentPassportClaimants}); shown as square thumbs bottom-right. */
  recentMembers?: RecentPassportClaimant[];
  showRecentMembers?: boolean;
  recentMembersMax?: number;
  recentMembersAvatarSize?: number;
  /** Rounded-rect radius for each thumb (px), not a circle. */
  recentMembersCornerRadius?: number;
  recentMembersOffsetRight?: number;
  recentMembersOffsetBottom?: number;
  /** Horizontal overlap between thumbs (px). */
  recentMembersOverlap?: number;
  adminPortraitClipCircle?: boolean;
  className?: string;
  "aria-label"?: string;
};

export function MemberIdCard({
  displayName,
  primaryName: primaryNameProp,
  footerDate,
  earlyBelieverRank,
  userId,
  role,
  avatarUrl,
  portraitBaseSize = 256,
  portraitScale = 2.66,
  portraitOffsetRight = -243,
  portraitOffsetY = -56,
  portraitOpacity = 1,
  portraitRotateDeg = 0,
  showPortrait = true,
  showRank = true,
  showDate = true,
  rankLabelOpacity = 0.2,
  dateLabelOpacity = 0.2,
  nameFontSize = 32,
  nameOffsetX = -22,
  nameOffsetY = -201,
  nameRotateDeg = 0,
  rankBlockOffsetX = 0,
  rankBlockOffsetY = 0,
  dateOffsetX = 0,
  dateOffsetY = 0,
  minHeight = 508,
  cardBackground = "#e4e4e4",
  cardRadius = 18,
  shadowX = 6,
  shadowY = 6,
  shadowOpacity = 0.17,
  hoverParallax = true,
  recentMembers,
  showRecentMembers = true,
  recentMembersMax = 4,
  recentMembersAvatarSize = 30,
  recentMembersCornerRadius,
  recentMembersOffsetRight = 14,
  recentMembersOffsetBottom = 14,
  recentMembersOverlap = 10,
  adminPortraitClipCircle = false,
  className = "w-full max-w-[367px]",
  "aria-label": ariaLabel,
}: MemberIdCardProps) {
  const primaryName = primaryNameProp ?? (displayName.trim().split(/\s+/)[0] || displayName);
  const showRankLine = showRank && earlyBelieverRank != null;
  const isMilestoneRank = earlyBelieverRank === 50 || earlyBelieverRank === 100;
  const rankMessage = earlyBelieverRank
    ? isMilestoneRank
      ? `You made us hit the ${earlyBelieverRank === 50 ? "50" : "100"} early-people milestone.`
      : `You are the No. ${earlyBelieverRank} account. Early believers.`
    : undefined;

  const thumbRadius = recentMembersCornerRadius ?? Math.min(8, Math.max(4, Math.round(recentMembersAvatarSize * 0.2)));

  const recentSlice = useMemo(() => {
    if (!showRecentMembers || !recentMembers?.length) {
      return [];
    }
    return recentMembers.slice(0, recentMembersMax);
  }, [recentMembers, recentMembersMax, showRecentMembers]);

  /** Oldest → newest left → right (API is newest-first). */
  const recentDisplayOrder = useMemo(() => [...recentSlice].reverse(), [recentSlice]);

  const rootRef = useRef<HTMLDivElement>(null);
  const [tracking, setTracking] = useState(false);
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);

  const p = MEMBER_CARD_HOVER_PARALLAX;
  const onMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = rootRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      const sens = p.tiltSensitivity;
      setRy(clamp(x * 2 * p.maxRotateY * sens, -p.maxRotateY * 1.2, p.maxRotateY * 1.2));
      setRx(clamp(-y * 2 * p.maxRotateX * sens, -p.maxRotateX * 1.2, p.maxRotateX * 1.2));
      setTracking(true);
    },
    [p.maxRotateX, p.maxRotateY, p.tiltSensitivity],
  );

  const onLeave = useCallback(() => {
    setRx(0);
    setRy(0);
    setTracking(false);
  }, []);

  const cardSurfaceStyle = {
    minHeight,
    backgroundColor: cardBackground,
    borderRadius: cardRadius,
    boxShadow: `${shadowX}px ${shadowY}px 0 0 rgba(0,0,0,${shadowOpacity})`,
  } as const;

  const tiltStyle = hoverParallax
    ? {
        transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
        transformStyle: "preserve-3d" as const,
        transition: tracking
          ? ("none" as const)
          : (`transform ${p.transitionMs}ms ${p.easing}` as const),
        willChange: "transform" as const,
      }
    : {};

  const content = (
    <>
      {showPortrait ? (
        <div
          className="pointer-events-none absolute z-0 select-none"
          style={{
            right: `${portraitOffsetRight}px`,
            top: "50%",
            opacity: portraitOpacity,
            transform: `translateY(calc(-50% + ${portraitOffsetY}px)) scale(${portraitScale}) rotate(${portraitRotateDeg}deg)`,
            transformOrigin: "center right",
          }}
        >
          <ProfileAvatar
            avatarUrl={avatarUrl}
            adminClipCircle={adminPortraitClipCircle}
            clipCircle={false}
            displayName={displayName}
            parallax={false}
            role={role}
            size={portraitBaseSize}
            userId={userId}
          />
        </div>
      ) : null}

      {showRankLine ? (
        <div
          className="skl-tooltip-anchor absolute z-10 flex max-w-[min(220px,55%)] flex-col gap-1"
          style={{
            left: `calc(14px + ${rankBlockOffsetX}px)`,
            top: `calc(14px + ${rankBlockOffsetY}px)`,
          }}
        >
          <p
            className="font-mono text-[12px] leading-tight text-black"
            style={{ opacity: isMilestoneRank ? 0.8 : rankLabelOpacity, color: isMilestoneRank ? "#222222" : undefined }}
            aria-label={rankMessage}
          >
            #{earlyBelieverRank} of users
          </p>
          {rankMessage ? <span className="skl-tooltip">{rankMessage}</span> : null}
        </div>
      ) : null}

      <p
        className="absolute z-10 max-w-[min(200px,52%)] truncate font-medium leading-none text-black"
        style={{
          left: `calc(36px + ${nameOffsetX}px)`,
          top: `calc(50% + ${nameOffsetY}px)`,
          fontSize: nameFontSize,
          transform: `translateY(-50%) rotate(${nameRotateDeg}deg)`,
          transformOrigin: "center left",
        }}
      >
        {primaryName}
      </p>

      {showDate ? (
        <p
          className="absolute z-10 font-mono text-[12px] text-black"
          style={{
            left: `calc(14px + ${dateOffsetX}px)`,
            bottom: `calc(14px + ${dateOffsetY}px)`,
            opacity: dateLabelOpacity,
          }}
        >
          {footerDate}
        </p>
      ) : null}

      {recentDisplayOrder.length > 0 ? (
        <div
          className="pointer-events-auto absolute z-20 flex flex-row items-end"
          style={{
            right: `${recentMembersOffsetRight}px`,
            bottom: `${recentMembersOffsetBottom}px`,
          }}
          role="list"
          aria-label="Recently joined members"
        >
          {recentDisplayOrder.map((c, i) => (
            <Link
              key={c.id}
              href={`/u/${c.username}`}
              className="relative flex shrink-0 overflow-hidden bg-[#e8e8e8] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] transition hover:ring-black/12"
              style={{
                width: recentMembersAvatarSize,
                height: recentMembersAvatarSize,
                borderRadius: thumbRadius,
                marginLeft: i > 0 ? -recentMembersOverlap : 0,
                zIndex: i + 1,
              }}
              title={`@${c.username}`}
              aria-label={`${c.displayName} (@${c.username})`}
              role="listitem"
            >
              <ProfileAvatar
                avatarUrl={c.avatarUrl}
                clipCircle={false}
                displayName={c.displayName}
                nestedCircle={false}
                role={c.role}
                size={recentMembersAvatarSize}
                userId={c.id}
              />
            </Link>
          ))}
        </div>
      ) : null}
    </>
  );

  const label = ariaLabel ?? `Member card for ${displayName}`;

  if (!hoverParallax) {
    return (
      <div
        className={cn("relative w-full overflow-hidden", className)}
        style={cardSurfaceStyle}
        aria-label={label}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className={cn("touch-none", className)}
      style={{ perspective: `${p.perspective}px`, perspectiveOrigin: "50% 50%" }}
      aria-label={label}
      onPointerLeave={onLeave}
      onPointerMove={onMove}
    >
      <div className="relative w-full overflow-hidden" style={{ ...cardSurfaceStyle, ...tiltStyle }}>
        {content}
      </div>
    </div>
  );
}
