# How It Works

## Stack Roles

SKL splits responsibilities clearly:

- Better Auth handles authentication and sessions.
- Supabase can host the PostgreSQL database.
- Drizzle owns the schema, migrations, and queries.

No Supabase Auth client keys are used in this app.

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
```

- `DATABASE_URL`: database connection string for Drizzle and Better Auth.
- `NEXT_PUBLIC_APP_URL`: canonical app URL for links and auth callbacks.
- `BETTER_AUTH_SECRET`: session signing secret, minimum 32 characters.

## Database Shape

Schema: [db/schema.ts](/Users/macbook/Desktop/code/skill/db/schema.ts)

Auth tables:

- `users`
- `sessions`
- `accounts`
- `verifications`

Product tables:

- `skills`
- `skill_versions`
- `stars`
- `downloads`
- `forks`

The same `users` table stores both auth identity data and public profile data.

## Auth Flow

Server auth config lives in [lib/auth.ts](/Users/macbook/Desktop/code/skill/lib/auth.ts).

Key functions:

- `getAuth()`
- `getAuthSession()`
- `getCurrentViewer()`
- `requireCurrentViewer()`

Auth route:

- [app/api/auth/[...all]/route.ts](/Users/macbook/Desktop/code/skill/app/api/auth/[...all]/route.ts)

Client auth helper:

- [lib/auth-client.ts](/Users/macbook/Desktop/code/skill/lib/auth-client.ts)

Current auth UI:

- [app/login/page.tsx](/Users/macbook/Desktop/code/skill/app/login/page.tsx)
- [app/signup/page.tsx](/Users/macbook/Desktop/code/skill/app/signup/page.tsx)
- [components/email-login-form.tsx](/Users/macbook/Desktop/code/skill/components/email-login-form.tsx)
- [components/email-signup-form.tsx](/Users/macbook/Desktop/code/skill/components/email-signup-form.tsx)
- [components/sign-out-button.tsx](/Users/macbook/Desktop/code/skill/components/sign-out-button.tsx)

## Data Access

Database setup lives in [db/index.ts](/Users/macbook/Desktop/code/skill/db/index.ts).

Important behavior:

- If `DATABASE_URL` exists, the app connects to Postgres.
- If the database is unavailable, list pages return empty states instead of fake seeded content.
- The app no longer includes built-in demo data or a seed script.

Data queries live in [lib/data.ts](/Users/macbook/Desktop/code/skill/lib/data.ts).

## App Flows

Server actions live in [lib/actions.ts](/Users/macbook/Desktop/code/skill/lib/actions.ts).

Implemented flows:

- `createSkillAction`
- `toggleStarAction`
- `forkSkillAction`

Additional profile/edit flows may exist in adjacent route work, but the source of truth for server mutations is still `lib/actions.ts`.

## Raw Downloads

Raw markdown endpoint:

- [app/api/skills/[slug]/raw/route.ts](/Users/macbook/Desktop/code/skill/app/api/skills/[slug]/raw/route.ts)

It returns the skill markdown and records a download event.

## Migrations

Migration runner:

- [scripts/migrate.ts](/Users/macbook/Desktop/code/skill/scripts/migrate.ts)

Command:

```bash
pnpm db:migrate
```

## Running With Supabase

1. Create a Supabase project.
2. Copy the Postgres connection string from the database settings.
3. Put it in `DATABASE_URL`.
4. Set `BETTER_AUTH_SECRET`.
5. Run migrations.
6. Start the app.

Example:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## Practical Rule

- Better Auth is auth.
- Supabase is the database host.
- Real data comes from the database only.
