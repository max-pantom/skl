import Link from "next/link";

import { PlaceholderPanel } from "@/components/placeholder-panel";
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
    <div className="space-y-14 sm:space-y-20">
      <section className="skl-surface relative overflow-hidden p-6 sm:p-10">
        <div className="absolute left-0 top-0 h-full w-1 bg-zinc-900" aria-hidden />
        <div className="space-y-6 pl-4 sm:pl-6">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Registry</p>
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
            Publish and fork AI skills like code—versioned, attributed, one raw download away.
          </h1>
          <p className="max-w-xl text-sm leading-7 text-zinc-600">
            Single-file prompts with history, stars, and forks. Built for teams who outgrow Slack screenshots.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link href="/explore" className="skl-btn skl-btn-primary rounded-none px-5 py-3">
              Explore skills
            </Link>
            <Link href="/new" className="skl-btn skl-btn-secondary rounded-none px-5 py-3">
              Publish
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 border border-zinc-200 bg-white p-4 sm:grid-cols-3 sm:p-5">
        <div className="border-b border-zinc-100 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">In registry</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">{allSkills.length}</p>
          <p className="mt-1 text-xs text-zinc-500">skills</p>
        </div>
        <div className="border-b border-zinc-100 pb-4 sm:border-b-0 sm:border-r sm:pb-0 sm:px-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Categories</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-ink">{launchCategories.length}</p>
          <p className="mt-1 text-xs text-zinc-500">for discovery</p>
        </div>
        <div className="sm:pl-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">Model</p>
          <p className="mt-2 text-3xl font-semibold text-ink">v1</p>
          <p className="mt-1 text-xs text-zinc-500">versioned content</p>
        </div>
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Featured"
          title="Popular skills"
          description="Sorted by engagement. Sign in to star, fork, or publish your own."
        />
        {featuredSkills.length ? (
          <div className="grid gap-4">
            {featuredSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <PlaceholderPanel
            title="No skills yet"
            description="Run migrations, create an account, and publish the first skill. The registry no longer ships with sample seed content."
          />
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading eyebrow="Recent" title="Latest updates" description="New versions and fresh publishes." />
        {recentSkills.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {recentSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center text-sm text-zinc-600">
            No recent updates yet.
          </div>
        )}
      </section>

      <section className="space-y-6">
        <SectionHeading
          eyebrow="Browse"
          title="By category"
          description="Narrow the registry before search."
        />
        <ul className="grid gap-px bg-zinc-200 sm:grid-cols-2 lg:grid-cols-3">
          {launchCategories.map((category) => (
            <li key={category} className="bg-white">
              <Link
                href={`/explore?category=${category}`}
                className="block p-5 transition-colors hover:bg-zinc-50"
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500">{category}</p>
                <p className="mt-2 text-sm text-zinc-600">Open in explore →</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
