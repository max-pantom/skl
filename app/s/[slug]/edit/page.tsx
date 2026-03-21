import { notFound, redirect } from "next/navigation";

import { FormNotice } from "@/components/form-notice";
import { SkillEditorForm } from "@/components/skill-editor-form";
import { updateSkillAction } from "@/lib/actions";
import { isAppConfigured, requireCurrentViewer } from "@/lib/auth";
import { getSkillBySlug } from "@/lib/data";

type SkillEditPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function SkillEditPage({ params, searchParams }: SkillEditPageProps) {
  const { slug } = await params;
  const query = await searchParams;

  if (!isAppConfigured()) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Configure auth first</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Editing requires Better Auth and the database to be configured.
        </p>
      </section>
    );
  }

  const viewer = await requireCurrentViewer(`/s/${slug}/edit`);
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  if (skill.author.id !== viewer.id) {
    redirect(`/s/${slug}`);
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Edit</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">Ship a new version</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          Editing creates a new version and promotes it to current. Existing versions stay in history.
        </p>
      </div>

      {query.error ? <FormNotice tone="error">{query.error}</FormNotice> : null}
      {query.message ? <FormNotice tone="success">{query.message}</FormNotice> : null}

      <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <SkillEditorForm
          action={updateSkillAction}
          submitLabel="Publish new version"
          pendingLabel="Saving..."
          skillId={skill.id}
          currentSlug={skill.slug}
          defaults={{
            title: skill.title,
            slug: skill.slug,
            summary: skill.summary,
            category: skill.category,
            tags: skill.tags,
            compatibleWith: skill.currentVersion.compatibleWith,
            visibility: skill.visibility,
            version: "",
            changelog: "",
            content: skill.currentVersion.content,
          }}
        />
      </div>
    </section>
  );
}
