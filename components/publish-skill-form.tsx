import Link from "next/link";

import { createSkillAction } from "@/lib/actions";
import { isAppConfigured } from "@/lib/auth";
import { launchCategories } from "@/lib/types";

export async function PublishSkillForm() {
  const configured = isAppConfigured();

  if (!configured) {
    return (
      <div className="skl-surface border-dashed p-8 text-sm text-zinc-600">
        Publishing needs PostgreSQL and <code className="font-mono text-xs">BETTER_AUTH_SECRET</code> in your environment.
        Explore still works in demo mode without a database.
      </div>
    );
  }

  return (
    <form action={createSkillAction} className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-ink" htmlFor="title">
          Title
        </label>
        <input id="title" name="title" required className="skl-input" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink" htmlFor="slug">
          Slug (optional)
        </label>
        <input
          id="slug"
          name="slug"
          placeholder="auto from title if empty"
          className="skl-input"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink" htmlFor="summary">
          Summary
        </label>
        <textarea id="summary" name="summary" required rows={3} className="skl-input" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink" htmlFor="category">
            Category
          </label>
          <select id="category" name="category" required className="skl-input">
            {launchCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink" htmlFor="visibility">
            Visibility
          </label>
          <select id="visibility" name="visibility" className="skl-input">
            <option value="public">public</option>
            <option value="unlisted">unlisted</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink" htmlFor="tags">
          Tags
        </label>
        <input id="tags" name="tags" placeholder="comma separated" className="skl-input" />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink" htmlFor="compatibleWith">
          Compatible with
        </label>
        <input
          id="compatibleWith"
          name="compatibleWith"
          placeholder="e.g. GPT-5, Claude 4"
          className="skl-input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink" htmlFor="version">
            Version
          </label>
          <input
            id="version"
            name="version"
            defaultValue="1.0.0"
            required
            className="skl-input"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-ink" htmlFor="changelog">
            Changelog
          </label>
          <input id="changelog" name="changelog" placeholder="optional" className="skl-input" />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-ink" htmlFor="content">
          Skill body (markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={16}
          className="skl-input font-mono text-[13px] leading-relaxed"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="skl-btn skl-btn-primary px-6">
          Publish
        </button>
        <Link href="/explore" className="skl-btn skl-btn-secondary px-6">
          Cancel
        </Link>
      </div>
    </form>
  );
}
