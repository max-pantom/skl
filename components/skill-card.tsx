import Link from "next/link";

import { TagList } from "@/components/tag-list";
import type { SkillListItem } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export function SkillCard({ skill }: { skill: SkillListItem }) {
  return (
    <article className="skl-surface group transition-colors hover:border-zinc-400">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">{skill.category}</span>
            <span className="text-zinc-300">·</span>
            <span className="font-mono text-xs text-zinc-600">v{skill.currentVersion.version}</span>
          </div>
          <Link href={`/s/${skill.slug}`} className="block">
            <h3 className="text-lg font-semibold tracking-tight text-ink group-hover:underline group-hover:decoration-zinc-400 group-hover:underline-offset-4">
              {skill.title}
            </h3>
          </Link>
          <p className="max-w-2xl text-sm leading-6 text-zinc-600">{skill.summary}</p>
          <TagList tags={skill.tags} />
          {skill.forkedFrom ? (
            <p className="text-xs text-zinc-500">
              Fork of{" "}
              <Link href={`/s/${skill.forkedFrom.slug}`} className="text-ink underline decoration-zinc-300 underline-offset-2">
                {skill.forkedFrom.title}
              </Link>{" "}
              · {skill.forkedFrom.author.displayName}
            </p>
          ) : null}
        </div>
      </div>

      <div className="skl-divider flex flex-col gap-3 px-5 py-4 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link href={`/u/${skill.author.username}`} className="font-medium text-ink">
            @{skill.author.username}
          </Link>
          <span className="text-zinc-400">{skill.author.displayName}</span>
          <span className="text-zinc-400">·</span>
          <span className="text-zinc-500">{formatDate(skill.updatedAt)}</span>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
          <span>{formatNumber(skill.starsCount)} stars</span>
          <span>{formatNumber(skill.downloadsCount)} dl</span>
          <span>{formatNumber(skill.forksCount)} forks</span>
        </div>
      </div>
    </article>
  );
}
