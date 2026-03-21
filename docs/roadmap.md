# Roadmap

Planned and under-consideration work. Nothing here is committed scope—priorities can change.

## Under consideration

- **Optional `@supabase/supabase-js`**: Keep **Drizzle + `DATABASE_URL`** as the source of truth for relational data, auth (Better Auth), and migrations. Add `supabase-js` later only if we need **Storage**, **Realtime**, or other **HTTP APIs** without reimplementing them. Would **not** replace Drizzle for core queries unless we deliberately move to a PostgREST + RLS model (large architectural change).

## Production / ops

- **Deploy** (Vercel, Railway, Fly, etc.) with production `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_SECRET`.
- **Run `pnpm db:migrate` once** against the production database (CI or manual).
- **Email** for Better Auth (verification, password reset) when we outgrow password-only flows—wire a provider in `lib/auth.ts` when needed.

## Product (ideas)

- Optional **seed** or import path for demo skills (currently registry starts empty).
- **Profile editing** / settings route if we want in-app bio and links again.

---

Track ad-hoc tasks in your issue tracker; this file is the high-level plan for the repo.
