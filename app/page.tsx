import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
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
    <div className="page-shell gap-16">
      <section className="flex flex-col items-center text-center">
        <div className="flex max-w-[760px] flex-col items-center gap-5">
          <PageIntro
            eyebrow="Registry"
            title="Publish and fork AI skills like code."
            description="Single-file prompts with history, stars, and forks. Built for teams who outgrow Slack screenshots."
          />
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/explore" className="skl-btn skl-btn-primary">
              Explore skills
            </Link>
            <Link href="/new" className="skl-btn skl-btn-secondary">
              Publish
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-7 pt-3 text-[16px] font-medium text-[#8f8f8f]">
            <span>{allSkills.length} skills</span>
            <span>{launchCategories.length} categories</span>
            <span>v1 versioned content</span>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 pt-8">
        <SectionHeading
          eyebrow="Featured"
          title="Popular skills"
          description="Sorted by engagement. Sign in to star, fork, or publish your own."
        />
        {featuredSkills.length ? (
          <div className="mt-6">
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

      <section className="border-t border-zinc-200 pt-8">
        <SectionHeading eyebrow="Recent" title="Latest updates" description="New versions and fresh publishes." />
        {recentSkills.length ? (
          <div className="mt-6">
            {recentSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="border-t border-zinc-200 py-12 text-center text-[16px] font-medium text-[#8f8f8f]">
            No recent updates yet.
          </div>
        )}
      </section>

      <section className="border-t border-zinc-200 pt-8">
        <SectionHeading
          eyebrow="Browse"
          title="By category"
          description="Narrow the registry before search."
        />
        <ul className="mt-6 flex flex-wrap gap-2">
          {launchCategories.map((category) => (
            <li key={category}>
              <Link
                href={`/explore?category=${category}`}
                className="profile-pill transition hover:bg-[rgba(228,228,228,0.95)]"
              >
                {category}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
