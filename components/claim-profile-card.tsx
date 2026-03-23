"use client";

import { useState } from "react";

import { ClaimPassportRecentCluster } from "@/components/claim-passport-recent-cluster";
import { MemberIdCard } from "@/components/member-id-card";
import type { RecentPassportClaimant, UserRole } from "@/lib/types";

function buildMemberCardPlainText(input: {
  displayName: string;
  username: string;
  earlyBelieverRank: number | null;
  footerDate: string;
  passportUrl: string;
}) {
  const lines: string[] = [];
  if (input.earlyBelieverRank != null) {
    lines.push(`#${input.earlyBelieverRank} of users`);
  }
  const primary = input.displayName.trim().split(/\s+/)[0] || input.displayName;
  lines.push(primary);
  lines.push(`@${input.username}`);
  lines.push(input.footerDate);
  lines.push(input.passportUrl);
  return lines.join("\n");
}

export function ClaimProfileCard({
  avatarUrl,
  cardDownloadUrl,
  displayName,
  passportUrl,
  profileUrl,
  recentPassportClaimants,
  role,
  userId,
  username,
  earlyBelieverRank,
  footerDate,
}: {
  avatarUrl: string | null;
  cardDownloadUrl: string;
  displayName: string;
  passportUrl: string;
  profileUrl: string;
  recentPassportClaimants: RecentPassportClaimant[];
  role: UserRole;
  userId: string;
  username: string;
  earlyBelieverRank: number | null;
  footerDate: string;
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function shareCard() {
    setMessage(null);

    try {
      const response = await fetch(cardDownloadUrl);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], `${username}-skl-card.png`, { type: "image/png" });

        if (navigator.share && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
          await navigator.share({
          files: [file],
          title: `${displayName} Passport`,
          text: `Passport for ${displayName} on SKL.`,
          });
          setMessage("Shared.");
          return;
        }
      }
    } catch {
      // fall through to URL share / clipboard fallback
    }

    if (navigator.share) {
      try {
        await navigator.share({
          text: `Passport for ${displayName} on SKL.`,
          title: `${displayName} Passport`,
          url: passportUrl,
        });
        setMessage("Shared.");
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(passportUrl);
    setMessage("Passport link copied.");
  }

  async function copyCardContents() {
    setMessage(null);
    const text = buildMemberCardPlainText({
      displayName,
      username,
      earlyBelieverRank,
      footerDate,
      passportUrl,
    });
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Card contents copied.");
    } catch {
      setMessage("Could not copy — try again or copy manually.");
    }
  }

  const pillBtn =
    "flex h-[43px] min-w-0 flex-1 items-center justify-center rounded-[18px] bg-[#e4e4e4] px-3 text-[16px] font-medium text-[rgba(36,36,36,0.5)] transition hover:bg-[#dadada] hover:text-[#242424] sm:px-4";

  return (
    <div className="mx-auto flex w-full max-w-[367px] flex-col gap-12">
      <ClaimPassportRecentCluster claimants={recentPassportClaimants} />
      <MemberIdCard
        avatarUrl={avatarUrl}
        displayName={displayName}
        earlyBelieverRank={earlyBelieverRank}
        footerDate={footerDate}
        role={role}
        userId={userId}
      />

      <div className="flex w-full flex-wrap gap-3">
        <a
          href={cardDownloadUrl}
          download={`${username}-skl-card.png`}
          className={pillBtn}
        >
          Download
        </a>
        <button type="button" onClick={() => void shareCard()} className={pillBtn}>
          Share
        </button>
        <button type="button" onClick={() => void copyCardContents()} className={pillBtn}>
          Copy
        </button>
      </div>

      {message ? <p className="text-center text-[15px] font-medium text-[#8f8f8f]">{message}</p> : null}
    </div>
  );
}
