# SKL Roadmap

This is the working product checklist for the repo. Completed items are marked, active items stay open, and near-term work is grouped so it is obvious what to build next.

## Phase 0 — Foundation

**Goal:** prove people will publish and browse.

### Core

- [x] Auth (Better Auth)
- [x] Publish skill (markdown + multi-file)
- [x] Skill page
- [x] Profiles
- [x] Star / fork / download
- [x] Version history
- [x] Explore page (search + categories)

### Low effort / high impact

- [ ] Example input/output on skill page
- [x] Copy raw skill button
- [x] Better metadata display (tags, compatibility)

## Phase 1 — Trust + Clarity layer

**Goal:** make skills understandable and credible.

### Skill page upgrades

- [ ] Input -> output examples
- [x] “What this skill does” section
- [x] Version notes visible
- [x] Author card (clear identity)
- [x] Browse former version contents

### Profile upgrades

- [ ] Pinned skills
- [x] Total downloads / stars
- [ ] Verified creator badge / system
- [x] Profile share metadata
- [x] Branded profile OG image

### Discovery upgrades

- [x] Trending skills
- [x] Newest skills
- [ ] Top creators module

## Phase 2 — Execution

**Goal:** move from read-only to usable.

### Core feature

- [ ] Run skill button

### On skill page

- [ ] Input box
- [ ] Run
- [ ] Output panel

### Implementation

- [ ] Send skill content + input to model API
- [ ] Return result
- [ ] Keep infra simple

### UX

- [x] Shared loading state pattern
- [ ] Loading state for skill execution
- [ ] Show raw prompt + result

## Phase 3 — Iteration loop

**Goal:** skills evolve inside the platform.

### Add

- [x] Edit skill in browser
- [x] Save as new version
- [x] Fork + edit instantly
- [ ] Compare outputs between versions
- [x] Auto-bump version when left blank
- [x] Manual version must be higher than current

### Editor diff plan

- [ ] Show file-level diff between current draft and latest published version
- [ ] Show version-to-version diff from version history
- [ ] Highlight added / removed / changed files before publishing
- [ ] Markdown-aware diff for `SKILL.md`
- [ ] Plain text diff for non-markdown files
- [ ] “Review changes” step before publishing an update
- [ ] “Compare against” selector in the editor (`latest`, previous version, chosen version)
- [ ] Copy diff / share diff link for collaborator review

## Phase 4 — Creator system

**Goal:** turn users into builders.

### Add

- [ ] Collections (group skills)
- [ ] Follow creators
- [ ] Creator pages feel like portfolios
- [ ] Notifications for new versions / forks

## Phase 5 — Identity / Passport

**Goal:** make accounts feel owned, shareable, and trustworthy.

### Claim + passport

- [x] Claim flow on a single route
- [x] Email OTP verification flow
- [x] Passport page for verified users
- [x] Share passport
- [x] Download passport as PNG
- [x] Settings entry to passport
- [ ] Passport OG image
- [ ] Stronger delivery/error messaging for verification mail
- [ ] Resend cooldown / resend countdown

## Phase 6 — Runtime layer

**Goal:** SKL becomes a system, not just a registry.

### Add later

- [ ] Multi-step skills (chains)
- [ ] Tool usage (APIs, actions)
- [ ] Agent compatibility
- [ ] Install to external agents

## Phase 7 — CLI

**Goal:** SKL works from the terminal as both a registry client and a publishing tool.

### Download / install

- [x] Basic install flow
- [ ] Version-aware CLI polish
- [ ] Install a specific file from a version
- [ ] Better bundle inspection / debugging
- [ ] `skl inspect <slug>` for metadata, files, versions, author
- [ ] `skl diff <slug>@a <slug>@b` for version comparison

### Upload / publish

- [ ] `skl publish` from a local folder or `SKILL.md`
- [ ] `skl update` to push a new version from the local project
- [ ] Authenticated CLI publishing with token / session flow
- [ ] Dry-run validation before upload
- [ ] Preview the computed next version before publish
- [ ] Push multi-file skills from the CLI

### Local project workflow

- [ ] Pull a skill into a project with `skl install`
- [ ] Edit locally inside the project
- [ ] Diff local files against the published version
- [ ] Upload back to SKL with `skl update` or `skl publish`
- [ ] Round-trip metadata updates from the CLI

### Targets / integrations

- [ ] Better target presets (`cursor`, local project, custom path)
- [ ] Upload from installed local target back to the registry
- [ ] Machine-readable JSON output for scripts
- [ ] Non-interactive mode for CI / automation

## Platform / ops

- [x] Production DB migration path
- [x] Better Auth email verification wiring
- [ ] Production deploy checklist cleanup
- [ ] Error logging / observability
- [ ] Background jobs if email / analytics volume grows

## Current TODO

### Next up

- [ ] Add inline version validation feedback in the skill edit form
- [x] Add quick version bump actions (`+1.0.0`, `+0.1.0`, `+0.0.1`)
- [ ] Add example input/output blocks to skill pages
- [ ] Add passport OG image
- [ ] Harden OTP verification UX and resend behavior
- [ ] Add first editor diff view
- [ ] Add first CLI upload flow

### Nice after that

- [ ] Top creators on discovery/home
- [ ] Pinned skills on profile
- [ ] Compare versions in the UI
- [ ] CLI inspect / diff commands
- [ ] Creator verification system

## What not to build yet

- [ ] CI/CD pipelines for skill content
- [ ] Blockchain anything
- [ ] Complex execution infra
- [ ] Full IDE / Replit-style environment
