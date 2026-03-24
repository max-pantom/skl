"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function SkillStarButton({
  initialStarred,
  initialStarsCount,
  skillSlug,
}: {
  initialStarred: boolean;
  initialStarsCount: number;
  skillSlug: string;
}) {
  const router = useRouter();
  const [starred, setStarred] = useState(initialStarred);
  const [starsCount, setStarsCount] = useState(initialStarsCount);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const nextStarred = !starred;
      const nextStarsCount = Math.max(0, starsCount + (nextStarred ? 1 : -1));
      setStarred(nextStarred);
      setStarsCount(nextStarsCount);

      try {
        const response = await fetch(`/api/skills/${skillSlug}/star`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to toggle star.");
        }

        const payload = (await response.json()) as { starred?: boolean; starsCount?: number };
        setStarred(Boolean(payload.starred));
        setStarsCount(typeof payload.starsCount === "number" ? payload.starsCount : nextStarsCount);
        router.refresh();
      } catch {
        setStarred(!nextStarred);
        setStarsCount(starsCount);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className="skl-btn skl-btn-secondary w-full justify-center"
    >
      {isPending ? "Updating…" : `${starred ? "Unstar" : "Star"} (${starsCount})`}
    </button>
  );
}
