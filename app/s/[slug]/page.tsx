import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyRawButton } from "@/components/copy-raw-button";
import { FormNotice } from "@/components/form-notice";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { TagList } from "@/components/tag-list";
import { forkSkillAction, toggleStarAction } from "@/lib/actions";
import { getCurrentViewer, isAppConfigured } from "@/lib/auth";
import { getSkillBySlug, hasUserStarredSkill } from "@/lib/data";
import { formatDate, formatNumber } from "@/lib/utils";

type SkillPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
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

export default async function SkillPage({ params, searchParams }: SkillPageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const viewer = await getCurrentViewer();
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  const viewerHasStarred = viewer ? await hasUserStarredSkill(viewer.id, skill.id) : false;
  const canEdit = viewer?.id === skill.author.id;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="space-y-6">
        {query.error ? <FormNotice tone="error">{query.error}</FormNotice> : null}
        {query.message ? <FormNotice tone="success">{query.message}</FormNotice> : null}

        <div className="skl-surface p-6 sm:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-500">{skill.category}</p>
              <div className="space-y-3">
                <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{skill.title}</h1>
                <p className="max-w-3xl text-sm leading-7 text-zinc-600 sm:text-base sm:leading-8">{skill.summary}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-zinc-600">
                <Link href={`/u/${skill.author.username}`} className="font-medium text-ink">
                  {skill.author.displayName}
                </Link>
                <span className="text-zinc-300">·</span>
                <span>@{skill.author.username}</span>
                <span className="text-zinc-300">·</span>
                <span>Updated {formatDate(skill.updatedAt)}</span>
              </div>
            </div>

            <TagList tags={skill.tags} />

            {skill.forkedFrom ? (
              <div className="border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
                Fork of{" "}
                <Link
                  href={`/s/${skill.forkedFrom.slug}`}
                  className="font-medium text-ink underline decoration-zinc-300 underline-offset-2"
                >
                  {skill.forkedFrom.title}
                </Link>{" "}
                · {skill.forkedFrom.author.displayName}
              </div>
            ) : null}
          </div>
        </div>

        <div className="skl-surface p-6 sm:p-8">
          <MarkdownRenderer content={skill.currentVersion.content} />
        </div>
      </section>

      <aside className="space-y-4">
        <section className="skl-surface p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Actions</p>
          <div className="mt-4 space-y-2">
            {viewer ? (
              <form action={toggleStarAction}>
                <input type="hidden" name="skillId" value={skill.id} />
                <input type="hidden" name="skillSlug" value={skill.slug} />
                <input type="hidden" name="redirectTo" value={`/s/${skill.slug}`} />
                <button type="submit" className="skl-btn skl-btn-secondary w-full rounded-none py-2.5 text-sm">
                  {viewerHasStarred ? "Unstar" : "Star"}
                </button>
              </form>
            ) : isAppConfigured() ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/s/${skill.slug}`)}`}
                className="skl-btn skl-btn-secondary block w-full rounded-none py-2.5 text-center text-sm"
              >
                Log in to star
              </Link>
            ) : (
              <button type="button" disabled className="skl-btn w-full cursor-not-allowed rounded-none border-zinc-200 bg-zinc-100 py-2.5 text-sm text-zinc-400">
                Auth not configured
              </button>
            )}

            {viewer && !canEdit ? (
              <form action={forkSkillAction}>
                <input type="hidden" name="parentSkillId" value={skill.id} />
                <input type="hidden" name="parentSlug" value={skill.slug} />
                <input type="hidden" name="redirectTo" value={`/s/${skill.slug}`} />
                <button type="submit" className="skl-btn skl-btn-secondary w-full rounded-none py-2.5 text-sm">
                  Fork
                </button>
              </form>
            ) : !viewer && isAppConfigured() ? (
              <Link
                href={`/login?next=${encodeURIComponent(`/s/${skill.slug}`)}`}
                className="skl-btn skl-btn-secondary block w-full rounded-none py-2.5 text-center text-sm"
              >
                Log in to fork
              </Link>
            ) : null}

            <Link
              href={`/api/skills/${skill.slug}/raw`}
              className="skl-btn skl-btn-primary block w-full rounded-none py-2.5 text-center text-sm"
            >
              Download .md
            </Link>
            <CopyRawButton content={skill.currentVersion.content} />
          </div>
        </section>

        <section className="skl-surface p-5">
          <div className="space-y-5">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Compatible</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skill.currentVersion.compatibleWith.map((entry) => (
                  <span key={entry} className="border border-zinc-200 bg-zinc-50 px-2 py-0.5 font-mono text-[11px] text-zinc-700">
                    {entry}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px bg-zinc-200">
              <div className="bg-white p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Version</p>
                <p className="mt-1 font-mono text-lg font-semibold text-ink">{skill.currentVersion.version}</p>
              </div>
              <div className="bg-white p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Published</p>
                <p className="mt-1 text-sm font-semibold text-ink">{formatDate(skill.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-px bg-zinc-200 text-center">
              <div className="bg-white p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Stars</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{formatNumber(skill.starsCount)}</p>
              </div>
              <div className="bg-white p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">Forks</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{formatNumber(skill.forksCount)}</p>
              </div>
              <div className="bg-white p-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-zinc-500">DL</p>
                <p className="mt-1 text-lg font-semibold tabular-nums text-ink">{formatNumber(skill.downloadsCount)}</p>
              </div>
            </div>

            {skill.versions.length > 1 ? (
              <details className="border border-zinc-200 bg-zinc-50 px-3 py-2">
                <summary className="cursor-pointer text-sm font-medium text-ink">Version history</summary>
                <ul className="mt-3 space-y-2 border-t border-zinc-200 pt-3 text-sm text-zinc-600">
                  {skill.versions.map((v) => (
                    <li key={v.id} className="flex justify-between gap-2">
                      <span className="font-mono text-xs text-zinc-500">{v.version}</span>
                      <span className="text-xs">{formatDate(v.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        </section>
      </aside>
    </div>
  );
}
