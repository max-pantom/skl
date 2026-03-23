# SKL Roadmap

This roadmap is split into two parts:

1. completed work already shipped in the repo
2. active roadmap in priority order so execution does not drift behind registry work

The product shape is now clear:

- Layer 1: Registry
- Layer 2: Execution
- Layer 3: Evolution
- Layer 4: Identity
- Layer 5: Distribution

## Completed

### Foundation shipped

- [x] Auth (Better Auth)
- [x] Publish skill (markdown + multi-file)
- [x] Skill page
- [x] Profiles
- [x] Explore page (search + categories)
- [x] Star / fork / download
- [x] Version history
- [x] Copy raw skill button
- [x] Better metadata display (tags, compatibility)

### Trust shipped

- [x] “What this skill does” section
- [x] Version notes visible
- [x] Author card
- [x] Browse former version contents
- [x] Trending skills
- [x] Newest skills
- [x] Total downloads / stars on profiles
- [x] Profile share metadata
- [x] Branded profile OG image

### Evolution shipped

- [x] Edit skill in browser
- [x] Save as new version
- [x] Fork + edit instantly
- [x] Auto-bump version when left blank
- [x] Manual version must be higher than current
- [x] Quick version bump actions (`+1.0.0`, `+0.1.0`, `+0.0.1`)

### Identity shipped

- [x] Claim flow on a single route
- [x] Email OTP verification flow
- [x] Passport page for verified users
- [x] Share passport
- [x] Download passport as PNG
- [x] Settings entry to passport

### Platform shipped

- [x] Production DB migration path
- [x] Better Auth email verification wiring
- [x] Shared loading state pattern
- [x] Basic CLI install flow

## Active roadmap

## Phase 1 — Trust + Structure

**Goal:** make skills understandable, credible, and consistent before execution is added everywhere.

### Skill page

- [ ] Example input/output on skill page
- [ ] Input/output required before publish
- [ ] “Why this is good” signals:
  - [ ] has examples
  - [ ] recently updated
  - [ ] popular

### Skill structure enforcement

- [ ] Pre-filled skill template in editor
- [ ] Required sections before publish:
  - [ ] `## What this does`
  - [ ] `## Input`
  - [ ] `## Output`
  - [ ] `## Instructions`
  - [ ] `## Example`
- [ ] Validation checklist before publish

### Discovery

- [ ] Top creators module
- [ ] Most forked skills
- [ ] Recently improved skills
- [ ] Skills with examples filter

### Profile

- [ ] Pinned skills
- [ ] Verified creator badge / system

## Phase 1.5 — Execution

**Goal:** make skills immediately usable, not just readable.**

Execution moves earlier than before because without it there is no real retention, proof, or feedback loop.

### Skill page execution

- [ ] Run skill button
- [ ] Input box
- [ ] Output panel
- [ ] Basic API call execution
- [ ] Show raw prompt + result
- [ ] Loading state for skill execution

### Editor execution

- [ ] Run skill inside editor
- [ ] Input box inside editor
- [ ] Output panel inside editor
- [ ] Show last run result

### Test cases

- [ ] Skill test cases
- [ ] Save test cases with the skill
- [ ] Run all tests against a version
- [ ] Use tests as part of version comparison later

## Phase 2 — Iteration loop

**Goal:** make SKL the place where behavior is engineered and improved over time.**

### Version-aware iteration

- [ ] Compare outputs between versions
- [ ] Re-run previous inputs
- [ ] Save reusable test cases
- [ ] Review changes before publishing

### Editor diff plan

- [ ] Show file-level diff between current draft and latest published version
- [ ] Show version-to-version diff from version history
- [ ] Highlight added / removed / changed files before publishing
- [ ] Markdown-aware diff for `SKILL.md`
- [ ] Plain text diff for non-markdown files
- [ ] “Compare against” selector in the editor (`latest`, previous version, chosen version)
- [ ] Copy diff / share diff link

## Phase 3 — Creator system

**Goal:** turn users into builders with depth, reputation, and repeat engagement.**

### Creator depth

- [ ] Skill collections (stacks)
- [ ] Follow creators
- [ ] Creator pages feel like portfolios
- [ ] Creator ranking based on usage
- [ ] Notifications for new versions / forks

## Phase 4 — Identity / Passport

**Goal:** make accounts feel owned, shareable, and trustworthy.**

### Passport

- [ ] Passport OG image
- [ ] Stronger delivery/error messaging for verification mail
- [ ] Resend cooldown / resend countdown

Identity stays. It becomes reputation, ownership, and distribution later.

## Phase 5 — Distribution / CLI

**Goal:** SKL works from the terminal as both a registry client and a publishing tool.**

### Download / install

- [ ] Version-aware CLI polish
- [ ] Install a specific file from a version
- [ ] `skl inspect <slug>` for metadata, files, versions, author
- [ ] `skl diff <slug>@a <slug>@b` for version comparison
- [ ] Better bundle inspection / debugging

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

## Phase 6 — Runtime layer

**Goal:** SKL becomes a system, not just a registry.**

- [ ] Multi-step skills (chains)
- [ ] Tool usage (APIs, actions)
- [ ] Agent compatibility
- [ ] Install to external agents

## Current priorities

### Now

- [ ] Example input/output on skill page
- [ ] Skill structure enforcement
- [ ] Pinned skills on profile
- [ ] Top creators module

### Then

- [ ] Run skill on skill page
- [ ] Input + output
- [ ] Run skill inside editor

### After that

- [ ] First editor diff view
- [ ] Compare versions in the UI
- [ ] Collections

## Platform / ops

- [ ] Production deploy checklist cleanup
- [ ] Error logging / observability
- [ ] Background jobs if email / analytics volume grows

## What not to build yet

- [ ] CI/CD pipelines for skill content
- [ ] Blockchain anything
- [ ] Complex execution infra
- [ ] Full IDE / Replit-style environment
