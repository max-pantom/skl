"use client";

import Link from "next/link";
import { useState } from "react";

import { ProfileSkillRow } from "@/components/profile-skill-row";
import type { SkillListItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "all" | "starred";

export function ProfileSkillsPanel({
  authoredSkills,
  starredSkills,
  isOwnProfile,
}: {
  authoredSkills: SkillListItem[];
  starredSkills: SkillListItem[];
  isOwnProfile: boolean;
}) {
  const [tab, setTab] = useState<Tab>("all");
  const list = tab === "all" ? authoredSkills : starredSkills;

  return (
    <div className="flex min-h-[calc(100dvh-15rem)] flex-1 flex-col">
      <div className="flex flex-1 flex-col">
        {list.length > 0 ? (
          <div className="flex flex-col gap-6">
            {list.map((skill) => (
              <ProfileSkillRow key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
            {tab === "starred" ? (
              <p className="text-[16px] font-medium text-[#8f8f8f]">No stared skills yet</p>
            ) : isOwnProfile ? (
              <p className="text-[16px] font-medium text-[#8f8f8f]">
                No skills yet.{" "}
                <Link href="/new" className="font-semibold text-[#242424] underline decoration-dotted underline-offset-4">
                  Create
                </Link>
              </p>
            ) : (
              <p className="text-[16px] font-medium text-[#8f8f8f]">No skills yet</p>
            )}
          </div>
        )}
      </div>

      <nav
        className="mt-auto flex justify-center gap-9 pb-[14px] pt-12 text-[16px] uppercase"
        aria-label="Profile skill filters"
      >
        <button
          type="button"
          aria-pressed={tab === "all"}
          onClick={() => setTab("all")}
          className={cn("font-medium transition", tab === "all" ? "text-black" : "text-[#8f8f8f] hover:text-zinc-600")}
        >
          All skill
        </button>
        <button
          type="button"
          aria-pressed={tab === "starred"}
          onClick={() => setTab("starred")}
          className={cn("font-medium transition", tab === "starred" ? "text-black" : "text-[#8f8f8f] hover:text-zinc-600")}
        >
          Stared
        </button>
      </nav>
    </div>
  );
}
