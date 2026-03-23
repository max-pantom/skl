import { FormNotice } from "@/components/form-notice";
import { PageIntro } from "@/components/page-intro";
import { SkillEditForm } from "@/components/skill-edit-form";
import { requireCurrentViewer } from "@/lib/auth";
import { getSkillBySlug } from "@/lib/data";
import { notFound, redirect } from "next/navigation";

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
  const viewer = await requireCurrentViewer(`/s/${slug}/edit`);
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  if (viewer.id !== skill.author.id) {
    redirect(`/s/${skill.slug}`);
  }

  return (
    <div className="page-shell">
      <PageIntro
        align="left"
        eyebrow="Update"
        title={`Update ${skill.title}`}
        description="Publish a new version from the current files. Leave version blank to auto-bump by 1.0.0, or enter a higher semantic version like 1.0.1."
      />

      <section className="mt-[72px] flex min-h-0 flex-1 flex-col">
        {query.error ? <FormNotice tone="error">{query.error}</FormNotice> : null}
        {query.message ? <FormNotice tone="success">{query.message}</FormNotice> : null}
        <SkillEditForm skill={skill} closeHref={`/s/${skill.slug}`} />
      </section>
    </div>
  );
}
