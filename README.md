# MLKD Research Platform Prototype

Prototype of a modular research platform for the Machine Learning and Knowledge Discovery group
at INESC-ID.

The project started as a public Next.js website and now includes a functional backend prototype:
admin authentication, institutional content management, DOI-based publication ingestion through
OpenAlex, manual publication editing, member photo uploads, Prisma persistence, and a searchable
public publication portal.

This README explains:

- what is implemented today
- how to run the project locally
- how the current system is organized
- the target architecture for PostgreSQL, pgvector, jobs, AI services, search, RAG, RBAC, and operations

## Product Goal

The platform is designed for four user groups:

- **Public visitors:** browse the group, team, projects, events, open positions, dissertations, and publications.
- **Researchers:** maintain their profiles, publications, projects, and research content.
- **Editors:** review metadata, summaries, snippets, visibility, and publication quality.
- **Administrators:** manage users, permissions, ingestion workflows, integrations, audit logs, and operations.

## Current Scope

Implemented:

- Public pages for About, Team, Projects, Publications, Dissertations, Events, and Open Positions.
- Protected admin area with local username/password authentication.
- Admin CRUD for members, projects, events, dissertations, open positions, and publications.
- Manual publication creation and editing.
- Member photo upload from the admin UI.
- Publication ingestion from the admin UI by DOI, title, OpenAlex ID, or URL.
- DOI ingestion from the CLI.
- DOI validation, bounded batches, OpenAlex retry/timeout handling, and structured ingestion errors.
- Editorial review gate for newly imported publications.
- OpenAlex client and metadata normalization.
- SQLite database managed by Prisma.
- Ingestion run and ingestion error tracking.
- Searchable public publications page with filters and selected-publication details.
- Static fallback data when the database is empty or unavailable.
- Commit message template and automatic commit helper.

Not implemented yet:

- Production PostgreSQL.
- pgvector embeddings.
- Real semantic search.
- Chat RAG.
- Background workers and a queue.
- Multi-user RBAC.
- Crossref, ORCID, and DBLP integrations.
- LLM summarization pipeline.
- Automated reindexing.
- Full observability.
- Automated tests.
- Deployment configuration.

## Target Architecture

```txt
┌─────────────────────────────────────────────────────────────┐
│                         USERS                               │
│ Public | Researcher | Editor | Administrator                │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                      │
│                                                             │
│  React Frontend                                             │
│  ├── Public website                                         │
│  ├── Publication portal                                     │
│  ├── Semantic search                                        │
│  ├── RAG chat                                               │
│  └── Admin dashboard                                        │
│                                                             │
│  BFF / Application Layer                                    │
│  ├── Route Handlers                                         │
│  ├── Server Actions                                         │
│  ├── Authentication and RBAC                                │
│  ├── Validation                                             │
│  └── Use-case orchestration                                 │
└───────────────┬──────────────────────┬──────────────────────┘
                │                      │
                │ synchronous          │ creates jobs
                ▼                      ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│ PostgreSQL + pgvector    │  │ QUEUE / ASYNC PROCESSING       │
│ Prisma                   │  │                               │
│                          │  │ Worker                        │
│ Institutional data       │  │ ├── Bibliographic ingestion   │
│ Scientific metadata      │  │ ├── Embedding generation      │
│ Users and permissions    │  │ ├── LLM summarization         │
│ Generated content        │  │ ├── Automated maintenance     │
│ Audit records            │  │ └── Reindexing                │
│ Vectors                  │  │                               │
└───────────────┬──────────┘  └──────────────┬────────────────┘
                │                            │
                └──────────────┬─────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│                                                             │
│  BibliographicService                                       │
│  ├── OpenAlex                                               │
│  ├── Crossref                                               │
│  ├── ORCID                                                  │
│  └── DBLP                                                   │
│                                                             │
│  AIService                                                  │
│  ├── LLM Provider                                           │
│  ├── Embedding Provider                                     │
│  ├── Prompt Templates                                       │
│  └── Structured Output                                      │
│                                                             │
│  SearchService                                              │
│  ├── Full-text search                                       │
│  ├── Vector search                                          │
│  ├── Hybrid ranking                                         │
│  └── Optional reranking                                     │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH + RAG                             │
│                                                             │
│ Question → hybrid search → context selection → LLM          │
│          → structured answer → sources                      │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                OBSERVABILITY AND OPERATIONS                 │
│ Logs | Metrics | Audit | Alerts | Backups | AI costs        │
└─────────────────────────────────────────────────────────────┘
```

## Architecture Principles

- **Next.js as product and BFF:** the App Router hosts the UI, server components, route handlers, and server actions.
- **Relational database as source of truth:** PostgreSQL should store content, metadata, users, permissions, audit records, and vectors.
- **Services isolate integrations:** OpenAlex, Crossref, ORCID, DBLP, LLMs, and embeddings should be accessed through local service interfaces.
- **Jobs handle slow or expensive work:** batch ingestion, embeddings, summaries, and reindexing should not block web requests.
- **Hybrid search by default:** combine full-text search, vector search, filters, and domain-specific ranking.
- **RAG must cite sources:** generated answers should include the publications, URLs, DOI records, or internal content used as context.
- **Audit by default:** admin actions, ingestion runs, and generated content should be traceable.
- **Incremental migration:** SQLite is acceptable for the MVP; PostgreSQL should be introduced without breaking current workflows.

## Project Structure

```txt
app/
  api/
    auth/                       # login/logout
    publications/ingest/        # current synchronous DOI ingestion
    search/                     # future hybrid search endpoint
    rag/                        # future RAG endpoint
  admin/                        # admin dashboard and maintenance pages
  publications/                 # public publication portal
  team/ projects/ events/ ...   # public website sections

components/
  AdminContentForms.js          # reusable admin CRUD forms
  AdminIngestionPanel.js        # DOI ingestion UI
  PublicationsPanel.js          # public publication search/filter UI
  site-data.js                  # static fallback/demo data

lib/
  auth.js                       # current local session model
  prisma.js                     # shared Prisma Client
  content.js                    # institutional content loaders
  publications.js               # publication loader
  admin-content-actions.js      # current admin server actions
  actions/                      # future domain-specific server actions
  audit/                        # future audit helpers
  jobs/                         # future job contracts
  observability/                # future logs, metrics, and AI cost tracking
  rag/                          # future RAG context and response logic
  rbac/                         # future roles, permissions, and guards
  search/                       # future full-text, vector, hybrid, and reranking logic
  services/
    ai/                         # future LLM, embedding, prompts, structured output
    bibliographic/
      openalex.js               # current OpenAlex client and normalizer
  validation/                   # future input validation

prisma/
  schema.prisma                 # current data model
  migrations/                   # Prisma migrations
  seed.js                       # initial seed data

scripts/
  ingest-openalex.js            # current ingestion CLI
  commit-auto.js                # automatic commit message helper

workers/
  bibliographic-ingestion/      # future bibliographic ingestion worker
  embeddings/                   # future embedding worker
  summarization/                # future LLM summary worker
  reindexing/                   # future reindexing worker

docs/
  architecture/                 # architecture notes and decisions
  operations/                   # runbooks, backups, alerts, and costs
```

## Current Data Model

The current Prisma schema uses SQLite locally and includes:

- `Publication`
- `Member`
- `Project`
- `Dissertation`
- `Event`
- `OpenPosition`
- `IngestionRun`
- `IngestionError`

Manual publication records can be created without DOI or OpenAlex IDs. Imported publication
records preserve raw OpenAlex JSON for traceability.

The target model should later add:

- `User`, `Role`, `Permission`, `UserRole`
- `ResearcherProfile`
- `Author`, `Institution`, and join tables
- `PublicationSource`, `PublicationTopic`
- `DocumentChunk`, `Embedding`
- `GeneratedContent`
- `Job`, `JobAttempt`
- `AuditLog`
- `AiUsageEvent`

## Current Workflows

### Admin Publication Ingestion

```txt
Admin
  -> /admin
  -> components/AdminIngestionPanel.js
  -> POST /api/publications/ingest
  -> lib/services/bibliographic/openalex.js
  -> Prisma
  -> SQLite
  -> IngestionRun / IngestionError
  -> revalidatePath("/publications")
```

### CLI DOI Ingestion

```txt
npm run ingest:publications -- DOI
  -> scripts/ingest-openalex.js
  -> lib/services/bibliographic/openalex.js
  -> Prisma
  -> SQLite
```

### Admin Content Maintenance

```txt
Admin maintenance pages
  -> Server Actions
  -> Prisma
  -> SQLite
  -> dynamic public pages
```

Admin maintenance pages:

- `/admin/members`
- `/admin/projects`
- `/admin/publications`
- `/admin/events`
- `/admin/dissertations`
- `/admin/open-positions`

## Environment Variables

Create `.env` from `.env.example`:

```env
DATABASE_URL="file:./dev.db"
OPENALEX_API_KEY="your-openalex-key"
AUTH_SECRET="replace-with-a-long-random-string"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-this-password"
```

Notes:

- `OPENALEX_API_KEY` is required by the current OpenAlex API, including title and URL searches.
- `AUTH_SECRET` signs the admin session cookie. Use a long random value outside local development.
- Never use the example admin password in a shared or deployed environment.

Future production variables:

```env
POSTGRES_URL="postgresql://..."
REDIS_URL="redis://..."
LLM_PROVIDER="openai"
LLM_MODEL="..."
EMBEDDING_MODEL="..."
RAG_MAX_CONTEXT_ITEMS="8"
AI_DAILY_BUDGET_USD="..."
```

## Installation

On Windows PowerShell, prefer `npm.cmd` if script execution policy blocks `npm`.

```powershell
npm.cmd install
```

## Database

Generate Prisma Client:

```powershell
npm.cmd run db:generate
```

Create or update the local database:

```powershell
npm.cmd run db:migrate
```

Load the initial seed:

```powershell
npm.cmd run db:seed
```

The local SQLite database is created at:

```txt
prisma/dev.db
```

This file is ignored by Git.

## Run Locally

```powershell
npm.cmd run dev
```

Open:

```txt
http://localhost:3000
```

Admin area:

```txt
http://localhost:3000/admin
```

## Publication Ingestion

### Admin UI

The admin panel supports:

- DOI batches with up to 10 identifiers
- OpenAlex Work ID batches with up to 10 identifiers
- title search with explicit result selection
- DOI URLs, OpenAlex URLs, and publisher landing-page URLs
- examples for every import method
- per-identifier results
- recent ingestion history
- error details per run

Endpoint:

```txt
POST /api/publications/ingest
```

Payload:

```json
{
  "identifierType": "doi",
  "identifiers": "10.48550/arXiv.2205.01833"
}
```

Supported `identifierType` values are `doi`, `title`, `openalex`, and `url`. Title and publisher
URL searches return candidates that must be selected and imported by their OpenAlex Work ID.
The legacy `{ "dois": "..." }` payload remains supported.

Successful response:

```json
{
  "runId": "...",
  "total": 1,
  "succeeded": 1,
  "failed": 0,
  "results": []
}
```

The route returns HTTP `207` for partial success.

### CLI

```powershell
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833
```

Multiple DOIs:

```powershell
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833 10.1145/example
```

## Admin Authentication

The current authentication model is intentionally small and suitable only for this prototype:

- Credentials come from `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- Successful login creates the `mlkd_admin_session` cookie.
- The cookie is signed with HMAC SHA-256 using `AUTH_SECRET`.
- Sessions expire after 8 hours.
- The cookie is HTTP-only and SameSite=Lax.

Production should add:

- a `User` table
- password hashing
- RBAC
- login rate limiting
- password reset or credential rotation
- login/logout/failure audit logs

## Target Service Layers

### BibliographicService

Planned responsibilities:

- normalize DOI, ORCID, OpenAlex ID, and DBLP keys
- fetch metadata from external sources
- reconcile conflicting metadata
- deduplicate publications
- preserve raw payloads for audit
- return stable internal objects for persistence

Planned sources:

- **OpenAlex:** works, authors, institutions, topics, citations
- **Crossref:** DOI validation, publisher metadata, publication events
- **ORCID:** researcher profiles and author-publication association
- **DBLP:** computer science publications, venues, and authorship

The current OpenAlex implementation lives in `lib/services/bibliographic/openalex.js` and is shared
by the admin ingestion route and the CLI.

### AIService

Planned responsibilities:

- generate embeddings
- generate summaries and snippets
- centralize versioned prompt templates
- validate structured outputs
- track model, latency, errors, and estimated cost
- allow provider/model changes without changing UI or route handlers

Expected generated content:

- public summary
- technical summary
- industry angle
- social snippet
- enriched keywords
- topic classification
- RAG answer with sources

### SearchService

Planned search modes:

- **Full-text:** title, abstract, authors, venue, topics, and summaries
- **Vector:** semantic similarity through embeddings
- **Hybrid:** full-text + vector + filters + boosts
- **Optional reranking:** rerank top-k results when quality justifies the extra cost

Important filters:

- year
- publication type
- author
- institution
- project
- topic
- open-access status
- review status

### Search + RAG

Target pipeline:

```txt
user question
  -> validation and normalization
  -> hybrid search
  -> context selection
  -> prompt assembly
  -> LLM call
  -> structured answer
  -> cited sources
  -> audit and cost tracking
```

Rules:

- every answer should cite sources
- the system should refuse when context is insufficient
- public answers should prefer visible and reviewed publications
- unreviewed content should be limited to admin contexts or clearly labeled

## Observability And Operations

Production needs:

- structured logs for requests, jobs, and external integrations
- latency, error, throughput, and queue metrics
- admin action audit logs
- alerts for ingestion failures, stuck queues, LLM errors, and abnormal AI cost
- PostgreSQL backups and restore procedures
- AI cost tracking by route, job, user, and model
- runbooks in `docs/operations`

## Roadmap

### Phase 1: Strengthen The MVP

- Add tests for auth, CRUD, ingestion, and OpenAlex normalization.
- Add a stable bibliographic ingestion service that can reconcile multiple metadata sources.
- Extend explicit input validation to the remaining admin workflows.
- Add rate limiting to login and ingestion.
- Improve imported publication review/editing workflows.

### Phase 2: PostgreSQL And Scientific Data Model

- Migrate from SQLite to PostgreSQL.
- Normalize authors, institutions, topics, and sources.
- Add users, roles, and permissions.
- Add audit tables.
- Enable pgvector.

### Phase 3: Jobs And AI

- Add a job table or queue.
- Implement bibliographic ingestion workers.
- Generate and persist embeddings.
- Persist LLM-generated summaries and snippets.
- Track model, prompt version, latency, and cost.

### Phase 4: Search And RAG

- Implement full-text search.
- Implement vector search.
- Implement hybrid ranking.
- Add `/api/search`.
- Add `/api/rag`.
- Build a RAG chat UI with sources.

### Phase 5: Operations

- Add structured logs.
- Add metrics.
- Add alerts.
- Add backups.
- Add deployment configuration.
- Add runbooks.

## Implementation Conventions

- Route handlers live in `app/api/**/route.js`.
- Domain-specific server actions should move toward `lib/actions`.
- External integrations should live in `lib/services`.
- Search logic should live in `lib/search`.
- RAG logic should live in `lib/rag`.
- Job creation and execution should live in `lib/jobs` and `workers`.
- Input validation should live in `lib/validation`.
- RBAC should live in `lib/rbac`.
- Logs, metrics, and AI costs should live in `lib/observability`.
- Architecture decisions should live in `docs/architecture`.
- Operational runbooks should live in `docs/operations`.

## Commands

```powershell
npm.cmd run dev
npm.cmd test
npm.cmd run build
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833
npm.cmd run commit:auto
npm.cmd run context:summary
```

## Commit Messages

This repository includes `.gitmessage` for short, professional, explanatory commit messages.

Enable the template once in this clone:

```powershell
git config commit.template .gitmessage
```

To generate and create a commit from staged files:

```powershell
git add .
npm.cmd run commit:auto
```

The helper inspects `git diff --cached --name-status`, chooses a likely type and scope, builds an
English commit message, and runs `git commit -F`.

## Context Handoff

To generate a concise handoff summary for another Codex/GPT session:

```powershell
npm.cmd run context:summary
```

The command writes:

```txt
docs/context/handoff-summary.md
```

Paste that file into a new session when you want to continue with a different model while keeping
the repository context clear.

Recommended format:

```txt
type(scope): short imperative summary

Why:
- reason for the change

What changed:
- main implementation points

Validation:
- commands or checks run
```

Examples:

```txt
feat(admin): add manual publication editing
fix(auth): reject expired admin sessions
docs: document target architecture
```

## Important Files

- `prisma/schema.prisma`: current database schema.
- `lib/prisma.js`: shared Prisma Client.
- `lib/auth.js`: local session helpers.
- `middleware.js`: admin route protection.
- `lib/content.js`: institutional content loaders.
- `lib/publications.js`: publication loader.
- `lib/admin-content-actions.js`: current admin CRUD server actions.
- `app/api/publications/ingest/route.js`: DOI ingestion endpoint.
- `lib/services/bibliographic/openalex.js`: current OpenAlex client and normalizer.
- `scripts/ingest-openalex.js`: DOI ingestion CLI.
- `scripts/commit-auto.js`: automatic commit message helper.
- `components/PublicationsPanel.js`: public publication UI.
- `components/AdminIngestionPanel.js`: admin DOI ingestion UI.
- `components/AdminContentForms.js`: admin CRUD forms.

## Status

This repository is a functional MVP with an architectural skeleton for the next stages. The
services, jobs, search, RAG, RBAC, and observability folders are intentionally present so future
work has clear ownership boundaries instead of accumulating inside React components or route
handlers.
