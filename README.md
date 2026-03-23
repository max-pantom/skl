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
