import Link from "next/link";

import { CreatorCard } from "@/components/creator-card";
import { PlaceholderPanel } from "@/components/placeholder-panel";
import { SectionHeading } from "@/components/section-heading";
import { SkillCard } from "@/components/skill-card";
import { getExploreSkills, getNewestSkills, getTopCreators, getTrendingSkills } from "@/lib/data";
import { launchCategories } from "@/lib/types";

const trustPoints = [
  "Multi-file skills with version history",
  "Forks, stars, downloads, and profile identity",
  "Registry-first today, execution next",
];

export default async function HomePage() {
  const [trendingSkills, newestSkills, topCreators, allSkills] = await Promise.all([
    getTrendingSkills(3),
    getNewestSkills(3),
    getTopCreators(5),
    getExploreSkills(),
  ]);

  return (
    <div className="page-shell gap-20">
      <section className="relative overflow-hidden rounded-[34px] border border-zinc-200 bg-[linear-gradient(180deg,rgba(247,247,242,0.9)_0%,rgba(255,255,255,0.96)_100%)] px-6 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[220px] bg-[radial-gradient(circle_at_top,rgba(36,36,36,0.08),transparent_62%)]" />
        <div className="pointer-events-none absolute -right-14 top-10 size-[180px] rounded-full bg-[rgba(228,228,228,0.7)] blur-2xl" />
        <div className="pointer-events-none absolute bottom-6 left-8 size-[120px] rounded-full bg-[rgba(36,36,36,0.05)] blur-2xl" />

        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-end">
          <div className="max-w-[760px]">
            <p className="page-kicker">Registry</p>
            <h1 className="mt-5 max-w-[9.5ch] text-[clamp(3rem,8vw,6.25rem)] font-semibold leading-[0.92] tracking-[-0.06em] text-[#242424]">
              Build better skills, not better screenshots.
            </h1>
            <p className="mt-6 max-w-[620px] text-[18px] font-medium leading-[1.55] text-[#4f4f4f] sm:text-[19px]">
              Publish reusable AI workflows, keep every version, fork what works, and shape the product in the open.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/community" className="skl-btn skl-btn-secondary">
                Community
              </Link>
              <Link href="/explore" className="skl-btn skl-btn-primary">
                Explore
              </Link>
              <Link href="/new" className="skl-btn skl-btn-secondary">
                Publish
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-[16px] font-medium text-[#7a7a7a]">
              <span>{allSkills.length} skills</span>
              <span>{launchCategories.length} categories</span>
              <span>Versioned by default</span>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[28px] border border-zinc-200 bg-white/90 p-5 shadow-[0_12px_40px_rgba(36,36,36,0.06)]">
              <p className="page-kicker">Why SKL</p>
              <div className="mt-4 space-y-3">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3 text-[16px] font-medium text-[#3f3f3f]">
                    <span className="mt-[6px] size-1.5 shrink-0 rounded-full bg-[#242424]" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              <div className="rounded-[24px] border border-zinc-200 bg-white/80 p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">Trending</p>
                <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#242424]">
                  {trendingSkills.length}
                </p>
                <p className="mt-2 text-[15px] font-medium text-[#7a7a7a]">skills moving right now</p>
              </div>
              <div className="rounded-[24px] border border-zinc-200 bg-white/80 p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">Creators</p>
                <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#242424]">
                  {topCreators.length}
                </p>
                <p className="mt-2 text-[15px] font-medium text-[#7a7a7a]">ranked by real usage</p>
              </div>
              <div className="rounded-[24px] border border-zinc-200 bg-white/80 p-5">
                <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">Latest</p>
                <p className="mt-3 text-[30px] font-semibold leading-none tracking-[-0.05em] text-[#242424]">
                  {newestSkills.length}
                </p>
                <p className="mt-2 text-[15px] font-medium text-[#7a7a7a]">fresh publishes in the registry</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[28px] border border-zinc-200 px-5 py-6">
          <p className="page-kicker">Publish</p>
          <p className="mt-3 text-[20px] font-semibold text-[#242424]">Ship prompts like assets</p>
          <p className="mt-2 text-[16px] font-medium leading-[1.5] text-[#7a7a7a]">
            Create single-file or multi-file skills with version notes, compatibility, and clear ownership.
          </p>
        </div>
        <div className="rounded-[28px] border border-zinc-200 px-5 py-6">
          <p className="page-kicker">Fork</p>
          <p className="mt-3 text-[20px] font-semibold text-[#242424]">Branch what already works</p>
          <p className="mt-2 text-[16px] font-medium leading-[1.5] text-[#7a7a7a]">
            Take an existing skill, keep the lineage visible, and build your own version without losing context.
          </p>
        </div>
        <div className="rounded-[28px] border border-zinc-200 px-5 py-6">
          <p className="page-kicker">Community</p>
          <p className="mt-3 text-[20px] font-semibold text-[#242424]">Shape the product in the open</p>
          <p className="mt-2 text-[16px] font-medium leading-[1.5] text-[#7a7a7a]">
            Post feature requests, bug reports, and feedback where other builders can upvote and discuss them.
          </p>
        </div>
      </section>

      <section>
        <SectionHeading
          eyebrow="Trending"
          title="Skills people are reaching for"
          description="Weighted by stars, downloads, and forks."
        />
        {trendingSkills.length ? (
          <div className="mt-6 flex flex-col gap-6 sm:gap-0">
            {trendingSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} dividers={false} />
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
        <SectionHeading
          eyebrow="Newest"
          title="Fresh from the registry"
          description="Recently published or versioned skills."
        />
        {newestSkills.length ? (
          <div className="mt-6 flex flex-col gap-6 sm:gap-0">
            {newestSkills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} dividers={false} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[16px] font-medium text-[#8f8f8f]">
            No new publishes yet.
          </div>
        )}
      </section>

      <section className="border-t border-zinc-200 pt-8">
        <SectionHeading
          eyebrow="Creators"
          title="Builders worth watching"
          description="Authors ranked by total stars across their public skills."
        />
        {topCreators.length ? (
          <div className="mt-6 flex flex-col gap-6 sm:gap-0">
            {topCreators.map((creator) => (
              <CreatorCard key={creator.user.id} creator={creator} dividers={false} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-[16px] font-medium text-[#8f8f8f]">
            No creators yet.
          </div>
        )}
      </section>

      <section className="border-t border-zinc-200 pt-8">
        <SectionHeading
          eyebrow="Browse"
          title="Move by category"
          description="Jump into the registry without starting from search."
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
