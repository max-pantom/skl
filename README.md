# SKL

Minimal MVP foundation for a registry of portable AI skills.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Better Auth
- PostgreSQL
- Drizzle ORM

No `shadcn/ui` is included. The UI uses plain Tailwind and custom components.

## Architecture

- Better Auth handles sign up, sign in, session cookies, and auth routes.
- Supabase is only the hosted PostgreSQL database in this setup.
- Drizzle owns the schema, migrations, and queries.
- If `DATABASE_URL` is missing, the app falls back to local demo data for browse pages.
- If `BETTER_AUTH_SECRET` is missing, auth-only flows like login, signup, publish, edit, star, fork, and settings stay disabled.

More detail is in [docs/how-it-works.md](/Users/macbook/Desktop/code/skill/docs/how-it-works.md).

## Environment

Copy `.env.example` to `.env` and set:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
DATABASE_URL=your-postgres-connection-string
```

For Supabase, `DATABASE_URL` should be your Supabase Postgres connection string. You do not need Supabase Auth keys because auth is handled by Better Auth in this app.

## Local Setup

Install dependencies:

```bash
pnpm install
```

Run in demo mode:

```bash
pnpm dev
```

Run against a real database:

```bash
pnpm db:migrate
pnpm db:seed
pnpm dev
```

Useful checks:

```bash
pnpm typecheck
pnpm build
```

## Current Product Surface

- Home and explore pages
- Signup and login with Better Auth
- User settings and public profiles
- Publish skill flow
- Skill page with star, fork, and raw download
- Version history
- Seeded sample content

## Database Notes

The schema includes:

- Better Auth tables: `users`, `sessions`, `accounts`, `verifications`
- Product tables: `skills`, `skill_versions`, `stars`, `downloads`, `forks`

Skill content is single-file markdown for the MVP. Downloads are generated from the current version content stored in the database.
