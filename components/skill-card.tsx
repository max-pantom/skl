import Link from "next/link";

import { TagList } from "@/components/tag-list";
import type { SkillListItem } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export function SkillCard({ skill }: { skill: SkillListItem }) {
  return (
    <article className="group border-b border-zinc-200 py-6 transition-colors hover:bg-[rgba(36,36,36,0.04)]">
      <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="profile-pill">{skill.category}</span>
            <span className="text-[16px] font-medium text-[#8f8f8f]">v{skill.currentVersion.version}</span>
          </div>
          <Link href={`/s/${skill.slug}`} className="block min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-[#242424] transition-opacity group-hover:opacity-90">
              {skill.title}
            </h3>
          </Link>
          <p className="max-w-2xl text-[16px] font-medium leading-[1.2] text-[#242424] opacity-80">{skill.summary}</p>
          <TagList tags={skill.tags} />
          {skill.forkedFrom ? (
            <p className="text-[14px] font-medium text-[#8f8f8f]">
              Fork of{" "}
              <Link href={`/s/${skill.forkedFrom.slug}`} className="profile-link">
                {skill.forkedFrom.title}
              </Link>{" "}
              · {skill.forkedFrom.author.displayName}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-3 text-[16px] font-medium text-[#8f8f8f] sm:items-end">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/u/${skill.author.username}`} className="profile-link">
              @{skill.author.username}
            </Link>
            <span>{skill.author.displayName}</span>
            <span>{formatDate(skill.updatedAt)}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-[16px] font-medium text-[#8f8f8f]">
            <span>{formatNumber(skill.starsCount)} stars</span>
            <span>{formatNumber(skill.downloadsCount)} dl</span>
            <span>{formatNumber(skill.forksCount)} forks</span>
          </div>
        </div>
      </div>
    </article>
  );
}
