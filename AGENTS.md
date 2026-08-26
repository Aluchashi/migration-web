# AGENTS.md

## Known-broken main branch (read first)

- As of commit 66d2177, `npx tsc --noEmit` fails (~24 pre-existing errors) and `next build` fails with it. `npm run lint` passes. Don't assume type errors are caused by your change.
- Root cause: `app/` imports UI from `@/components/*`, but `components/` does not exist on `main`. The actual component sources were merged into `Pages/` (v0-style layout: `Pages/Page1-Homepage/home-hero.tsx`, `Pages/Elements/navbar.tsx`, ...) and export the same symbols.
- A working `components/` tree exists on branches `origin/Imran's-Tingle`, `origin/Imran's-Tingle-2`, `origin/feature/scam-risk`; also `lib/profile-options.ts` (imported by `Pages/Page4-Profile/profile-form.tsx`) exists only on `Imran's-Tingle`.
- Remaining non-import errors: implicit-any params in `Pages/Page4-Profile/profile-form.tsx`.

## Commands

```bash
npm run dev              # next dev
npm run build            # fails until the components/ issue above is fixed
npm run lint             # next lint
npx tsc --noEmit         # typecheck (no npm script for it)
npx prisma migrate dev   # or: npm run prisma:migrate
```

- No test framework is configured; verification = lint + `tsc --noEmit`.
- `postinstall` runs `prisma generate` automatically.

## Stack & structure

- Next.js 14 App Router + React 18, NextAuth v5 beta (`next-auth@5.0.0-beta.32`), Prisma 6 + PostgreSQL, Tailwind 3, OpenAI SDK. Path alias `@/*` → repo root.
- Route pages live in `app/` (thin server components that fetch data, then render client components). Client UI lives in `Pages/` (see broken-import note above) — do not confuse this with the Pages Router.
- Server actions are in `app/actions/{auth,profile}.ts`: `"use server"`, return `{ error?, fieldErrors? }` state objects for `useActionState`.
- Auth split: `auth.config.ts` is the edge-safe subset imported by `middleware.ts` (guards `/dashboard/:path*`); `auth.ts` adds the Credentials provider (username/email/phone login, bcrypt) and Prisma access — never import `auth.ts` from middleware/edge code. Session strategy is JWT with user id stored as `token.uid`.
- Use `getAuthenticatedUser()` from `lib/auth-user.ts` (marked `server-only`) for session+user lookups in server code.
- AI endpoints: `POST /api/ai/career-matcher` and `/api/ai/skill-gap` (runtime nodejs). They require an authenticated user with a saved profile, call `gpt-4o-mini` with `response_format: json_object`, validate responses through `lib/career-match.ts` / `lib/skill-gap.ts` parsers, and persist results to `CareerMatch` / `SkillGapReport`.

## Environment

- Copy `.env.example` → `.env.local`. `prisma.config.ts` loads `.env.local` first, then `.env`.
- Two Postgres URLs (Supabase pooler pattern): `DATABASE_URL` = transaction-mode pooler (`:6543...pgbouncer=true`) used by the app; `DIRECT_URL` = session-mode (`:5432`) used by migrations.
- `AUTH_SECRET`: generate with `npx auth secret`. `OPENAI_API_KEY`: server-only; the AI routes return 503 without it.
