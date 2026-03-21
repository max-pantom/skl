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
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Explore"
        title="Registry"
        description="Filter by category, search title, summary, tags, and body text."
      />

      <section className="skl-surface p-5 sm:p-6">
        <form className="grid gap-4 lg:grid-cols-[1fr_minmax(0,200px)_minmax(0,120px)] lg:items-end">
          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Search</span>
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Title, tags, markdown…"
              className="skl-input"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Category</span>
            <select name="category" defaultValue={category} className="skl-input">
              <option value="all">All</option>
              {launchCategories.map((entry) => (
                <option key={entry} value={entry}>
                  {entry}
                </option>
              ))}
            </select>
          </label>

          <button type="submit" className="skl-btn skl-btn-primary h-[42px] w-full rounded-none lg:shrink-0">
            Apply
          </button>
        </form>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-zinc-100 pt-5">
          <Link
            href="/explore"
            className={`border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${
              category === "all" && !query
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400"
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
                className={`border px-2.5 py-1 font-mono text-[11px] uppercase tracking-wide ${
                  active
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400"
                }`}
              >
                {entry}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <p className="text-sm text-zinc-600">
          <span className="font-mono tabular-nums text-ink">{skills.length}</span> result
          {skills.length === 1 ? "" : "s"}
        </p>

        {skills.length ? (
          <div className="grid gap-4">
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-zinc-300 bg-zinc-50 px-6 py-14 text-center text-sm text-zinc-600">
            No skills match. Try another category or clear search.
          </div>
        )}
      </section>
    </div>
  );
}
