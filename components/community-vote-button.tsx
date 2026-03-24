"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { cn } from "@/lib/utils";

export function CommunityVoteButton({
  initialHasUpvoted,
  initialUpvotesCount,
  postId,
}: {
  initialHasUpvoted: boolean;
  initialUpvotesCount: number;
  postId: string;
}) {
  const router = useRouter();
  const [hasUpvoted, setHasUpvoted] = useState(initialHasUpvoted);
  const [upvotesCount, setUpvotesCount] = useState(initialUpvotesCount);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const nextHasUpvoted = !hasUpvoted;
      const nextUpvotesCount = Math.max(0, upvotesCount + (nextHasUpvoted ? 1 : -1));

      setHasUpvoted(nextHasUpvoted);
      setUpvotesCount(nextUpvotesCount);

      try {
        const response = await fetch(`/api/community/posts/${postId}/vote`, {
          method: "POST",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to toggle vote.");
        }

        const payload = (await response.json()) as {
          upvotesCount?: number;
          viewerHasUpvoted?: boolean;
        };

        setHasUpvoted(Boolean(payload.viewerHasUpvoted));
        setUpvotesCount(typeof payload.upvotesCount === "number" ? payload.upvotesCount : nextUpvotesCount);
        router.refresh();
      } catch {
        setHasUpvoted(!nextHasUpvoted);
        setUpvotesCount(upvotesCount);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-[18px] px-3 text-[14px] font-medium transition",
        hasUpvoted
          ? "bg-[#242424] text-white"
          : "bg-[rgba(228,228,228,0.8)] text-[#6f6f6f] hover:bg-[rgba(228,228,228,0.95)] hover:text-[#242424]",
      )}
    >
      ↑ {upvotesCount}
    </button>
  );
}
