import "server-only";

import { and, eq } from "drizzle-orm";

import { db, isDatabaseConfigured } from "@/db";
import { skills, stars, users } from "@/db/schema";
import type {
  ExploreFilters,
  ForkReference,
  ProfileData,
  PublicUser,
  SkillDetail,
  SkillListItem,
  SkillVersionRecord,
} from "@/lib/types";

type AuthorRecord = {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  website: string | null;
  xUrl: string | null;
  createdAt: Date | string;
} | null;

type VersionRecord = {
  id: string;
  skillId: string;
  version: string;
  content: string;
  changelog: string | null;
  compatibleWith: string[];
  metadata: Record<string, unknown>;
  createdAt: Date | string;
} | null;

type ForkRecord = {
  parentSkill: {
    slug: string;
    title: string;
    author: {
      username: string;
      displayName: string;
    } | null;
  } | null;
} | null;

type SkillRecord = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  category: SkillListItem["category"];
  tags: string[];
  visibility: SkillListItem["visibility"];
  starsCount: number;
  downloadsCount: number;
  forksCount: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  author: AuthorRecord;
  currentVersion: VersionRecord;
  parentFork: ForkRecord;
};

function toIso(value: string | Date) {
  return new Date(value).toISOString();
}

function mapAuthor(author: NonNullable<AuthorRecord>): PublicUser {
  return {
    id: author.id,
    username: author.username,
    displayName: author.displayName,
    bio: author.bio,
    avatarUrl: author.avatarUrl,
    website: author.website,
    xUrl: author.xUrl,
    createdAt: toIso(author.createdAt),
  };
}

function mapVersion(version: NonNullable<VersionRecord>): SkillVersionRecord {
  return {
    id: version.id,
    skillId: version.skillId,
    version: version.version,
    content: version.content,
    changelog: version.changelog,
    compatibleWith: version.compatibleWith,
    metadata: version.metadata,
    createdAt: toIso(version.createdAt),
  };
}

function mapFork(fork: ForkRecord): ForkReference {
  if (!fork?.parentSkill || !fork.parentSkill.author) {
    return null;
  }

  return {
    slug: fork.parentSkill.slug,
    title: fork.parentSkill.title,
    author: {
      username: fork.parentSkill.author.username,
      displayName: fork.parentSkill.author.displayName,
    },
  };
}

function mapSkill(record: SkillRecord): SkillListItem | null {
  if (!record.author || !record.currentVersion) {
    return null;
  }

  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    summary: record.summary,
    category: record.category,
    tags: record.tags,
    visibility: record.visibility,
    starsCount: record.starsCount,
    downloadsCount: record.downloadsCount,
    forksCount: record.forksCount,
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
    author: mapAuthor(record.author),
    currentVersion: mapVersion(record.currentVersion),
    forkedFrom: mapFork(record.parentFork),
  };
}

function filterSkills(skillsList: SkillListItem[], filters: ExploreFilters) {
  const category = filters.category && filters.category !== "all" ? filters.category : null;
  const query = filters.query?.trim().toLowerCase();

  return skillsList.filter((skill) => {
    if (category && skill.category !== category) {
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

async function fetchAllSkillRows() {
  if (!db || !isDatabaseConfigured) {
    return null;
  }

  try {
    return await db.query.skills.findMany({
      with: {
        author: true,
        currentVersion: true,
        parentFork: {
          with: {
            parentSkill: {
              with: {
                author: true,
              },
            },
          },
        },
      },
      orderBy: (skillsTable, { desc: orderDesc }) => [
        orderDesc(skillsTable.downloadsCount),
        orderDesc(skillsTable.starsCount),
        orderDesc(skillsTable.updatedAt),
      ],
    });
  } catch {
    return null;
  }
}

export async function getFeaturedSkills(limit = 4) {
  const rows = await fetchAllSkillRows();

  if (!rows) {
    return [];
  }

  return rows.map(mapSkill).filter((skill): skill is SkillListItem => Boolean(skill)).slice(0, limit);
}

export async function getRecentSkills(limit = 4) {
  const rows = await fetchAllSkillRows();

  if (!rows) {
    return [];
  }

  return rows
    .map(mapSkill)
    .filter((skill): skill is SkillListItem => Boolean(skill))
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
    .slice(0, limit);
}

export async function getExploreSkills(filters: ExploreFilters = {}) {
  const rows = await fetchAllSkillRows();

  if (!rows) {
    return [];
  }

  const items = rows.map(mapSkill).filter((skill): skill is SkillListItem => Boolean(skill));
  return filterSkills(items, filters);
}

export async function getSkillBySlug(slug: string): Promise<SkillDetail | null> {
  if (!db || !isDatabaseConfigured) {
    return null;
  }

  try {
    const skill = await db.query.skills.findFirst({
      where: eq(skills.slug, slug),
      with: {
        author: true,
        currentVersion: true,
        parentFork: {
          with: {
            parentSkill: {
              with: {
                author: true,
              },
            },
          },
        },
        versions: {
          orderBy: (skillVersions, { desc: orderDesc }) => [orderDesc(skillVersions.createdAt)],
        },
      },
    });

    if (!skill || !skill.author || !skill.currentVersion) {
      return null;
    }

    const baseSkill = mapSkill(skill as SkillRecord);

    if (!baseSkill) {
      return null;
    }

    return {
      ...baseSkill,
      versions: skill.versions.map((version) => ({
        id: version.id,
        skillId: version.skillId,
        version: version.version,
        content: version.content,
        changelog: version.changelog,
        compatibleWith: version.compatibleWith,
        metadata: version.metadata,
        createdAt: toIso(version.createdAt),
      })),
    };
  } catch {
    return null;
  }
}

export async function getViewerStar(skillId: string, userId: string) {
  if (!db || !isDatabaseConfigured) {
    return null;
  }

  try {
    return await db.query.stars.findFirst({
      where: and(eq(stars.skillId, skillId), eq(stars.userId, userId)),
    });
  } catch {
    return null;
  }
}

export async function getProfileByUsername(username: string): Promise<ProfileData | null> {
  if (!db || !isDatabaseConfigured) {
    return null;
  }

  try {
    const user = await db.query.users.findFirst({
      where: eq(users.username, username),
      with: {
        skills: {
          with: {
            author: true,
            currentVersion: true,
            parentFork: {
              with: {
                parentSkill: {
                  with: {
                    author: true,
                  },
                },
              },
            },
          },
          orderBy: (skillsTable, { desc: orderDesc }) => [
            orderDesc(skillsTable.starsCount),
            orderDesc(skillsTable.updatedAt),
          ],
        },
      },
    });

    if (!user) {
      return null;
    }

    const publicUser: PublicUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      website: user.website,
      xUrl: user.xUrl,
      createdAt: toIso(user.createdAt),
    };

    return {
      user: publicUser,
      skills: user.skills
        .map((skill) => mapSkill(skill as SkillRecord))
        .filter((skill): skill is SkillListItem => Boolean(skill)),
    };
  } catch {
    return null;
  }
}

export async function getUserById(userId: string) {
  if (!db || !isDatabaseConfigured) {
    return null;
  }

  try {
    return await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
  } catch {
    return null;
  }
}

export async function hasUserStarredSkill(userId: string, skillId: string) {
  if (!db || !isDatabaseConfigured) {
    return false;
  }

  try {
    const existingStar = await db.query.stars.findFirst({
      where: and(eq(stars.userId, userId), eq(stars.skillId, skillId)),
    });

    return Boolean(existingStar);
  } catch {
    return false;
  }
}
