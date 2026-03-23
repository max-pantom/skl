"use client";

import Link from "next/link";
import { useState } from "react";

import { ProfileSkillRow, ProfileSkillTableRow } from "@/components/profile-skill-row";
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
  const hasList = list.length > 0;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex min-h-0 flex-col">
        {hasList ? (
          <>
            <div className="flex flex-col gap-6 sm:hidden">
              {list.map((skill) => (
                <ProfileSkillRow key={skill.id} skill={skill} />
              ))}
            </div>
            <div className="hidden w-full min-w-0 sm:block">
              <div className="flex w-full min-w-0 flex-col gap-6">
                {list.map((skill) => (
                  <ProfileSkillTableRow key={skill.id} skill={skill} />
                ))}
              </div>
            </div>
          </>
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
        className={`flex justify-center gap-9 pb-[14px] pt-12 text-[16px] uppercase ${
          hasList ? "" : "mt-6"
        }`}
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
