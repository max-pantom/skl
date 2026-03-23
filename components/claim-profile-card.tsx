"use client";

import { useState } from "react";

import { ProfileAvatar } from "@/components/profile-avatar";
import type { UserRole } from "@/lib/types";

export function ClaimProfileCard({
  cardDownloadUrl,
  displayName,
  email,
  profileUrl,
  role,
  userId,
  username,
}: {
  cardDownloadUrl: string;
  displayName: string;
  email: string | null;
  profileUrl: string;
  role: UserRole;
  userId: string;
  username: string;
}) {
  const [message, setMessage] = useState<string | null>(null);

  async function shareCard() {
    setMessage(null);

    if (navigator.share) {
      try {
        await navigator.share({
          text: `Meet ${displayName} on SKL.`,
          title: `${displayName} on SKL`,
          url: profileUrl,
        });
        setMessage("Shared.");
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(profileUrl);
    setMessage("Profile link copied.");
  }

  async function copyCardLink() {
    await navigator.clipboard.writeText(profileUrl);
    setMessage("Profile link copied.");
  }

  return (
    <div className="mx-auto w-full max-w-[840px] space-y-6">
      <article className="overflow-hidden rounded-[36px] border border-zinc-200 bg-[linear-gradient(145deg,#ffffff,rgba(244,244,240,0.98))] shadow-[0_20px_80px_rgba(36,36,36,0.08)]">
        <div className="grid gap-8 p-6 sm:grid-cols-[160px_minmax(0,1fr)] sm:p-8">
          <div className="flex justify-center sm:justify-start">
            <div className="rounded-[28px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.98),rgba(235,235,230,0.95))] p-4 shadow-[inset_0_0_0_1px_rgba(36,36,36,0.06)]">
              <ProfileAvatar
                avatarUrl={null}
                displayName={displayName}
                parallax={false}
                role={role}
                size={128}
                userId={userId}
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[13px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
                Email verified
              </div>
              <div className="space-y-2">
                <h2 className="text-[34px] font-semibold leading-none text-[#242424] sm:text-[42px]">
                  {displayName}
                </h2>
                <p className="text-[18px] font-medium text-[#8f8f8f]">@{username}</p>
                {email ? <p className="text-[15px] font-medium text-[#242424]/55">{email}</p> : null}
              </div>
            </div>

            <div className="rounded-[24px] border border-zinc-200 bg-white/80 p-4 text-[15px] font-medium leading-6 text-[#242424]/70">
              Your generated SKL avatar is locked in. Save this card or share your profile URL while the claim is fresh.
            </div>
          </div>
        </div>
      </article>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={shareCard} className="skl-btn skl-btn-primary">
          Share profile
        </button>
        <a href={cardDownloadUrl} download={`${username}-skl-card.svg`} className="skl-btn skl-btn-secondary">
          Save card
        </a>
        <button type="button" onClick={copyCardLink} className="skl-btn skl-btn-secondary">
          Copy link
        </button>
      </div>

      {message ? <p className="text-[15px] font-medium text-[#8f8f8f]">{message}</p> : null}
    </div>
  );
}
