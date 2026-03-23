import Link from "next/link";

import { IconMetricDownload } from "@/components/profile-metric-icons";
import type { SkillListItem } from "@/lib/types";
import { cn, formatNumber } from "@/lib/utils";

const rowHover =
  "group transition-colors hover:bg-[rgba(36,36,36,0.04)] sm:hover:bg-[rgba(36,36,36,0.04)]";

/** Desktop profile skill list row — hover from Figma (Studio 1652:1867). */
const profileSkillDesktopRowClass =
  "group grid w-full min-w-[720px] grid-cols-[minmax(0,10.92%)_minmax(0,1fr)_7rem_5.5rem_4rem] items-center gap-x-9 rounded-[12px] py-1.5 text-[16px] text-[#242424] transition-colors hover:bg-[#efefef]";

/** Shared with {@link SkillCard} so registry lists match profile mobile cards. */
export const profileSkillMobileRowHoverClass = rowHover;

export const profileSkillMobileTitleClass =
  "block min-w-0 truncate text-[16px] font-semibold text-[#242424] transition-colors group-hover:text-[#242424] group-hover:opacity-90";

export const profileSkillMobileSummaryClass =
  "truncate text-left text-[16px] font-medium text-[#242424] opacity-80 transition-colors group-hover:opacity-100";

const summaryClass = profileSkillMobileSummaryClass;

export const profileSkillMobileMetricMutedClass =
  "text-[16px] font-medium tabular-nums text-[#919191] transition-colors group-hover:text-[#7a7a7a]";

const metricMuted = profileSkillMobileMetricMutedClass;

export const profileSkillMobileCategoryPillClass =
  "inline-flex rounded-[90px] bg-[rgba(228,228,228,0.8)] px-[6px] py-[2px] text-base font-medium leading-none text-[#8f8f8f] transition-colors group-hover:bg-[rgba(228,228,228,0.95)]";

export const profileSkillMobileCardClass =
  "grid grid-cols-1 gap-3 rounded-[22px] px-3 py-3 text-[16px] text-[#242424] sm:hidden";

const versionClass =
  "text-right text-[16px] font-medium tabular-nums text-[#242424]/50 transition-colors group-hover:text-[#242424]/60";

const titleLinkClass = profileSkillMobileTitleClass;

/** Stacked layout — mobile and fallback. */
export function ProfileSkillRow({ skill }: { skill: SkillListItem }) {
  return (
    <Link
      href={`/s/${skill.slug}`}
      className={cn(profileSkillMobileCardClass, profileSkillMobileRowHoverClass)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="text-left text-[16px] font-medium tabular-nums text-[#242424]/50">v{skill.currentVersion.version}</div>
          <span className={profileSkillMobileCategoryPillClass}>{skill.category}</span>
        </div>
        <div className={cn("flex items-center gap-1.5", metricMuted)}>
          <IconMetricDownload className="size-[18px] shrink-0" />
          <span>{formatNumber(skill.downloadsCount)}</span>
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-3">
        <div className="min-w-0">
          <span className={titleLinkClass}>{skill.title}</span>
        </div>
        <div className="min-w-0">
          <p className={summaryClass}>{skill.summary}</p>
        </div>
      </div>
    </Link>
  );
}

/** One row in the profile skills list (desktop grid) — columns align with every other skill. */
export function ProfileSkillTableRow({ skill }: { skill: SkillListItem }) {
  return (
    <div className={profileSkillDesktopRowClass}>
      <div className="min-w-0">
        <Link href={`/s/${skill.slug}`} className={titleLinkClass}>
          {skill.title}
        </Link>
      </div>
      <div className="min-w-0 pr-2">
        <p className={summaryClass}>{skill.summary}</p>
      </div>
      <div className="whitespace-nowrap">
        <span className={profileSkillMobileCategoryPillClass}>
          {skill.category}
        </span>
      </div>
      <div className={cn("whitespace-nowrap", metricMuted)}>
        <div className="flex items-center justify-end gap-1.5">
          <IconMetricDownload className="size-[18px] shrink-0" />
          <span>{formatNumber(skill.downloadsCount)}</span>
        </div>
      </div>
      <div className={cn("whitespace-nowrap text-right", versionClass)}>
        v{skill.currentVersion.version}
      </div>
    </div>
  );
}
