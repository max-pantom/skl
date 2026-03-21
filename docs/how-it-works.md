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
- Profile: [app/settings/page.tsx](/Users/macbook/Desktop/code/skill/app/settings/page.tsx) (`/settings`, linked from the header when signed in)

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
- `updateProfileAction`
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
2. Set `DATABASE_URL` to a **Postgres URI** (not `NEXT_PUBLIC_SUPABASE_URL` from the App Frameworks tab).
3. **Prefer the pooler URI** if **Direct** (`db.*.supabase.co:5432`) times out—common on **IPv4-only** networks: **Settings → Database → ORMs → Drizzle** and copy the `DATABASE_URL` line (`…pooler.supabase.com:6543`, user `postgres.<project-ref>`). This app uses `postgres.js` with `prepare: false`, which matches PgBouncer.
4. You do **not** need `@supabase/supabase-js` for queries; Drizzle talks to Postgres over `DATABASE_URL`. Future optional use of `supabase-js` for Storage/Realtime is noted in [roadmap.md](./roadmap.md).
5. Set `BETTER_AUTH_SECRET`.
6. Run migrations (`pnpm db:migrate`).
7. Start the app.

Example:

```bash
pnpm install
pnpm db:migrate
pnpm dev
```

## If Supabase Direct times out (IPv4 / “need IPv4 add-on”)

- **Direct** URLs use host `db.<ref>.supabase.co` and port **5432**. That path is often **IPv6-first**; Supabase’s optional **IPv4 add-on** is only for that route.
- **Pooler** URLs use host `*.pooler.supabase.com` and port **6543** (from **Database → ORMs → Drizzle**). That route is usually fine on **IPv4 without the add-on** — it is not the same as Direct.
- **Leave Supabase entirely** (no code changes beyond `DATABASE_URL`): use **Neon**, **Railway Postgres**, **Render**, **Fly Postgres**, or any managed Postgres. Drizzle migrations and Better Auth work the same.
- **One-off migrate from IPv6**: run `pnpm db:migrate` from CI or a machine with IPv6, or set `SKL_ALLOW_SUPABASE_DIRECT=1` only if Direct actually works on your network.

## Production

**Environment**

- Set `NEXT_PUBLIC_APP_URL` to the **live** origin (e.g. `https://yourdomain.com`).
- Set `BETTER_AUTH_SECRET` to a **new** long random value in production (never reuse dev).
- Optionally set `BETTER_AUTH_URL` to the same origin if the app is not at the root of that host.
- Point `DATABASE_URL` at your **production** Postgres; run `pnpm db:migrate` once against that database (CI step or manual from a trusted machine).

**Direct connection vs pooler**

- **Direct** (`db.*.supabase.co:5432`, or Neon’s non-pooler host) is fine when the app runs as **one or a few long‑lived Node processes** (Docker on a VM, Railway/Fly with low replica count). You get a single client pool inside each process—no extra moving parts.
- **Serverless** (e.g. many concurrent Vercel functions) opens **many** short-lived clients. Postgres has a low **max connections** limit; without **some** pooling layer (host’s pooler URL, Neon’s serverless-friendly endpoint, or an external pooler), you risk **intermittent “too many connections”** errors under traffic—not something this repo special-cases for you.

So: skipping the pooler is reasonable **if** your production topology is “always-on Node, few replicas.” If you deploy pure serverless at scale, the headache you avoid upfront often becomes **production incidents**; the smallest fix is usually **one** pooler URL from the provider, not app rewrites.

## Practical Rule

- Better Auth is auth.
- Supabase is the database host.
- Real data comes from the database only.
