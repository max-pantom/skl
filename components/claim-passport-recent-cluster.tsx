"use client";

import Link from "next/link";

import { ProfileAvatar } from "@/components/profile-avatar";
import type { RecentPassportClaimant } from "@/lib/types";

/**
 * Studio 1655:2226 — four overlapping circles; index 0 is newest (largest), 3 is fourth back (smallest).
 * Front slot is slightly larger so the latest person’s photo (or shield) is easy to see.
 */
const SLOTS = [
  { size: 72, left: 14, top: 0 },
  { size: 44, left: 0, top: 58 },
  { size: 32, left: 80, top: 76 },
  { size: 24, left: 46, top: 110 },
] as const;

const CLUSTER_W = 112;
const CLUSTER_H = 134;

export function ClaimPassportRecentCluster({ claimants }: { claimants: RecentPassportClaimant[] }) {
  if (!claimants.length) {
    return null;
  }

  return (
    <div
      className="relative mx-auto shrink-0"
      style={{ width: CLUSTER_W, height: CLUSTER_H }}
      role="list"
      aria-label="Recently verified passports"
    >
      {claimants.map((c, i) => {
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
            }}
            title={`@${c.username}`}
            aria-label={`${c.displayName} (@${c.username})`}
            role="listitem"
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
