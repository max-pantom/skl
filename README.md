# SKL

GitHub for AI prompts. Version control and sharing for AI skills.

## What it does

A registry where users can publish, version, and fork AI skills like code. Browse by category and author, see version history, and download raw markdown with visible authorship.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Better Auth
- PostgreSQL
- Drizzle ORM

Supabase is only the Postgres host in this setup. Supabase Auth is not used.

## Required Environment

Copy `.env.example` to `.env` and set:

```env
DATABASE_URL=postgres://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-long-random-secret
```

## Local Setup

Use any Postgres you already run (Homebrew, Postgres.app, a cloud URL from Supabase, etc.). Point **`DATABASE_URL`** at it, then:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

Optional: set **`AUTH_VERBOSE=1`** in `.env` to print Better Auth logs in the terminal (see `.env.example`).

## Avatar Utilities

Generate a batch of PNG avatars:

```bash
pnpm avatars:generate
```

Turn a folder of PNG avatars into a single animated GIF:

```bash
pnpm avatars:gif -- --in-dir generated-avatars --out-file generated-avatars/avatars.gif
```

By default the GIF uses a `100ms` frame delay and loops forever. You can override those with `--delay` and `--repeat`, or pass `--loop` explicitly.

By default the GIF places each PNG centered inside a white `600x600` frame. You can override that with `--frame-size`, `--frame-width`, or `--frame-height`.

If you need transparency instead, pass `--background transparent`, but the result will usually look softer because GIF only supports a 256-color palette and 1-bit transparency.

## Public API

Read-only JSON endpoints:

```bash
GET /api/skills?limit=20&q=prompt&category=coding&sort=recent
GET /api/skills/[slug]
GET /api/skills/[slug]/manifest
GET /api/skills/[slug]/bundle
GET /api/users?limit=20&q=ada
GET /api/users/[userId]
```

Notes:

- `sort` for skills supports `recent`, `newest`, and `trending`.
- Public APIs only return skills with `visibility: "public"`.
- `GET /api/skills/[slug]` returns the current version only by default; use `?include=versions` for full history.
- `GET /api/skills/[slug]/manifest` returns `slug`, `title`, `version`, and `files: [{ path, sha256 }]` (no download increment). Optional `?version=` pins a semver string.
- `GET /api/skills/[slug]/bundle` returns the same files with `content` and records **one** download event (used by `skl install`). Optional `?version=`.
- `POST /api/skills/[slug]/install` returns a JSON skill snapshot and records one download (legacy / alternate client shape).
- `/api/users/[userId]` returns the user plus their public authored skills and aggregate stats.

### CLI (`skl install`)

The `@sklx/cli` workspace package exposes the `skl` binary (linked as a root dev dependency). Build first, then run via `pnpm exec`:

```bash
pnpm install
pnpm cli:build
pnpm exec skl install my-skill --registry http://localhost:3000
pnpm exec skl i my-skill@1.0.0 -o ./skills/my-skill
pnpm exec skl install my-skill --target cursor
```

- Registry: `--registry` or `SKL_REGISTRY` (defaults to `http://localhost:3000` for local dev; set to your production `NEXT_PUBLIC_APP_URL` when installing from a deployed registry).
- Auth (reserved): `SKL_TOKEN` or `-t, --token` sends `Authorization: Bearer …` for future private-registry support.
- Default output: `./.skl/skills/<slug>/`. `--target cursor` writes to `~/.cursor/skills/<slug>/`.

## Claim Flow

`/claim` is a dedicated email verification funnel. It collects email, username, display name, and password, sends a verification email, and keeps the full claim flow on `/claim`, including the verified card state.

The generated card can be shared from the browser or saved from:

```bash
GET /api/users/[userId]/claim-card.svg
```

This flow requires transactional email:

```env
RESEND_API_KEY=re_...
EMAIL_FROM=SKL <onboarding@your-domain.com>
```

### After migrations are applied

1. Ensure `.env` has **`BETTER_AUTH_SECRET`** (32+ random characters) — not optional for sign-up / publish.
2. Run **`pnpm dev`**, open **`/signup`**, create an account, then **`/new`** to publish a skill.
3. For production: set the same variables on the host, point **`NEXT_PUBLIC_APP_URL`** at the live site, run **`pnpm db:migrate`** once against the production database, then deploy.

There is no seed script anymore. The registry starts empty until real users publish skills.

## Important Behavior

- Browse pages read from the database only.
- If the database is unavailable, list pages render empty states instead of fake sample content.
- Auth, publish, star, fork, and profile updates require both `DATABASE_URL` and `BETTER_AUTH_SECRET`.

## Database

Schema: [db/schema.ts](/Users/macbook/Desktop/code/skill/db/schema.ts)

Migration runner: [scripts/migrate.ts](/Users/macbook/Desktop/code/skill/scripts/migrate.ts)

Core tables:

- `users`
- `sessions`
- `accounts`
- `verifications`
- `skills`
- `skill_versions`
- `stars`
- `downloads`
- `forks`

## Docs

- [docs/how-it-works.md](/Users/macbook/Desktop/code/skill/docs/how-it-works.md) — stack, env, Supabase vs pooler, auth.
- [docs/roadmap.md](/Users/macbook/Desktop/code/skill/docs/roadmap.md) — phased product roadmap (foundation → trust/clarity) and platform notes.
