import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { createSkillAction } from "@/lib/actions";
import { isAppConfigured } from "@/lib/auth";
import { launchCategories } from "@/lib/types";
import { MarkdownEditorPreview } from "@/components/markdown-editor-preview";

export async function PublishSkillForm() {
  const configured = isAppConfigured();

  if (!configured) {
    return (
      <div className="border border-dashed border-zinc-300 px-6 py-8 text-[16px] font-medium text-[#8f8f8f]">
        Publishing needs PostgreSQL and <code className="font-mono text-xs">BETTER_AUTH_SECRET</code> in your environment.
        Explore still works in demo mode without a database.
      </div>
    );
  }

  return (
    <form action={createSkillAction} className="mx-auto flex w-full max-w-[1056px] flex-col gap-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="title">
              Title
            </label>
            <input id="title" name="title" required className="publish-form-input" />
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="slug">
              Slug
            </label>
            <input
              id="slug"
              name="slug"
              placeholder="auto from title if empty"
              className="publish-form-input"
            />
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="summary">
              Summary
            </label>
            <textarea id="summary" name="summary" required rows={4} className="publish-form-input publish-form-textarea" />
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="tags">
              Tags
            </label>
            <input id="tags" name="tags" placeholder="comma separated" className="publish-form-input" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="publish-form-row">
              <label className="publish-form-label" htmlFor="category">
                Category
              </label>
              <select id="category" name="category" required className="publish-form-input">
                {launchCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="publish-form-row">
              <label className="publish-form-label" htmlFor="visibility">
                Visibility
              </label>
              <select id="visibility" name="visibility" className="publish-form-input">
                <option value="public">public</option>
                <option value="unlisted">unlisted</option>
              </select>
            </div>
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="compatibleWith">
              Compatible with
            </label>
            <input
              id="compatibleWith"
              name="compatibleWith"
              placeholder="e.g. GPT-5, Claude 4"
              className="publish-form-input"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="publish-form-row">
              <label className="publish-form-label" htmlFor="version">
                Version
              </label>
              <input
                id="version"
                name="version"
                defaultValue="1.0.0"
                required
                className="publish-form-input"
              />
            </div>

            <div className="publish-form-row">
              <label className="publish-form-label" htmlFor="changelog">
                Changelog
              </label>
              <input id="changelog" name="changelog" placeholder="optional" className="publish-form-input" />
            </div>
          </div>

          <div className="border-t border-zinc-200 pt-6">
            <p className="text-[16px] font-medium text-[#8f8f8f]">
              Public metadata should read like the profile page: short, clear, and scannable.
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-10">
        <MarkdownEditorPreview />
      </div>

      <div className="flex flex-wrap items-center gap-5 border-t border-zinc-200 pt-8">
        <SubmitButton pendingLabel="Publishing…" className="text-[16px] font-semibold text-[#242424] underline decoration-dotted underline-offset-4 transition hover:opacity-70">
          Publish
        </SubmitButton>
        <Link href="/explore" className="text-[16px] font-medium text-[#8f8f8f] underline decoration-dotted underline-offset-4 transition hover:text-[#242424]">
          Cancel
        </Link>
      </div>
    </form>
  );
}
