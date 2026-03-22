import Link from "next/link";

import { PageIntro } from "@/components/page-intro";
import { SectionHeading } from "@/components/section-heading";
import { SkillCard } from "@/components/skill-card";
import { getExploreSkills } from "@/lib/data";
import { launchCategories, type SkillCategory } from "@/lib/types";

type ExplorePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
  }>;
};

function parseCategory(value?: string): SkillCategory | "all" {
  if (!value || value === "all") {
    return "all";
  }

  return launchCategories.includes(value as SkillCategory) ? (value as SkillCategory) : "all";
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = parseCategory(params.category);
  const skills = await getExploreSkills({ query, category });

  return (
    <div className="page-shell gap-12">
      <PageIntro
        eyebrow="Explore"
        title="Registry"
        description="Filter by category, search title, summary, tags, and body text."
      />

      <section className="border-t border-zinc-200 pt-8">
        <form className="grid gap-4 lg:grid-cols-[1fr_minmax(0,200px)_minmax(0,120px)] lg:items-end">
          <label className="profile-field-row block">
            <span className="profile-field-label">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Title, tags, markdown…"
              className="skl-input"
            />
          </label>

          <label className="profile-field-row block">
            <span className="profile-field-label">Category</span>
            <select name="category" defaultValue={category} className="skl-input">
              <option value="all">All</option>
              {launchCategories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="skl-btn skl-btn-primary w-full lg:shrink-0">
            Apply
          </button>
        </form>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-zinc-200 pt-6">
          <Link
            href="/explore"
            className={`profile-pill ${
              category === "all" && !query
                ? "bg-[#242424] text-white"
                : "hover:bg-[rgba(228,228,228,0.95)]"
            }`}
          >
            All
          </Link>
          {launchCategories.map((entry) => {
            const active = category === entry;
            return (
              <Link
                key={entry}
                href={`/explore?category=${entry}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                className={`profile-pill ${
                  active
                    ? "bg-[#242424] text-white"
                    : "hover:bg-[rgba(228,228,228,0.95)]"
                }`}
              >
                {entry}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-zinc-200 pt-8">
        <SectionHeading eyebrow="Results" title="Matches" description="Filtered live from title, summary, tags, and markdown body." />
        <p className="mt-6 text-[16px] font-medium text-[#8f8f8f]">
          <span className="tabular-nums text-[#242424]">{skills.length}</span> result
          {skills.length === 1 ? "" : "s"}
        </p>

        {skills.length ? (
          <div className="mt-2">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="border-t border-zinc-200 py-12 text-center text-[16px] font-medium text-[#8f8f8f]">
            No skills match. Try another category or clear search.
          </div>
        )}
      </section>
    </div>
  );
}
