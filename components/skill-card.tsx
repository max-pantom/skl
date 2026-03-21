import Link from "next/link";

import { TagList } from "@/components/tag-list";
import type { SkillListItem } from "@/lib/types";
import { formatDate, formatNumber } from "@/lib/utils";

export function SkillCard({ skill }: { skill: SkillListItem }) {
  return (
    <article className="group rounded-[1.5rem] border border-line bg-panel p-6 shadow-card transition hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
              {skill.category}
            </p>
            <Link href={`/s/${skill.slug}`} className="block">
              <h3 className="text-xl font-semibold tracking-tight text-ink transition group-hover:text-accent">
                {skill.title}
              </h3>
            </Link>
            <p className="max-w-xl text-sm leading-6 text-slate-600">{skill.summary}</p>
          </div>

          <TagList tags={skill.tags} />

          {skill.forkedFrom ? (
            <p className="text-xs text-slate-500">
              Forked from{" "}
              <Link href={`/s/${skill.forkedFrom.slug}`} className="text-accent underline underline-offset-4">
                {skill.forkedFrom.title}
              </Link>{" "}
              by {skill.forkedFrom.author.displayName}
            </p>
          ) : null}
        </div>

        <div className="rounded-2xl border border-stone-300 bg-white px-3 py-2 text-right">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Version</p>
          <p className="mt-1 text-sm font-semibold text-ink">{skill.currentVersion.version}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-line pt-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/u/${skill.author.username}`} className="font-medium text-ink">
            @{skill.author.username}
          </Link>
          <span>{skill.author.displayName}</span>
          <span>Updated {formatDate(skill.updatedAt)}</span>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
          <span>{formatNumber(skill.starsCount)} stars</span>
          <span>{formatNumber(skill.downloadsCount)} downloads</span>
          <span>{formatNumber(skill.forksCount)} forks</span>
        </div>
      </div>
    </article>
  );
}

