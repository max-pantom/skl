import Link from "next/link";

import type { SkillListItem } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

export function ProfileSkillRow({ skill }: { skill: SkillListItem }) {
  return (
    <article className="border-t border-zinc-200 py-4 first:border-t dark:border-zinc-800">
      <div className="grid gap-3 text-sm sm:grid-cols-[160px_minmax(0,1fr)_112px_80px_88px] sm:items-center sm:gap-4">
        <div className="min-w-0">
          <Link
            href={`/s/${skill.slug}`}
            className="font-medium text-ink transition hover:opacity-70"
          >
            {skill.title}
          </Link>
        </div>

        <div className="min-w-0 text-zinc-600 dark:text-zinc-300">
          <p className="truncate sm:pr-4">{skill.summary}</p>
        </div>

        <div className="flex sm:justify-start">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-500 dark:bg-zinc-900 dark:text-zinc-300">
            {skill.category}
          </span>
        </div>

        <div className="font-medium text-zinc-500 dark:text-zinc-300">
          {formatNumber(skill.downloadsCount)}
        </div>

        <div className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
          v{skill.currentVersion.version}
        </div>
      </div>
    </article>
  );
}
