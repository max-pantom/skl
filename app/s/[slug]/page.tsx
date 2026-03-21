import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyRawButton } from "@/components/copy-raw-button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TagList } from "@/components/tag-list";
import { getSkillBySlug } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

type SkillPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    return {
      title: "Skill not found",
    };
  }

  return {
    title: skill.title,
    description: skill.summary,
  };
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-8">
        <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-card sm:p-10">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">{skill.category}</p>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{skill.title}</h1>
                <p className="max-w-3xl text-base leading-8 text-slate-600">{skill.summary}</p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Link href={`/u/${skill.author.username}`} className="font-medium text-ink">
                  {skill.author.displayName}
                </Link>
                <span>@{skill.author.username}</span>
                <span>Updated {formatDate(skill.updatedAt)}</span>
              </div>
            </div>

            <TagList tags={skill.tags} />

            {skill.forkedFrom ? (
              <div className="rounded-[1.25rem] border border-stone-300 bg-white p-4 text-sm text-slate-600">
                Forked from{" "}
                <Link href={`/s/${skill.forkedFrom.slug}`} className="font-medium text-accent underline underline-offset-4">
                  {skill.forkedFrom.title}
                </Link>{" "}
                by {skill.forkedFrom.author.displayName}
              </div>
            ) : null}
          </div>
        </div>

        <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-card sm:p-10">
          <MarkdownRenderer content={skill.currentVersion.content} />
        </div>
      </section>

      <aside className="space-y-5">
        <section className="rounded-[1.75rem] border border-line bg-panel p-6 shadow-card">
          <div className="space-y-3">
            <button
              type="button"
              disabled
              className="w-full rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm text-slate-500"
            >
              Star action lands in next phase
            </button>
            <button
              type="button"
              disabled
              className="w-full rounded-full border border-stone-300 bg-stone-100 px-4 py-2 text-sm text-slate-500"
            >
              Fork action lands in next phase
            </button>
            <Link
              href={`/api/skills/${skill.slug}/raw`}
              className="block w-full rounded-full border border-ink bg-ink px-4 py-2 text-center text-sm font-medium text-shell transition hover:bg-slate-900"
            >
              Download raw skill
            </Link>
            <CopyRawButton content={skill.currentVersion.content} />
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-line bg-panel p-6 shadow-card">
          <div className="space-y-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Compatible with</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {skill.currentVersion.compatibleWith.map((entry) => (
                  <span
                    key={entry}
                    className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="rounded-[1.25rem] border border-stone-300 bg-white p-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Version</p>
                <p className="mt-2 text-lg font-semibold text-ink">{skill.currentVersion.version}</p>
              </div>
              <div className="rounded-[1.25rem] border border-stone-300 bg-white p-4">
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Published</p>
                <p className="mt-2 text-lg font-semibold text-ink">{formatDate(skill.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-[1.25rem] border border-stone-300 bg-white p-4 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Stars</p>
                <p className="mt-2 text-xl font-semibold text-ink">{formatNumber(skill.starsCount)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-stone-300 bg-white p-4 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Forks</p>
                <p className="mt-2 text-xl font-semibold text-ink">{formatNumber(skill.forksCount)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-stone-300 bg-white p-4 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-slate-500">Downloads</p>
                <p className="mt-2 text-xl font-semibold text-ink">{formatNumber(skill.downloadsCount)}</p>
              </div>
            </div>

            <Link
              href={`/s/${skill.slug}/versions`}
              className="block rounded-full border border-stone-300 bg-white px-4 py-2 text-center text-sm font-medium text-ink transition hover:border-ink"
            >
              View version history
            </Link>
          </div>
        </section>
      </aside>
    </div>
  );
}

