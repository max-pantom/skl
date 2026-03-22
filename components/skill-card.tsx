import Link from "next/link";

import { TagList } from "@/components/tag-list";
import type { SkillListItem } from "@/lib/types";
import { cn, formatDate, formatNumber } from "@/lib/utils";

export function SkillCard({
  skill,
  dividers = true,
}: {
  skill: SkillListItem;
  dividers?: boolean;
}) {
  return (
    <article
      className={cn(
        "group relative py-4 transition-colors hover:bg-[rgba(36,36,36,0.04)] sm:py-6",
        dividers && "border-b border-zinc-200",
      )}
    >
      <Link href={`/s/${skill.slug}`} className="absolute inset-0 z-10 block sm:hidden" aria-label={`Open ${skill.title}`} />
      <div className="relative flex flex-col gap-3 px-0 sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-2">
        <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-medium text-[#8f8f8f]">v{skill.currentVersion.version}</span>
            <span className="profile-pill">{skill.category}</span>
          </div>
          <Link href={`/s/${skill.slug}`} className="relative z-20 hidden min-w-0 sm:block">
            <h3 className="truncate text-[16px] font-semibold text-[#242424] transition-opacity group-hover:opacity-90">
              {skill.title}
            </h3>
          </Link>
          <h3 className="min-w-0 truncate text-[16px] font-semibold text-[#242424] sm:hidden">
            {skill.title}
          </h3>
          <p className="max-w-2xl text-[16px] font-medium leading-[1.2] text-[#242424] opacity-80">{skill.summary}</p>
          <TagList tags={skill.tags} />
          {skill.forkedFrom ? (
            <p className="text-[14px] font-medium text-[#8f8f8f]">
              <span className="sm:hidden">Fork of {skill.forkedFrom.title} · {skill.forkedFrom.author.displayName}</span>
              <span className="hidden sm:inline">
                Fork of{" "}
                <Link href={`/s/${skill.forkedFrom.slug}`} className="relative z-20 profile-link">
                  {skill.forkedFrom.title}
                </Link>{" "}
                · {skill.forkedFrom.author.displayName}
              </span>
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 text-[16px] font-medium text-[#8f8f8f] sm:items-end sm:gap-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-3">
            <span className="sm:hidden">
              @{skill.author.username} · {formatDate(skill.updatedAt)}
            </span>
            <Link href={`/u/${skill.author.username}`} className="relative z-20 hidden profile-link sm:inline-flex">
              @{skill.author.username}
            </Link>
            <span className="hidden sm:inline">{skill.author.displayName}</span>
            <span className="hidden sm:inline">{formatDate(skill.updatedAt)}</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[16px] font-medium text-[#8f8f8f] sm:gap-4">
            <span>{formatNumber(skill.starsCount)} stars</span>
            <span>{formatNumber(skill.downloadsCount)} dl</span>
            <span>{formatNumber(skill.forksCount)} forks</span>
          </div>
        </div>
      </div>
    </article>
  );
}
