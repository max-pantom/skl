import { SubmitButton } from "@/components/submit-button";
import { launchCategories } from "@/lib/types";

type SkillEditorDefaults = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  tags: string[];
  compatibleWith: string[];
  visibility: "public" | "unlisted";
  version: string;
  changelog: string;
  content: string;
};

export function SkillEditorForm({
  action,
  defaults,
  submitLabel,
  pendingLabel,
  skillId,
  currentSlug,
}: {
  action: (formData: FormData) => Promise<void>;
  defaults: SkillEditorDefaults;
  submitLabel: string;
  pendingLabel: string;
  skillId?: string;
  currentSlug?: string;
}) {
  return (
    <form action={action} className="space-y-6">
      {skillId ? <input type="hidden" name="skillId" value={skillId} /> : null}
      {currentSlug ? <input type="hidden" name="currentSlug" value={currentSlug} /> : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Title</span>
          <input
            name="title"
            defaultValue={defaults.title}
            placeholder="TypeScript PR Review"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Slug</span>
          <input
            name="slug"
            defaultValue={defaults.slug}
            placeholder="typescript-pr-review"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Summary</span>
        <textarea
          name="summary"
          defaultValue={defaults.summary}
          rows={3}
          className="w-full rounded-[1.5rem] border border-stone-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
        />
      </label>

      <div className="grid gap-6 lg:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Category</span>
          <select
            name="category"
            defaultValue={defaults.category}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          >
            {launchCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Visibility</span>
          <select
            name="visibility"
            defaultValue={defaults.visibility}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          >
            <option value="public">Public</option>
            <option value="unlisted">Unlisted</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Version</span>
          <input
            name="version"
            defaultValue={defaults.version}
            placeholder="1.0.0"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Tags</span>
          <input
            name="tags"
            defaultValue={defaults.tags.join(", ")}
            placeholder="typescript, code-review, pull-requests"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium text-ink">Compatible models</span>
          <input
            name="compatibleWith"
            defaultValue={defaults.compatibleWith.join(", ")}
            placeholder="GPT-5, Claude 4, Codex"
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-accent"
          />
        </label>
      </div>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Changelog</span>
        <textarea
          name="changelog"
          defaultValue={defaults.changelog}
          rows={2}
          className="w-full rounded-[1.5rem] border border-stone-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-accent"
        />
      </label>

      <label className="space-y-2">
        <span className="text-sm font-medium text-ink">Markdown content</span>
        <textarea
          name="content"
          defaultValue={defaults.content}
          rows={20}
          className="min-h-[26rem] w-full rounded-[1.5rem] border border-stone-300 bg-white px-4 py-3 font-mono text-sm leading-6 outline-none transition focus:border-accent"
        />
      </label>

      <SubmitButton
        pendingLabel={pendingLabel}
        className="rounded-full border border-ink bg-ink px-5 py-3 text-sm font-medium text-shell transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
