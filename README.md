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

```bash
pnpm install
pnpm db:migrate
pnpm dev
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
- [docs/roadmap.md](/Users/macbook/Desktop/code/skill/docs/roadmap.md) — planned work (e.g. optional `supabase-js`, production checklist ideas).
