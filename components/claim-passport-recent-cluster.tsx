"use client";

import Link from "next/link";

import { ProfileAvatar } from "@/components/profile-avatar";
import type { RecentPassportClaimant } from "@/lib/types";

/**
 * Studio 1655:2226 — four overlapping circles; index 0 is newest (largest), 3 is fourth back (smallest).
 * Positions/sizes scaled 2× from Figma for clarity on web.
 */
const SLOTS = [
  { size: 60, left: 24, top: 0 },
  { size: 40, left: 0, top: 56 },
  { size: 30, left: 74, top: 68 },
  { size: 22, left: 44, top: 98 },
] as const;

export function ClaimPassportRecentCluster({ claimants }: { claimants: RecentPassportClaimant[] }) {
  if (!claimants.length) {
    return null;
  }

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: 104, height: 120 }}
      role="list"
      aria-label="Recently verified passports"
    >
      {claimants.map((c, i) => {
        const slot = SLOTS[i];
        if (!slot) {
          return null;
        }
        const inner = Math.max(16, Math.floor(slot.size * 0.92));
        return (
          <Link
            key={c.id}
            href={`/u/${c.username}`}
            className="absolute flex items-center justify-center overflow-hidden rounded-full bg-[#efefef] shadow-[0_1px_2px_rgba(0,0,0,0.06)] ring-1 ring-black/[0.06] transition hover:ring-black/12"
            style={{
              left: slot.left,
              top: slot.top,
              width: slot.size,
              height: slot.size,
            }}
            title={`@${c.username}`}
            aria-label={`${c.displayName} (@${c.username})`}
            role="listitem"
          >
            <ProfileAvatar
              avatarUrl={c.avatarUrl}
              displayName={c.displayName}
              userId={c.id}
              role={c.role}
              size={inner}
            />
          </Link>
        );
      })}
    </div>
  );
}
