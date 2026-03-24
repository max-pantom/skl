import { promptLine } from "./prompt.js";
import { inspectUrl, requestJson, resolveRegistryBase } from "./registry.js";
import { readCliState } from "./state.js";

export type SkillVersionFileRecord = {
  path: string;
  content: string;
};

export type SkillVersionRecord = {
  version: string;
  changelog: string | null;
  compatibleWith: string[];
  files: SkillVersionFileRecord[];
};

export type SkillDetail = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  visibility: string;
  tags: string[];
  author: {
    username: string;
    displayName: string;
  };
  currentVersion: SkillVersionRecord;
  versions: SkillVersionRecord[];
};

type InspectResponse = {
  skill: SkillDetail;
};

export async function fetchSkillDetail(slug: string, options: { registry?: string; token?: string }) {
  const state = await readCliState();
  const registry = await resolveRegistryBase(options.registry?.trim() || state.registry);
  const token = options.token?.trim() || state.token?.trim();
  const payload = await requestJson<InspectResponse>(inspectUrl(registry, slug), {
    registry,
    token,
  });
  return payload.skill;
}

export async function inspectSkill(options: { slug?: string; registry?: string; token?: string; json?: boolean }) {
  const slug = options.slug?.trim() || (await promptLine("Skill slug"));
  const skill = await fetchSkillDetail(slug, options);

  if (options.json) {
    console.log(JSON.stringify(skill, null, 2));
    return;
  }

  console.log(`${skill.title} (@${skill.author.username})`);
  console.log(`slug: ${skill.slug}`);
  console.log(`category: ${skill.category}`);
  console.log(`visibility: ${skill.visibility}`);
  console.log(`tags: ${skill.tags.join(", ") || "-"}`);
  console.log(`current: ${skill.currentVersion.version}`);
  console.log(`versions: ${skill.versions.map((version) => version.version).join(", ")}`);
  for (const version of skill.versions) {
    console.log(`\nv${version.version}`);
    console.log(`files: ${version.files.map((file) => file.path).join(", ")}`);
    if (version.changelog) {
      console.log(`changelog: ${version.changelog}`);
    }
  }
}
