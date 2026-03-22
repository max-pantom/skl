import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CopyRawButton } from "@/components/copy-raw-button";
import { FormNotice } from "@/components/form-notice";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { SkillAuthorCard } from "@/components/skill-author-card";
import { TagList } from "@/components/tag-list";
import { forkSkillAction, toggleStarAction } from "@/lib/actions";
import { getCurrentViewer, isAppConfigured } from "@/lib/auth";
import { getSkillBySlug, hasUserStarredSkill } from "@/lib/data";
import { isMarkdownPath, selectSkillFile } from "@/lib/skill-files";
import { formatDate, formatNumber, withQuery } from "@/lib/utils";

type SkillPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
    file?: string;
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
  const selectedFile = selectSkillFile(skill.currentVersion.files, query.file);
  const redirectTo = withQuery(`/s/${skill.slug}`, { file: selectedFile?.path });

  if (!selectedFile) {
    notFound();
  }

  return (
    <div className="page-shell">
      <section className="space-y-4">
        {query.error ? <FormNotice tone="error">{query.error}</FormNotice> : null}
        {query.message ? <FormNotice tone="success">{query.message}</FormNotice> : null}
      </section>

      <section className="mt-10 flex flex-col items-center text-center">
        <div className="flex max-w-[720px] flex-col items-center gap-4">
          <div className="w-full max-w-md">
            <SkillAuthorCard author={skill.author} />
          </div>
          <p className="page-kicker">{skill.category}</p>
          <div className="space-y-3">
            <h1 className="page-title">{skill.title}</h1>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[16px] font-medium text-[#8f8f8f]">
            <span>Updated {formatDate(skill.updatedAt)}</span>
          </div>
          <TagList tags={skill.tags} className="justify-center" />
          {skill.forkedFrom ? (
            <p className="text-[16px] font-medium text-[#8f8f8f]">
              Fork of{" "}
              <Link href={`/s/${skill.forkedFrom.slug}`} className="profile-link">
                {skill.forkedFrom.title}
              </Link>{" "}
              · {skill.forkedFrom.author.displayName}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mt-[72px] grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="border-t border-zinc-200 pt-8">
          <div className="mb-6 flex items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <div>
              <p className="page-kicker">Current file</p>
              <p className="mt-2 text-[18px] font-semibold text-[#242424]">{selectedFile.path}</p>
            </div>
            <span className="text-[14px] font-medium text-[#8f8f8f]">
              {isMarkdownPath(selectedFile.path) ? "Markdown" : "Text file"}
            </span>
          </div>

          {isMarkdownPath(selectedFile.path) ? (
            <MarkdownRenderer content={selectedFile.content} />
          ) : (
            <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-[28px] border border-zinc-200 px-5 py-4 font-mono text-[14px] leading-6 text-[#242424]">
              {selectedFile.content}
            </pre>
          )}
        </section>

        <aside className="space-y-8">
          <section className="border-t border-zinc-200 pt-6">
            <p className="page-kicker">Files</p>
            <div className="mt-5 space-y-2">
              {skill.currentVersion.files.map((file) => {
                const isActive = file.path === selectedFile.path;

                return (
                  <Link
                    key={file.id}
                    href={withQuery(`/s/${skill.slug}`, { file: file.path })}
                    className={`block rounded-[20px] border px-4 py-3 text-[14px] font-medium transition ${
                      isActive
                        ? "border-[#242424] bg-[#242424] text-white"
                        : "border-zinc-200 text-[#242424] hover:border-[#242424]"
                    }`}
                  >
                    {file.path}
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <p className="page-kicker">Actions</p>
            <div className="mt-5 space-y-3">
              {viewer ? (
                <form action={toggleStarAction}>
                  <input type="hidden" name="skillId" value={skill.id} />
                  <input type="hidden" name="skillSlug" value={skill.slug} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button type="submit" className="skl-btn skl-btn-secondary w-full justify-center">
                    {viewerHasStarred ? "Unstar" : "Star"}
                  </button>
                </form>
              ) : isAppConfigured() ? (
                <Link
                  href={`/login?next=${encodeURIComponent(redirectTo)}`}
                  className="skl-btn skl-btn-secondary flex w-full justify-center text-center"
                >
                  Log in to star
                </Link>
              ) : (
                <button type="button" disabled className="skl-btn w-full cursor-not-allowed justify-center bg-zinc-100 text-zinc-400">
                  Unavailable right now
                </button>
              )}

              {viewer && !canEdit ? (
                <form action={forkSkillAction}>
                  <input type="hidden" name="parentSkillId" value={skill.id} />
                  <input type="hidden" name="parentSlug" value={skill.slug} />
                  <input type="hidden" name="redirectTo" value={redirectTo} />
                  <button type="submit" className="skl-btn skl-btn-secondary w-full justify-center">
                    Fork
                  </button>
                </form>
              ) : !viewer && isAppConfigured() ? (
                <Link
                  href={`/login?next=${encodeURIComponent(redirectTo)}`}
                  className="skl-btn skl-btn-secondary flex w-full justify-center text-center"
                >
                  Log in to fork
                </Link>
              ) : null}

              <Link
                href={withQuery(`/api/skills/${skill.slug}/raw`, { path: selectedFile.path })}
                className="skl-btn skl-btn-primary flex w-full justify-center text-center"
              >
                Download {selectedFile.path}
              </Link>
              <CopyRawButton content={selectedFile.content} label={`Copy ${selectedFile.path}`} />
            </div>
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <div className="space-y-6">
              <div>
                <p className="page-kicker">Compatible</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {skill.currentVersion.compatibleWith.map((entry) => (
                    <span key={entry} className="profile-pill">
                      {entry}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 border-t border-zinc-200 pt-6 text-[16px] font-medium text-[#8f8f8f]">
                <div className="flex items-center justify-between gap-3">
                  <span>Version</span>
                  <span className="text-[#242424]">{skill.currentVersion.version}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Published</span>
                  <span className="text-[#242424]">{formatDate(skill.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Stars</span>
                  <span className="text-[#242424]">{formatNumber(skill.starsCount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Forks</span>
                  <span className="text-[#242424]">{formatNumber(skill.forksCount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Downloads</span>
                  <span className="text-[#242424]">{formatNumber(skill.downloadsCount)}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span>Files</span>
                  <span className="text-[#242424]">{formatNumber(skill.currentVersion.files.length)}</span>
                </div>
              </div>

              {skill.currentVersion.changelog ? (
                <div className="border-t border-zinc-200 pt-6">
                  <p className="page-kicker">Version notes</p>
                  <p className="mt-3 whitespace-pre-wrap text-[15px] font-medium leading-snug text-[#242424]/90">
                    {skill.currentVersion.changelog}
                  </p>
                </div>
              ) : null}

              {skill.versions.length > 1 ? (
                <details className="border-t border-zinc-200 pt-6">
                  <summary className="cursor-pointer text-[16px] font-semibold text-[#242424]">Version history</summary>
                  <ul className="mt-4 space-y-4 text-[16px] font-medium text-[#8f8f8f]">
                    {skill.versions.map((v) => (
                      <li key={v.id} className="border-b border-zinc-100 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex justify-between gap-3">
                          <span className="font-semibold text-[#242424]">v{v.version}</span>
                          <span>{formatDate(v.createdAt)}</span>
                        </div>
                        {v.changelog ? (
                          <p className="mt-2 whitespace-pre-wrap text-[15px] font-medium leading-snug text-[#242424]/85">
                            {v.changelog}
                          </p>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
