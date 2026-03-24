"use client";

import { useState, useTransition } from "react";

export function SkillStarButton({
  initialStarred,
  skillSlug,
}: {
  initialStarred: boolean;
  skillSlug: string;
}) {
  const [starred, setStarred] = useState(initialStarred);
  const [isPending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      const nextStarred = !starred;
      setStarred(nextStarred);

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

        const payload = (await response.json()) as { starred?: boolean };
        setStarred(Boolean(payload.starred));
      } catch {
        setStarred(!nextStarred);
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
      {isPending ? "Updating…" : starred ? "Unstar" : "Star"}
    </button>
  );
}
