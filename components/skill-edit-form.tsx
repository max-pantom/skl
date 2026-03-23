import { FormLoadingOverlay } from "@/components/form-loading-overlay";
import { MarkdownEditorPreview } from "@/components/markdown-editor-preview";
import { SubmitButton } from "@/components/submit-button";
import { SkillVersionInput } from "@/components/skill-version-input";
import { updateSkillAction } from "@/lib/actions";
import { launchCategories, type SkillDetail } from "@/lib/types";
import { bumpMajorSemver } from "@/lib/utils";

export function SkillEditForm({ skill }: { skill: SkillDetail }) {
  const suggestedVersion = bumpMajorSemver(skill.currentVersion.version);

  return (
    <form action={updateSkillAction} className="relative space-y-10">
      <FormLoadingOverlay label="Publishing update" />
      <input type="hidden" name="skillId" value={skill.id} />
      <input type="hidden" name="currentSlug" value={skill.slug} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="edit-title">
              Title
            </label>
            <input
              id="edit-title"
              name="title"
              defaultValue={skill.title}
              required
              className="publish-form-input"
            />
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="edit-slug">
              Slug
            </label>
            <input
              id="edit-slug"
              name="slug"
              defaultValue={skill.slug}
              className="publish-form-input"
            />
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="edit-summary">
              Summary
            </label>
            <textarea
              id="edit-summary"
              name="summary"
              defaultValue={skill.summary}
              required
              rows={4}
              className="publish-form-input publish-form-textarea"
            />
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="edit-tags">
              Tags
            </label>
            <input
              id="edit-tags"
              name="tags"
              defaultValue={skill.tags.join(", ")}
              placeholder="comma separated"
              className="publish-form-input"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-zinc-200 bg-[rgba(244,244,240,0.7)] px-5 py-4">
            <p className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#8f8f8f]">Version plan</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[16px] font-medium">
              <span className="rounded-full bg-white px-3 py-1 text-[#8f8f8f]">Current v{skill.currentVersion.version}</span>
              <span className="text-[#8f8f8f]">→</span>
              <span className="rounded-full bg-[#242424] px-3 py-1 text-white">Suggested v{suggestedVersion}</span>
            </div>
            <p className="mt-3 text-[14px] font-medium leading-[1.45] text-[#8f8f8f]">
              Leave the version field empty and SKL will publish <span className="text-[#242424]">v{suggestedVersion}</span>{" "}
              automatically. If you type your own version, it must be higher than <span className="text-[#242424]">v{skill.currentVersion.version}</span>.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="publish-form-row">
              <label className="publish-form-label" htmlFor="edit-category">
                Category
              </label>
              <div className="skl-select-shell">
                <select id="edit-category" name="category" defaultValue={skill.category} required className="skl-select">
                  {launchCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <svg viewBox="0 0 16 16" aria-hidden className="skl-select-icon">
                  <path d="M4 6.5 8 10.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>

            <div className="publish-form-row">
              <label className="publish-form-label" htmlFor="edit-visibility">
                Visibility
              </label>
              <div className="skl-select-shell">
                <select id="edit-visibility" name="visibility" defaultValue={skill.visibility} className="skl-select">
                  <option value="public">public</option>
                  <option value="unlisted">unlisted</option>
                </select>
                <svg viewBox="0 0 16 16" aria-hidden className="skl-select-icon">
                  <path d="M4 6.5 8 10.5l4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>

          <div className="publish-form-row">
            <label className="publish-form-label" htmlFor="edit-compatible-with">
              Compatible with
            </label>
            <input
              id="edit-compatible-with"
              name="compatibleWith"
              defaultValue={skill.currentVersion.compatibleWith.join(", ")}
              placeholder="e.g. GPT-5, Claude 4"
              className="publish-form-input"
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <SkillVersionInput currentVersion={skill.currentVersion.version} />

            <div className="publish-form-row">
              <label className="publish-form-label" htmlFor="edit-changelog">
                Changelog
              </label>
              <input
                id="edit-changelog"
                name="changelog"
                placeholder="What changed in this version?"
                className="publish-form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-10">
        <MarkdownEditorPreview
          defaultFiles={skill.currentVersion.files.map((file) => ({
            path: file.path,
            content: file.content,
          }))}
        />
      </div>

      <div className="flex flex-wrap items-center gap-5 border-t border-zinc-200 pt-8">
        <SubmitButton
          pendingLabel="Updating…"
          className="text-[16px] font-semibold text-[#242424] underline decoration-dotted underline-offset-4 transition hover:opacity-70"
        >
          Publish update
        </SubmitButton>
      </div>
    </form>
  );
}
