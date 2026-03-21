import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/section-heading";
import { getSkillBySlug } from "@/lib/data";
import { formatDate } from "@/lib/utils";

type SkillVersionsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: SkillVersionsPageProps): Promise<Metadata> {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  return {
    title: skill ? `${skill.title} versions` : "Version history",
  };
}

export default async function SkillVersionsPage({ params }: SkillVersionsPageProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Versions"
        title={`${skill.title} history`}
        description="Authorship and change history stay visible from the start, even in the smallest version of the product."
      />

      <div className="grid gap-5">
        {skill.versions.map((version) => (
          <article key={version.id} className="rounded-[1.5rem] border border-line bg-panel p-6 shadow-card">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-ink">{version.version}</h2>
                  <span className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">
                    {formatDate(version.createdAt)}
                  </span>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-slate-600">
                  {version.changelog ?? "No changelog provided."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {version.compatibleWith.map((entry) => (
                  <span
                    key={entry}
                    className="rounded-full border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <Link
        href={`/s/${skill.slug}`}
        className="inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:border-ink"
      >
        Back to skill
      </Link>
    </div>
  );
}

