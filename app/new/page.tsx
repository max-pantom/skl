import { PublishSkillForm } from "@/components/publish-skill-form";
import { SectionHeading } from "@/components/section-heading";

export default function NewSkillPage() {
  return (
    <div className="space-y-10">
      <SectionHeading
        eyebrow="Publish"
        title="Ship a skill"
        description="One markdown body, one version string, obvious metadata. Raw download is automatic."
      />
      <PublishSkillForm />
    </div>
  );
}
