import Link from "next/link";

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
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Explore"
        title="Search the registry"
        description="The MVP search scans title, summary, tags, and markdown content. Category filtering stays lightweight."
      />

      <section className="rounded-[1.75rem] border border-line bg-panel p-6 shadow-card">
        <form className="grid gap-4 lg:grid-cols-[1fr_220px_140px]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search title, summary, tags, or content"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-ink">Category</span>
            <select
              name="category"
              defaultValue={category}
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
            >
              <option value="all">All categories</option>
              {launchCategories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-full border border-ink bg-ink px-4 py-3 text-sm font-medium text-shell transition hover:bg-slate-900"
            >
              Apply
            </button>
          </div>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/explore"
            className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-ink hover:text-ink"
          >
            All
          </Link>
          {launchCategories.map((entry) => (
            <Link
              key={entry}
              href={`/explore?category=${entry}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-ink hover:text-ink"
            >
              {entry}
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            {skills.length} result{skills.length === 1 ? "" : "s"}
          </p>
        </div>

        {skills.length ? (
          <div className="grid gap-5">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="rounded-[1.5rem] border border-dashed border-line bg-panel p-10 text-sm text-slate-600">
            No skills match this filter yet.
          </div>
        )}
      </section>
    </div>
  );
}

