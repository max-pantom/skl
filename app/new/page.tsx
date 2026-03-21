import { FormNotice } from "@/components/form-notice";
import { SkillEditorForm } from "@/components/skill-editor-form";
import { createSkillAction } from "@/lib/actions";
import { isAppConfigured, requireCurrentViewer } from "@/lib/auth";

type NewSkillPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function NewSkillPage({ searchParams }: NewSkillPageProps) {
  const params = await searchParams;

  if (!isAppConfigured()) {
    return (
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">Configure auth first</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          To publish skills you need a working database connection and Better Auth secret in the environment.
        </p>
      </section>
    );
  }

  await requireCurrentViewer("/new");

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-accent">Publish</p>
        <h1 className="text-4xl font-semibold tracking-tight text-ink">Create a skill</h1>
        <p className="max-w-2xl text-sm leading-7 text-slate-600">
          This creates the skill record and its first version in one pass.
        </p>
      </div>

      {params.error ? <FormNotice tone="error">{params.error}</FormNotice> : null}
      {params.message ? <FormNotice tone="success">{params.message}</FormNotice> : null}

      <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-card">
        <SkillEditorForm
          action={createSkillAction}
          submitLabel="Publish skill"
          pendingLabel="Publishing..."
          defaults={{
            title: "",
            slug: "",
            summary: "",
            category: "coding",
            tags: [],
            compatibleWith: [],
            visibility: "public",
            version: "1.0.0",
            changelog: "Initial release.",
            content: "# Skill title\n\n## Goal\n\n## Workflow\n\n## Output\n",
          }}
        />
      </div>
    </section>
  );
}
