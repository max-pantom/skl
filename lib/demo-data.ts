import {
  sampleForks,
  sampleSkills,
  sampleSkillVersions,
  sampleUsers,
} from "@/lib/seed-content";
import type {
  ExploreFilters,
  ForkReference,
  ProfileData,
  PublicUser,
  SkillDetail,
  SkillListItem,
  SkillVersionRecord,
} from "@/lib/types";

const userById = new Map(sampleUsers.map((user) => [user.id, user]));
const versionById = new Map(sampleSkillVersions.map((version) => [version.id, version]));
const forkByChildId = new Map(sampleForks.map((fork) => [fork.childSkillId, fork]));

function toPublicUser(userId: string): PublicUser {
  const user = userById.get(userId);

  if (!user) {
    throw new Error(`Missing sample user ${userId}`);
  }

  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    website: user.website,
    xUrl: user.xUrl,
    createdAt: user.createdAt,
  };
}

function toVersion(versionId: string): SkillVersionRecord {
  const version = versionById.get(versionId);

  if (!version) {
    throw new Error(`Missing sample version ${versionId}`);
  }

  return {
    id: version.id,
    skillId: version.skillId,
    version: version.version,
    content: version.content,
    changelog: version.changelog,
    compatibleWith: version.compatibleWith,
    metadata: version.metadata,
    createdAt: version.createdAt,
  };
}

function toForkReference(skillId: string): ForkReference {
  const fork = forkByChildId.get(skillId);

  if (!fork) {
    return null;
  }

  const parentSkill = sampleSkills.find((skill) => skill.id === fork.parentSkillId);

  if (!parentSkill) {
    return null;
  }

  const parentAuthor = toPublicUser(parentSkill.authorId);

  return {
    slug: parentSkill.slug,
    title: parentSkill.title,
    author: {
      username: parentAuthor.username,
      displayName: parentAuthor.displayName,
    },
  };
}

function toSkillListItem(skillId: string): SkillListItem {
  const skill = sampleSkills.find((entry) => entry.id === skillId);

  if (!skill) {
    throw new Error(`Missing sample skill ${skillId}`);
  }

  return {
    id: skill.id,
    title: skill.title,
    slug: skill.slug,
    summary: skill.summary,
    category: skill.category,
    tags: skill.tags,
    visibility: skill.visibility,
    starsCount: skill.starsCount,
    downloadsCount: skill.downloadsCount,
    forksCount: skill.forksCount,
    createdAt: skill.createdAt,
    updatedAt: skill.updatedAt,
    author: toPublicUser(skill.authorId),
    currentVersion: toVersion(skill.currentVersionId),
    forkedFrom: toForkReference(skill.id),
  };
}

export const demoSkills = sampleSkills
  .map((skill) => toSkillListItem(skill.id))
  .sort((left, right) => right.downloadsCount - left.downloadsCount || right.starsCount - left.starsCount);

export function getDemoFeaturedSkills(limit = 4) {
  return demoSkills.slice(0, limit);
}

export function getDemoRecentSkills(limit = 4) {
  return [...demoSkills]
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
    .slice(0, limit);
}

export function getDemoExploreSkills(filters: ExploreFilters = {}) {
  const query = filters.query?.trim().toLowerCase();
  const category = filters.category && filters.category !== "all" ? filters.category : null;

  return demoSkills.filter((skill) => {
    const matchesCategory = category ? skill.category === category : true;

    if (!matchesCategory) {
      return false;
    }

    if (!query) {
      return true;
    }

    const searchableText = [
      skill.title,
      skill.summary,
      skill.tags.join(" "),
      skill.currentVersion.content,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(query);
  });
}

export function getDemoSkillBySlug(slug: string): SkillDetail | null {
  const skill = sampleSkills.find((entry) => entry.slug === slug);

  if (!skill) {
    return null;
  }

  const versions = sampleSkillVersions
    .filter((version) => version.skillId === skill.id)
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((version) => ({
      id: version.id,
      skillId: version.skillId,
      version: version.version,
      content: version.content,
      changelog: version.changelog,
      compatibleWith: version.compatibleWith,
      metadata: version.metadata,
      createdAt: version.createdAt,
    }));

  return {
    ...toSkillListItem(skill.id),
    versions,
  };
}

export function getDemoProfileByUsername(username: string): ProfileData | null {
  const user = sampleUsers.find((entry) => entry.username === username);

  if (!user) {
    return null;
  }

  const skills = demoSkills
    .filter((skill) => skill.author.username === username)
    .sort((left, right) => right.starsCount - left.starsCount);

  return {
    user: toPublicUser(user.id),
    skills,
  };
}
