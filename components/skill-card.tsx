import Link from "next/link";

import { IconMetricDownload } from "@/components/profile-metric-icons";
import {
  profileSkillMobileCardClass,
  profileSkillMobileCategoryPillClass,
  profileSkillMobileMetricMutedClass,
  profileSkillMobileRowHoverClass,
  profileSkillMobileSummaryClass,
  profileSkillMobileTitleClass,
} from "@/components/profile-skill-row";
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
        "group relative sm:py-6",
        dividers && "border-b border-zinc-200 max-sm:border-0 max-sm:pb-0",
      )}
    >
      {/* Mobile — same card pattern as profile {@link ProfileSkillRow}; author link works (no full-card overlay). */}
      <div className={cn(profileSkillMobileCardClass, profileSkillMobileRowHoverClass)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="text-left text-[16px] font-medium tabular-nums text-[#242424]/50">
              v{skill.currentVersion.version}
            </div>
            <span className={profileSkillMobileCategoryPillClass}>{skill.category}</span>
          </div>
          <div className={cn("flex items-center gap-1.5", profileSkillMobileMetricMutedClass)}>
            <IconMetricDownload className="size-[18px] shrink-0" />
            <span>{formatNumber(skill.downloadsCount)}</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <Link href={`/s/${skill.slug}`} className={profileSkillMobileTitleClass}>
            {skill.title}
          </Link>
          <p className={profileSkillMobileSummaryClass}>{skill.summary}</p>
          {skill.tags.length ? <TagList tags={skill.tags} /> : null}
          {skill.forkedFrom ? (
            <p className="text-[14px] font-medium text-[#8f8f8f]">
              Fork of {skill.forkedFrom.title} · {skill.forkedFrom.author.displayName}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[14px] font-medium text-[#8f8f8f]">
            <Link href={`/u/${skill.author.username}`} className="profile-link">
              @{skill.author.username}
            </Link>
            <span aria-hidden>·</span>
            <span>{formatDate(skill.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="relative hidden px-0 sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-8 sm:px-2">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[16px] font-medium text-[#8f8f8f]">v{skill.currentVersion.version}</span>
            <span className="profile-pill">{skill.category}</span>
          </div>
          <Link href={`/s/${skill.slug}`} className="relative z-10 min-w-0">
            <h3 className="truncate text-[16px] font-semibold text-[#242424] transition-opacity group-hover:opacity-90">
              {skill.title}
            </h3>
          </Link>
          <p className="max-w-2xl text-[16px] font-medium leading-[1.2] text-[#242424] opacity-80">{skill.summary}</p>
          <TagList tags={skill.tags} />
          {skill.forkedFrom ? (
            <p className="text-[14px] font-medium text-[#8f8f8f]">
              Fork of{" "}
              <Link href={`/s/${skill.forkedFrom.slug}`} className="relative z-10 profile-link">
                {skill.forkedFrom.title}
              </Link>{" "}
              · {skill.forkedFrom.author.displayName}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3 text-[16px] font-medium text-[#8f8f8f]">
          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link href={`/u/${skill.author.username}`} className="relative z-10 profile-link">
              @{skill.author.username}
            </Link>
            <span>{skill.author.displayName}</span>
            <span>{formatDate(skill.updatedAt)}</span>
          </div>
          <div className="flex flex-wrap justify-end gap-4 text-[16px] font-medium text-[#8f8f8f]">
            <span>{formatNumber(skill.starsCount)} stars</span>
            <span>{formatNumber(skill.downloadsCount)} dl</span>
            <span>{formatNumber(skill.forksCount)} forks</span>
          </div>
        </div>
      </div>
    </article>
  );
}
