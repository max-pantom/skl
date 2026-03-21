import { notFound } from "next/navigation";

import { PlaceholderPanel } from "@/components/placeholder-panel";
import { getSkillBySlug } from "@/lib/data";

type SkillEditPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SkillEditPage({ params }: SkillEditPageProps) {
  const { slug } = await params;
  const skill = await getSkillBySlug(slug);

  if (!skill) {
    notFound();
  }

  return (
    <PlaceholderPanel
      title={`Edit ${skill.title}`}
      description="Editing will reuse the same skill and skill_version records defined in this pass. The route is ready, but write operations are intentionally deferred until auth and server actions are wired."
    />
  );
}

