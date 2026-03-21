import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { SkillCard } from "@/components/skill-card";
import { getExploreSkills, getFeaturedSkills, getRecentSkills } from "@/lib/data";
import { launchCategories } from "@/lib/types";

export default async function HomePage() {
  const [featuredSkills, recentSkills, allSkills] = await Promise.all([
    getFeaturedSkills(3),
    getRecentSkills(3),
    getExploreSkills(),
  ]);

  return (
    <div className="space-y-16">
      <section className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-8">
          <div className="space-y-5">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Portable AI skills</p>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-ink sm:text-6xl">
              Publish reusable instructions that agents can browse, fork, and download.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-slate-600">
              SKL is a calm, technical registry for single-file skills. Authors stay visible. Versions stay readable.
              Raw access stays one click away.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="rounded-full border border-ink bg-ink px-5 py-3 text-sm font-medium text-shell transition hover:bg-slate-900"
            >
              Explore skills
            </Link>
            <Link
              href="/new"
              className="rounded-full border border-stone-300 bg-white px-5 py-3 text-sm font-medium text-ink transition hover:border-ink"
            >
              Publish a skill
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-[1.5rem] border border-line bg-panel p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Published skills</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">{allSkills.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-line bg-panel p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Launch categories</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">{launchCategories.length}</p>
          </div>
          <div className="rounded-[1.5rem] border border-line bg-panel p-6 shadow-card">
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-slate-500">Version-ready</p>
            <p className="mt-4 text-4xl font-semibold tracking-tight text-ink">Yes</p>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured"
          title="Popular skills"
          description="Read-heavy pages first. Fast publish and auth can layer on top once the registry model is in place."
        />
        <div className="grid gap-5">
          {featuredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Recent"
          title="Latest updates"
          description="Version history is a core part of trust, so recent changes are visible on day one."
        />
        <div className="grid gap-5 lg:grid-cols-3">
          {recentSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Categories"
          title="Launch taxonomy"
          description="The first release keeps categories intentionally narrow so discovery stays clean."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {launchCategories.map((category) => (
            <Link
              key={category}
              href={`/explore?category=${category}`}
              className="rounded-[1.25rem] border border-line bg-panel p-5 shadow-card transition hover:border-accent/50"
            >
              <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">{category}</p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Browse skills tagged for {category} workflows.
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

