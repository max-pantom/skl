import Link from "next/link";

import { IconMetricDownload } from "@/components/profile-metric-icons";
import type { SkillListItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function ProfileSkillRow({ skill }: { skill: SkillListItem }) {
  return (
    <article className="text-[16px] text-[#242424]">
      <div className="grid gap-3 sm:grid-cols-[10.92%_49.91%_max-content_max-content_4.6%] sm:items-center sm:justify-between sm:gap-x-7 sm:gap-y-0">
        <div className="min-w-0">
          <Link
            href={`/s/${skill.slug}`}
            className="text-[16px] font-semibold text-[#242424] transition hover:opacity-70"
          >
            {skill.title}
          </Link>
        </div>

        <div className="min-w-0 sm:pr-4">
          <p className="truncate text-[16px] font-medium text-[#242424] opacity-80 sm:text-center">
            {skill.summary}
          </p>
        </div>

        <div className="flex sm:justify-center">
          <span className="rounded-[90px] bg-[rgba(228,228,228,0.8)] px-[6px] py-[2px] text-base leading-none text-[#8f8f8f]">
            {skill.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[#919191] sm:justify-center">
          <IconMetricDownload className="size-[18px] shrink-0" />
          <span>{formatNumber(skill.downloadsCount)}</span>
        </div>

        <div className="text-left text-[#242424]/50 sm:text-center">
          v{skill.currentVersion.version}
        </div>
      </div>
    </article>
  );
}
