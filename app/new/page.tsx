import { FormNotice } from "@/components/form-notice";
import { PublishSkillForm } from "@/components/publish-skill-form";
import { PageIntro } from "@/components/page-intro";

type NewSkillPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function NewSkillPage({ searchParams }: NewSkillPageProps) {
  const query = await searchParams;

  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Publish"
        title="Ship a skill"
        description="Write it once, version it clearly, and keep the source markdown portable after publish."
      />

      <section className="mt-[72px] flex min-h-0 flex-1 flex-col">
        {query.error ? <FormNotice tone="error">{query.error}</FormNotice> : null}
        <PublishSkillForm />
      </section>
    </div>
  );
}
