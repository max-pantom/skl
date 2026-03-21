# SKL

Minimal MVP foundation for a registry of portable AI skills.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL
- Drizzle ORM

No `shadcn/ui` is included. The UI uses plain Tailwind and custom components.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL`.
3. Install dependencies with `pnpm install`.
4. Run migrations with `pnpm db:migrate`.
5. Seed sample data with `pnpm db:seed`.
6. Start the app with `pnpm dev`.

If `DATABASE_URL` is not set, the app falls back to local demo data so the shell still renders.

## Current foundation

- App shell and navigation
- Main browse routes
- Skill detail and version history pages
- Raw markdown download endpoint
- Drizzle schema and initial SQL migration
- Seed script with authors, skills, versions, stars, downloads, and a fork relationship

## Next phase

- Authentication
- Publish and edit mutations
- Star and fork actions
- Better search
- Settings and profile editing
