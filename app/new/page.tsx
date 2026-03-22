import { PublishSkillForm } from "@/components/publish-skill-form";
import { PageIntro } from "@/components/page-intro";

export default function NewSkillPage() {
  return (
    <div className="page-shell">
      <PageIntro
        eyebrow="Publish"
        title="Ship a skill"
        description="Write it once, version it clearly, and keep the source markdown portable after publish."
      />

      <section className="mt-[72px] flex min-h-0 flex-1 flex-col">
        <PublishSkillForm />
      </section>
    </div>
  );
}
