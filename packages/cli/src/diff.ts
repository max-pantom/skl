import { promptLine } from "./prompt.js";
import { fetchSkillDetail } from "./inspect.js";
import { unifiedDiff } from "./text-diff.js";

function parseVersionRef(value: string) {
  const at = value.lastIndexOf("@");
  if (at <= 0) {
    throw new Error(`Expected slug@version, received "${value}".`);
  }
  return {
    slug: value.slice(0, at),
    version: value.slice(at + 1),
  };
}

export async function diffSkills(options: {
  left?: string;
  right?: string;
  registry?: string;
  token?: string;
  json?: boolean;
}) {
  const leftArg = options.left?.trim() || (await promptLine("Left ref (slug@version)"));
  const rightArg = options.right?.trim() || (await promptLine("Right ref (slug@version)"));
  const leftRef = parseVersionRef(leftArg);
  const rightRef = parseVersionRef(rightArg);
  const [leftSkill, rightSkill] = await Promise.all([
    fetchSkillDetail(leftRef.slug, options),
    fetchSkillDetail(rightRef.slug, options),
  ]);

  const leftVersion = leftSkill.versions.find((version) => version.version === leftRef.version);
  const rightVersion = rightSkill.versions.find((version) => version.version === rightRef.version);

  if (!leftVersion || !rightVersion) {
    throw new Error("One of the requested versions was not found.");
  }

  const leftFiles = new Map(leftVersion.files.map((file) => [file.path, file.content]));
  const rightFiles = new Map(rightVersion.files.map((file) => [file.path, file.content]));
  const fileNames = [...new Set([...leftFiles.keys(), ...rightFiles.keys()])].sort();
  const diff = fileNames.map((file) => {
    const leftContent = leftFiles.get(file);
    const rightContent = rightFiles.get(file);

    if (leftContent == null) {
      return { file, status: "added" as const };
    }
    if (rightContent == null) {
      return { file, status: "removed" as const };
    }
    if (leftContent === rightContent) {
      return { file, status: "unchanged" as const };
    }
    return {
      file,
      status: "changed" as const,
      patch: unifiedDiff(`${leftArg}:${file}`, `${rightArg}:${file}`, leftContent, rightContent),
    };
  });

  if (options.json) {
    console.log(JSON.stringify(diff, null, 2));
    return;
  }

  for (const entry of diff) {
    console.log(`${entry.status.toUpperCase()} ${entry.file}`);
    if ("patch" in entry && entry.patch) {
      console.log(entry.patch);
    }
  }
}
