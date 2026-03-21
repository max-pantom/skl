import type { SkillCategory } from "./types";

type SeedUser = {
  id: string;
  email: string;
  emailVerified: boolean;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  website: string | null;
  xUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

type SeedSkill = {
  id: string;
  authorId: string;
  title: string;
  slug: string;
  summary: string;
  category: SkillCategory;
  tags: string[];
  visibility: "public" | "unlisted";
  currentVersionId: string;
  starsCount: number;
  downloadsCount: number;
  forksCount: number;
  createdAt: string;
  updatedAt: string;
};

type SeedSkillVersion = {
  id: string;
  skillId: string;
  version: string;
  content: string;
  changelog: string;
  compatibleWith: string[];
  inputSchema: Record<string, unknown>;
  metadata: Record<string, unknown>;
  createdAt: string;
};

type SeedStar = {
  id: string;
  userId: string;
  skillId: string;
  createdAt: string;
};

type SeedDownload = {
  id: string;
  userId: string | null;
  skillId: string;
  createdAt: string;
};

type SeedFork = {
  id: string;
  parentSkillId: string;
  childSkillId: string;
  userId: string;
  createdAt: string;
};

export const sampleUsers: SeedUser[] = [
  {
    id: "a1111111-1111-4111-8111-111111111111",
    email: "rhea@skl.dev",
    emailVerified: true,
    username: "rheakim",
    displayName: "Rhea Kim",
    bio: "Builds practical code-review and debugging skills for product teams.",
    avatarUrl: "RK",
    website: "https://skl.dev",
    xUrl: "https://x.com/rheakim",
    createdAt: "2025-11-18T09:00:00.000Z",
    updatedAt: "2026-03-10T09:30:00.000Z",
  },
  {
    id: "b2222222-2222-4222-8222-222222222222",
    email: "sol@skl.dev",
    emailVerified: true,
    username: "solmartin",
    displayName: "Sol Martin",
    bio: "Writes research and strategy skills that turn scattered notes into decisions.",
    avatarUrl: "SM",
    website: null,
    xUrl: "https://x.com/solmartin",
    createdAt: "2025-12-02T11:30:00.000Z",
    updatedAt: "2026-03-06T16:45:00.000Z",
  },
  {
    id: "c3333333-3333-4333-8333-333333333333",
    email: "amira@skl.dev",
    emailVerified: true,
    username: "amiraade",
    displayName: "Amira Ade",
    bio: "Sharpens writing and review workflows for shipping teams.",
    avatarUrl: "AA",
    website: "https://amira.work",
    xUrl: null,
    createdAt: "2026-01-12T08:15:00.000Z",
    updatedAt: "2026-03-12T07:40:00.000Z",
  },
];

const prReviewV1 = `# TypeScript PR Review

## Goal

Review a pull request for real regressions, type safety issues, and maintainability risk.

## Inputs

- PR title and summary
- Relevant diff or file list
- Existing tests, if any
- Linked issue or ticket

## Workflow

1. Restate the change in one sentence.
2. Identify the risky files and why they matter.
3. Check type contracts, nullability, and edge-case handling.
4. Look for behavior changes that the description does not acknowledge.
5. Flag missing or weak tests.

## Output

- Findings first, ordered by severity
- Open questions next
- A short change summary last

## Constraints

- Do not praise the code.
- Do not list style nits unless they hide a bug.
- Prefer precise file references over generic advice.
`;

const prReviewV2 = `# TypeScript PR Review

## Goal

Review a pull request for regressions, type safety issues, and maintainability risk without drifting into style-only feedback.

## Inputs

- PR title and summary
- Relevant diff or file list
- Existing tests, if any
- Linked issue or ticket

## Workflow

1. Rewrite the intended change in one sentence.
2. Identify risky files, data paths, and user-visible behavior shifts.
3. Check types, null handling, async flow, and error boundaries.
4. Compare tests against the failure modes introduced by the diff.
5. Report only the issues that materially affect correctness, safety, or maintainability.

## Output Contract

- Findings first, highest severity at the top
- Each finding includes impact, evidence, and a suggested direction
- Open questions next
- A short change summary last

## Constraints

- No generic praise
- No laundry list of tiny style issues
- Prefer exact file paths and lines when available
`;

const researchMemoV1 = `# Research Notes to Decision Memo

## Goal

Turn raw notes, links, and interview fragments into a short memo a product lead can use.

## Workflow

1. Group evidence into themes.
2. Mark what is direct evidence versus inference.
3. Name the decision that needs to be made.
4. Summarize three viable options.
5. Recommend one option with tradeoffs and confidence level.

## Output

- Executive summary
- Evidence by theme
- Options table
- Recommendation
- Unknowns
`;

const researchMemoV2 = `# Research Notes to Decision Memo

## Goal

Transform messy research inputs into a clean decision memo with evidence, options, and a recommendation.

## Workflow

1. Normalize the notes into themes and signals.
2. Separate direct quotes, quantitative evidence, and inferred conclusions.
3. Identify the decision owner and decision deadline.
4. Produce three options with tradeoffs, risks, and effort.
5. Recommend one path and explain why the alternatives fall short.

## Output Contract

- One-paragraph executive summary
- Evidence grouped by theme
- Options with pros, cons, and risk level
- Recommendation with confidence score
- Open questions that still block a confident call
`;

const toneAuditV1 = `# Landing Page Tone Audit

## Goal

Audit landing-page copy for clarity, credibility, and consistency.

## Workflow

1. Identify the target audience from the copy alone.
2. Highlight weak claims, vague language, and abrupt shifts in tone.
3. Rewrite the headline, subhead, and CTA in a calmer technical voice.
4. Suggest missing trust signals.

## Output

- Audience read
- Friction points
- Rewrite suggestions
- Trust gaps
`;

const uiAuditMd = `# UI Audit

## Goal
Review a screen or flow for hierarchy, affordance, and consistency.

## Workflow
1. Identify the primary user task.
2. Map visual hierarchy (what draws the eye first, second, third).
3. List friction: unclear labels, missing states, density issues.
4. Suggest concrete layout or copy tweaks.

## Output
- Severity-ordered findings
- Quick wins vs deeper fixes
`;

const bugTriageMd = `# Bug Triage

## Goal
Turn a messy bug report into a reproducible, prioritized ticket.

## Workflow
1. Extract environment, steps, expected vs actual.
2. Classify: regression, edge case, or unclear spec.
3. Propose severity and owner.
4. List missing information to request.

## Output
- Triage summary
- Recommended priority
- Follow-up questions
`;

const designCritiqueMd = `# Design Critique

## Goal
Give structured critique of a design (mockup or product) without personal taste.

## Workflow
1. Restate the problem the design solves.
2. Evaluate information architecture and flow.
3. Note accessibility and contrast risks.
4. Suggest alternatives that preserve intent.

## Output
- What works
- Risks and gaps
- 2–3 directional improvements
`;

const brandVoiceMd = `# Brand Voice Generator

## Goal
Produce on-brand copy from a short brief.

## Inputs
- Brand adjectives (3–5)
- Audience
- Channel (email, landing, in-app)
- Draft or bullet points

## Output
- Primary copy in brand voice
- One alternate tone (calmer or bolder)
- Words to avoid for this brand
`;

const prReviewFastlane = `# TypeScript PR Review Fastlane

## Goal

Fork of the TypeScript PR Review skill tuned for teams that need a fast first pass before deep review.

## Workflow

1. Summarize the change in one line.
2. Check for obvious breakpoints in types, data flow, and tests.
3. Flag anything that blocks merge.
4. Defer lower-risk refactors unless they affect correctness.

## Output

- Merge blockers
- Risks worth a second pass
- Tests that must be added before approval
`;

export const sampleSkills: SeedSkill[] = [
  {
    id: "d4444444-4444-4444-8444-444444444444",
    authorId: "a1111111-1111-4111-8111-111111111111",
    title: "TypeScript PR Review",
    slug: "typescript-pr-review",
    summary: "A focused review skill for catching regressions, type holes, and missing tests in TypeScript pull requests.",
    category: "coding",
    tags: ["typescript", "code-review", "pull-requests"],
    visibility: "public",
    currentVersionId: "e5555555-5555-4555-8555-555555555552",
    starsCount: 14,
    downloadsCount: 82,
    forksCount: 1,
    createdAt: "2026-01-18T10:00:00.000Z",
    updatedAt: "2026-03-10T09:30:00.000Z",
  },
  {
    id: "d4444444-4444-4444-8444-444444444445",
    authorId: "b2222222-2222-4222-8222-222222222222",
    title: "Research summarizer",
    slug: "research-summarizer",
    summary: "Turns research scraps into a short memo with evidence, options, and a recommendation.",
    category: "research",
    tags: ["research", "memo", "strategy"],
    visibility: "public",
    currentVersionId: "e5555555-5555-4555-8555-555555555554",
    starsCount: 11,
    downloadsCount: 57,
    forksCount: 0,
    createdAt: "2026-02-02T13:00:00.000Z",
    updatedAt: "2026-03-06T16:45:00.000Z",
  },
  {
    id: "d4444444-4444-4444-8444-444444444446",
    authorId: "c3333333-3333-4333-8333-333333333333",
    title: "Landing page copywriter",
    slug: "landing-page-copywriter",
    summary: "Audits and rewrites landing copy for clarity, credibility, and tonal consistency without hype.",
    category: "writing",
    tags: ["copywriting", "audit", "marketing"],
    visibility: "public",
    currentVersionId: "e5555555-5555-4555-8555-555555555555",
    starsCount: 7,
    downloadsCount: 33,
    forksCount: 0,
    createdAt: "2026-02-14T08:20:00.000Z",
    updatedAt: "2026-03-01T10:15:00.000Z",
  },
  {
    id: "d4444444-4444-4444-8444-444444444447",
    authorId: "c3333333-3333-4333-8333-333333333333",
    title: "TypeScript PR Review Fastlane",
    slug: "typescript-pr-review-fastlane",
    summary: "A faster fork of the original PR review skill for merge-blocker detection under time pressure.",
    category: "coding",
    tags: ["typescript", "fork", "review"],
    visibility: "public",
    currentVersionId: "e5555555-5555-4555-8555-555555555556",
    starsCount: 5,
    downloadsCount: 21,
    forksCount: 0,
    createdAt: "2026-03-11T09:10:00.000Z",
    updatedAt: "2026-03-12T07:40:00.000Z",
  },
];

export const sampleSkillVersions: SeedSkillVersion[] = [
  {
    id: "e5555555-5555-4555-8555-555555555551",
    skillId: "d4444444-4444-4444-8444-444444444444",
    version: "1.0.0",
    content: prReviewV1,
    changelog: "Initial release of the review workflow.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["summary", "diff"],
      properties: {
        summary: { type: "string" },
        diff: { type: "string" },
      },
    },
    metadata: {
      tone: "technical",
      output: "review",
    },
    createdAt: "2026-01-18T10:00:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555552",
    skillId: "d4444444-4444-4444-8444-444444444444",
    version: "1.2.0",
    content: prReviewV2,
    changelog: "Tightened the output contract and added explicit async and error-flow checks.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["summary", "diff"],
      properties: {
        summary: { type: "string" },
        diff: { type: "string" },
        tests: { type: "string" },
      },
    },
    metadata: {
      tone: "technical",
      output: "review",
    },
    createdAt: "2026-03-10T09:30:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555553",
    skillId: "d4444444-4444-4444-8444-444444444445",
    version: "0.9.0",
    content: researchMemoV1,
    changelog: "Private draft promoted to public beta.",
    compatibleWith: ["GPT-5", "Gemini 2.5", "Claude 4"],
    inputSchema: {
      type: "object",
      required: ["notes"],
      properties: {
        notes: { type: "string" },
      },
    },
    metadata: {
      tone: "analytical",
      output: "memo",
    },
    createdAt: "2026-02-02T13:00:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555554",
    skillId: "d4444444-4444-4444-8444-444444444445",
    version: "1.0.0",
    content: researchMemoV2,
    changelog: "Expanded the options analysis and added confidence scoring.",
    compatibleWith: ["GPT-5", "Gemini 2.5", "Claude 4"],
    inputSchema: {
      type: "object",
      required: ["notes", "decisionOwner"],
      properties: {
        notes: { type: "string" },
        decisionOwner: { type: "string" },
      },
    },
    metadata: {
      tone: "analytical",
      output: "memo",
    },
    createdAt: "2026-03-06T16:45:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555555",
    skillId: "d4444444-4444-4444-8444-444444444446",
    version: "1.0.0",
    content: toneAuditV1,
    changelog: "Initial release.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["copy"],
      properties: {
        copy: { type: "string" },
      },
    },
    metadata: {
      tone: "calm",
      output: "audit",
    },
    createdAt: "2026-03-01T10:15:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555556",
    skillId: "d4444444-4444-4444-8444-444444444447",
    version: "1.0.0",
    content: prReviewFastlane,
    changelog: "Forked from TypeScript PR Review and simplified for fast blocker checks.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["summary", "diff"],
      properties: {
        summary: { type: "string" },
        diff: { type: "string" },
      },
    },
    metadata: {
      tone: "technical",
      output: "review",
      forkMode: "fastlane",
    },
    createdAt: "2026-03-12T07:40:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555557",
    skillId: "d4444444-4444-4444-8444-444444444448",
    version: "1.0.0",
    content: uiAuditMd,
    changelog: "Initial release.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["context"],
      properties: {
        context: { type: "string" },
      },
    },
    metadata: { tone: "direct", output: "audit" },
    createdAt: "2026-03-08T14:00:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555558",
    skillId: "d4444444-4444-4444-8444-444444444449",
    version: "1.0.0",
    content: bugTriageMd,
    changelog: "Initial release.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["report"],
      properties: {
        report: { type: "string" },
      },
    },
    metadata: { tone: "technical", output: "ticket" },
    createdAt: "2026-03-09T16:20:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555559",
    skillId: "d4444444-4444-4444-8444-444444444450",
    version: "1.0.0",
    content: designCritiqueMd,
    changelog: "Initial release.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["designContext"],
      properties: {
        designContext: { type: "string" },
      },
    },
    metadata: { tone: "constructive", output: "critique" },
    createdAt: "2026-03-11T10:00:00.000Z",
  },
  {
    id: "e5555555-5555-4555-8555-555555555560",
    skillId: "d4444444-4444-4444-8444-444444444451",
    version: "1.0.0",
    content: brandVoiceMd,
    changelog: "Initial release.",
    compatibleWith: ["GPT-5", "Claude 4", "Codex"],
    inputSchema: {
      type: "object",
      required: ["brief"],
      properties: {
        brief: { type: "string" },
      },
    },
    metadata: { tone: "brand", output: "copy" },
    createdAt: "2026-03-13T09:00:00.000Z",
  },
];

export const sampleStars: SeedStar[] = [
  {
    id: "f6666666-6666-4666-8666-666666666661",
    userId: "b2222222-2222-4222-8222-222222222222",
    skillId: "d4444444-4444-4444-8444-444444444444",
    createdAt: "2026-03-10T10:00:00.000Z",
  },
  {
    id: "f6666666-6666-4666-8666-666666666662",
    userId: "c3333333-3333-4333-8333-333333333333",
    skillId: "d4444444-4444-4444-8444-444444444444",
    createdAt: "2026-03-10T10:05:00.000Z",
  },
  {
    id: "f6666666-6666-4666-8666-666666666663",
    userId: "a1111111-1111-4111-8111-111111111111",
    skillId: "d4444444-4444-4444-8444-444444444445",
    createdAt: "2026-03-06T18:00:00.000Z",
  },
  {
    id: "f6666666-6666-4666-8666-666666666664",
    userId: "b2222222-2222-4222-8222-222222222222",
    skillId: "d4444444-4444-4444-8444-444444444446",
    createdAt: "2026-03-02T11:00:00.000Z",
  },
];

export const sampleDownloads: SeedDownload[] = [
  {
    id: "a7777777-7777-4777-8777-777777777771",
    userId: "b2222222-2222-4222-8222-222222222222",
    skillId: "d4444444-4444-4444-8444-444444444444",
    createdAt: "2026-03-10T10:20:00.000Z",
  },
  {
    id: "a7777777-7777-4777-8777-777777777772",
    userId: null,
    skillId: "d4444444-4444-4444-8444-444444444444",
    createdAt: "2026-03-10T10:35:00.000Z",
  },
  {
    id: "a7777777-7777-4777-8777-777777777773",
    userId: "a1111111-1111-4111-8111-111111111111",
    skillId: "d4444444-4444-4444-8444-444444444445",
    createdAt: "2026-03-06T19:00:00.000Z",
  },
  {
    id: "a7777777-7777-4777-8777-777777777774",
    userId: "c3333333-3333-4333-8333-333333333333",
    skillId: "d4444444-4444-4444-8444-444444444445",
    createdAt: "2026-03-06T19:10:00.000Z",
  },
  {
    id: "a7777777-7777-4777-8777-777777777775",
    userId: null,
    skillId: "d4444444-4444-4444-8444-444444444447",
    createdAt: "2026-03-12T08:00:00.000Z",
  },
];

export const sampleForks: SeedFork[] = [
  {
    id: "b8888888-8888-4888-8888-888888888881",
    parentSkillId: "d4444444-4444-4444-8444-444444444444",
    childSkillId: "d4444444-4444-4444-8444-444444444447",
    userId: "c3333333-3333-4333-8333-333333333333",
    createdAt: "2026-03-11T09:10:00.000Z",
  },
];
