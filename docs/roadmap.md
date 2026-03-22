# SKL Roadmap (refined with real signals)

This is not feature dumping. It is staged to match how the product should evolve. Nothing here is committed scope—priorities can change.

## Phase 0 — Foundation (what you already have)

**Goal:** prove people will publish and browse.

### Core

- Auth (Better Auth)
- Publish skill (markdown)
- Skill page
- Profiles
- Star / fork / download
- Version history
- Explore page (search + categories)

### Add immediately (low effort, high impact)

- Example input/output on skill page
- “Copy raw skill” button
- Better metadata display (tags, compatibility)

## Phase 1 — Trust + Clarity layer

**Goal:** make skills understandable and credible.

### Skill page upgrades

- Input → output examples (required)
- “What this skill does” section
- Version notes visible
- Author card (clear identity)

### Profile upgrades

- Pinned skills
- Total downloads / stars
- “Verified creator” (manual at first)

### Discovery upgrades

- Trending skills
- Newest skills
- Top creators

## Phase 2 — Execution (critical unlock)

**Goal:** move from read-only → usable.

### Core feature

- **Run skill** button

### On skill page

- Input box
- Run
- Output panel

### Implementation (keep simple)

- Send skill content + input → model API
- Return result
- No infra complexity yet

### UX

- Instant feedback
- Loading state
- Show raw prompt + result

## Phase 3 — Iteration loop (this is where it becomes powerful)

**Goal:** skills evolve inside the platform.

### Add

- Edit skill in browser
- Save as new version
- Fork + edit instantly
- Compare outputs between versions

### This creates

- Evolution
- Experimentation
- Better skills over time

## Phase 4 — Creator system

**Goal:** turn users into builders.

### Add

- Collections (group skills)
- Follow creators
- Creator pages feel like portfolios
- Notifications (new versions, forks)

## Phase 5 — Runtime layer (future, don’t rush)

**Goal:** SKL becomes a system, not just a registry.

## Phase 6 - Cli

### Add later

- Multi-step skills (chains)
- Tool usage (APIs, actions)
- Agent compatibility
- Install to external agents



## What NOT to build yet

- CI/CD pipelines
- Blockchain
- Complex execution infra
- Full Replit-like IDE

You’ll get there, but too early = death.

---

## Platform / ops (parallel, not a “phase”)

- **Deploy** (Vercel, Railway, Fly, etc.) with production `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `BETTER_AUTH_SECRET`.
- **Run `pnpm db:migrate` once** against the production database (CI or manual).
- **Optional `@supabase/supabase-js`**: keep **Drizzle + `DATABASE_URL`** as the source of truth for relational data, auth (Better Auth), and migrations. Add `supabase-js` only if we need **Storage**, **Realtime**, or other **HTTP APIs** without reimplementing them. Would **not** replace Drizzle for core queries unless we deliberately move to a PostgREST + RLS model (large architectural change).
- **Email** for Better Auth (verification, password reset) when we outgrow password-only flows—wire a provider in `lib/auth.ts` when needed.

Track ad-hoc tasks in your issue tracker; this file is the high-level plan for the repo.
