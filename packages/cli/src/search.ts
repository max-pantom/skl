import { promptChoice, promptLine } from "./prompt.js";
import { requestJson, resolveRegistryBase, skillsSearchUrl } from "./registry.js";
import { readCliState } from "./state.js";

type SearchResponse = {
  skills: Array<{
    slug: string;
    title: string;
    summary: string;
    author: {
      username: string;
      displayName: string;
    };
    currentVersion: {
      version: string;
    };
  }>;
};

export async function searchSkills(query: string, options: { registry?: string }) {
  const state = await readCliState();
  const registry = await resolveRegistryBase(options.registry?.trim() || state.registry);
  const payload = await requestJson<SearchResponse>(skillsSearchUrl(registry, query, 10), {
    registry,
  });
  return payload.skills;
}

export async function resolveSkillSlugFromInput(inputValue: string | undefined, options: { registry?: string }) {
  const value = inputValue?.trim() || (await promptLine("Skill slug or search phrase"));
  if (!value) {
    throw new Error("Missing skill slug");
  }

  if (!/\s/.test(value)) {
    return value;
  }

  const matches = await searchSkills(value, options);

  if (!matches.length) {
    throw new Error(`No skills matched "${value}".`);
  }

  if (matches.length === 1) {
    return matches[0]!.slug;
  }

  return promptChoice(
    `Choose a skill for "${value}"`,
    matches.map((skill) => ({
      label: `${skill.title} (${skill.slug}) · v${skill.currentVersion.version} · @${skill.author.username}`,
      value: skill.slug,
    })),
  );
}
