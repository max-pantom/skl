"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { ClaimProgressDots } from "@/components/claim-progress-dots";
import { ProfileAvatar } from "@/components/profile-avatar";
import type { RecentPassportClaimant } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Studio frame `1655:2226` — absolute positions on artboard (px), largest = front:
 * 30@ (1452,902), 20@ (1440,930), 15@ (1477,936), 11@ (1462,951). Origin (1440,902), bbox 52×60.
 * Scaled ×2.4 so the lead avatar matches the prior ~72px target and tap targets stay usable.
 */
const FIG = 2.4;
const SLOTS = [
  { size: Math.round(30 * FIG), left: Math.round(12 * FIG), top: Math.round(0 * FIG) },
  { size: Math.round(20 * FIG), left: Math.round(0 * FIG), top: Math.round(28 * FIG) },
  { size: Math.round(15 * FIG), left: Math.round(37 * FIG), top: Math.round(34 * FIG) },
  { size: Math.round(11 * FIG), left: Math.round(22 * FIG), top: Math.round(49 * FIG) },
] as const;

const CLUSTER_W = Math.round(52 * FIG);
const CLUSTER_H = Math.round(60 * FIG);

/** Shrinks the whole pile (layout unchanged); transform applied in dock. */
export const CLAIM_RECENT_CLUSTER_GROUP_SCALE = 0.58;

export function ClaimPassportRecentCluster({
  claimants,
  className,
}: {
  claimants: RecentPassportClaimant[];
  /** Default `mx-auto` for centered column layouts; use `mx-0` in fixed docks. */
  className?: string;
}) {
  const slice = claimants.slice(0, SLOTS.length);
  const rootRef = useRef<HTMLDivElement>(null);
  const spinFrameRef = useRef<number | null>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0);
  const dragStartAngleRef = useRef(0);
  const dragStartRotationRef = useRef(0);
  const lastPointerAngleRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const movedRef = useRef(false);
  const [rotationDeg, setRotationDeg] = useState(0);

  const stopSpin = useCallback(() => {
    if (spinFrameRef.current != null) {
      cancelAnimationFrame(spinFrameRef.current);
      spinFrameRef.current = null;
    }
  }, []);

  useEffect(() => () => stopSpin(), [stopSpin]);

  if (!slice.length) {
    return null;
  }

  function pointerAngle(clientX: number, clientY: number) {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect) {
      return 0;
    }

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
  }

  function startInertia() {
    stopSpin();

    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(32, now - last);
      last = now;
      velocityRef.current *= 0.965;

      if (Math.abs(velocityRef.current) < 0.015) {
        spinFrameRef.current = null;
        return;
      }

      angleRef.current += velocityRef.current * dt;
      setRotationDeg(angleRef.current);
      spinFrameRef.current = requestAnimationFrame(tick);
    };

    spinFrameRef.current = requestAnimationFrame(tick);
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    stopSpin();
    movedRef.current = false;
    dragStartAngleRef.current = pointerAngle(event.clientX, event.clientY);
    dragStartRotationRef.current = angleRef.current;
    lastPointerAngleRef.current = dragStartAngleRef.current;
    lastPointerTimeRef.current = performance.now();
    velocityRef.current = 0;
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      return;
    }

    const nextPointerAngle = pointerAngle(event.clientX, event.clientY);
    const deltaFromStart = nextPointerAngle - dragStartAngleRef.current;
    const nextRotation = dragStartRotationRef.current + deltaFromStart;
    const now = performance.now();
    const dt = Math.max(1, now - lastPointerTimeRef.current);
    const pointerDelta = nextPointerAngle - lastPointerAngleRef.current;

    if (Math.abs(deltaFromStart) > 3) {
      movedRef.current = true;
    }

    velocityRef.current = pointerDelta / dt;
    angleRef.current = nextRotation;
    setRotationDeg(nextRotation);
    lastPointerAngleRef.current = nextPointerAngle;
    lastPointerTimeRef.current = now;
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (!movedRef.current) {
      velocityRef.current = 0.42;
    }

    startInertia();
    window.setTimeout(() => {
      movedRef.current = false;
    }, 80);
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative shrink-0", className ?? "mx-auto")}
      style={{
        width: CLUSTER_W,
        height: CLUSTER_H,
        transform: `rotate(${rotationDeg}deg)`,
        transformOrigin: "50% 50%",
        touchAction: "none",
      }}
      role="list"
      aria-label="Recently joined members"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {slice.map((c, i) => {
        const slot = SLOTS[i];
        if (!slot) {
          return null;
        }
        return (
          <Link
            key={c.id}
            href={`/u/${c.username}`}
            className="absolute flex overflow-hidden rounded-full bg-[#e8e8e8] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] transition hover:ring-black/12"
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.size,
              height: slot.size,
              zIndex: SLOTS.length - i,
            }}
            title={`@${c.username}`}
            aria-label={`${c.displayName} (@${c.username})`}
            role="listitem"
            onClick={(event) => {
              if (movedRef.current) {
                event.preventDefault();
              }
            }}
          >
            <ProfileAvatar
              avatarUrl={c.avatarUrl}
              displayName={c.displayName}
              nestedCircle
              userId={c.id}
              role={c.role}
              size={slot.size}
            />
          </Link>
        );
      })}
    </div>
  );
}

/** Bottom bar: progress dots (left) + scaled recent cluster (right). Passport: omit `progressStep` to only show cluster. */
export function ClaimVerifiedBottomDock({
  claimants,
  progressStep,
}: {
  claimants: RecentPassportClaimant[];
  progressStep?: 1 | 2 | 3;
}) {
  const hasCluster = claimants.length > 0;
  const hasProgress = progressStep != null;

  if (!hasCluster && !hasProgress) {
    return null;
  }

  const justify =
    hasProgress && hasCluster ? "justify-between" : hasProgress ? "justify-start" : "justify-end";

  return (
    <div
      className={`pointer-events-none fixed bottom-3 left-4 right-4 z-30 flex items-center gap-2.5 sm:bottom-8 sm:left-6 sm:right-6 sm:gap-3 ${justify}`}
    >
      {hasProgress ? (
        <div className="pointer-events-auto shrink-0">
          <ClaimProgressDots variant="dock" step={progressStep} />
        </div>
      ) : null}
      {hasCluster ? (
        <div
          className="pointer-events-auto shrink-0 sm:scale-[1.1034]"
          style={{
            transform: `scale(${CLAIM_RECENT_CLUSTER_GROUP_SCALE})`,
            transformOrigin: "100% 100%",
          }}
        >
          <ClaimPassportRecentCluster claimants={claimants} className="mx-0" />
        </div>
      ) : null}
    </div>
  );
}
