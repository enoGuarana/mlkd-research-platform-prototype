# Codex Handoff Summary

Generated at: `2026-07-15T10:09:29.202Z`
Repository: `C:\Users\Enomoto\Downloads\mlkd-research-platform-prototype`
Branch: `main`

## How To Use This

Paste this summary into a new Codex/GPT session before asking it to continue work on this repository.

## Current Project Context

- Next.js 14 App Router application.
- Prisma with local SQLite for the current MVP.
- Admin area protected by signed HTTP-only session cookies.
- Admin CRUD for members, projects, publications, events, dissertations, and open positions.
- Publication ingestion through OpenAlex by DOI, title, OpenAlex ID, or URL from the UI, plus DOI ingestion from the CLI.
- Manual publication editing supports records without DOI or OpenAlex ID.
- Member photo uploads are stored under `public/uploads/members`.
- Target architecture includes PostgreSQL, pgvector, async workers, AI services, hybrid search, RAG, RBAC, and observability.

## Package

Name: `mlkd-research-platform-prototype`
Version: `1.0.0`

Scripts:
- dev: `next dev`
- build: `next build`
- start: `next start`
- db:generate: `prisma generate`
- db:migrate: `prisma migrate dev`
- db:seed: `node prisma/seed.js`
- ingest:publications: `node scripts/ingest-openalex.js`
- commit:auto: `node scripts/commit-auto.js`
- context:summary: `node scripts/context-summary.js`

Dependencies:
- @prisma/client@^6.19.0
- next@14.2.15
- prisma@^6.19.0
- react@18.3.1
- react-dom@18.3.1

## Git Status

```txt
## main...origin/main
```

## Latest Commits

```txt
31dc031 (HEAD -> main, origin/main, origin/HEAD) chore(docs): update docs workflow
72421e6 docs: rewrite README in English
ab9af02 feat(admin): add manual content management
770ac6c docs: define target platform architecture
cdadbad feat: add publication ingestion and CMS
c949053 chore: clean generated build artifacts
cf8a0f7 feat: migrate prototype to Next.js
dbfd7f7 feat: bootstrap static MLKD site
```

## Staged Diff Summary

```txt
No staged changes.
```

## Unstaged Diff Summary

```txt
No unstaged changes.
```

## Untracked Files

```txt
No untracked files.
```

## Important Files

- `README.md`
- `app/admin/page.js`
- `app/admin/publications/page.js`
- `app/api/publications/ingest/route.js`
- `components/AdminContentForms.js`
- `components/AdminIngestionPanel.js`
- `components/PublicationsPanel.js`
- `lib/admin-content-actions.js`
- `lib/auth.js`
- `lib/content.js`
- `lib/publications.js`
- `middleware.js`
- `prisma/schema.prisma`
- `lib/services/bibliographic/openalex.js`
- `scripts/ingest-openalex.js`
- `scripts/commit-auto.js`
- `scripts/context-summary.js`

## Recommended First Prompt

You are continuing work on the MLKD Research Platform Prototype.
Use the repository patterns already present in Next.js App Router, Prisma, server actions, and admin forms.
Before editing, inspect the relevant files listed in this handoff.
Keep commit messages in English using Conventional Commits.
Run the relevant validation commands before finishing.
