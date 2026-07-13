# MLKD Research Platform Prototype

Prototype of a modular research platform for the Machine Learning and Knowledge Discovery
group at INESC-ID.

The project started as a static Next.js interface and now includes the first backend workflow:
a DOI ingestion experience that imports publication metadata from OpenAlex into a local SQLite
database through Prisma. The workflow is available both from an authenticated admin UI and from
a CLI script.

The public information architecture follows the original MLKD website:

```txt
About
Team
Projects
Publications
Dissertations
Events
Reading Group
Open positions
```

The authenticated admin area is an operational layer added on top of that public structure.

## Current Scope

The application is currently a functional prototype, not a complete production platform.

Implemented:

- Public homepage/About page with group mission and research focus.
- Team page with current members and alumni.
- Projects page with active and past projects.
- Dissertations page with new, ongoing and finished dissertation entry points.
- Events page with recent reading group and seminar-style entries.
- External Reading Group navigation link.
- Open positions page for MSc, PhD and collaboration entry points.
- Admin page with DOI ingestion form, database overview and recent ingestion history.
- Admin CRUD pages for team members, projects, events, dissertations and open positions.
- Admin authentication with username/password from environment variables.
- HTTP-only signed session cookie.
- Middleware protection for `/admin` and the ingestion API route.
- Searchable publications interface with search, topic filter, year filter and selected-paper panel.
- SQLite database managed by Prisma.
- DOI ingestion through the browser using an internal Next.js route handler.
- DOI ingestion CLI using the same OpenAlex normalization logic.
- Publication upsert into the database.
- Ingestion audit tables for successful and failed runs.
- Database-backed publications page with fallback to static sample data.

Not implemented yet:

- Role-based authorization.
- Production database such as PostgreSQL.
- Batch upload by CSV.
- Editing imported publication metadata.
- Manual review/approval workflow.
- AI-generated summaries persisted in the database.
- Role-based authorization.
- Tests.
- Deployment configuration.

## Architecture

Current browser ingestion flow:

```txt
admin login
  -> signed HTTP-only session cookie
  -> protected /admin
  -> DOI input
  -> components/AdminIngestionPanel.js
  -> app/api/publications/ingest/route.js
  -> OpenAlex API
  -> scripts/openalex-client.js
  -> Prisma
  -> SQLite
  -> lib/publications.js
  -> app/publications/page.js
  -> components/PublicationsPanel.js
```

CLI ingestion uses the same normalization path:

```txt
DOI input
  -> scripts/ingest-openalex.js
  -> scripts/openalex-client.js
  -> Prisma
  -> SQLite
```

In simpler terms:

1. You paste one or more DOIs in `/admin`.
2. The admin panel posts the DOIs to an internal API route.
3. The route asks OpenAlex for metadata about each DOI.
3. The metadata is normalized into the local publication shape.
4. The publication is inserted or updated in SQLite.
5. The ingestion run is recorded with success and error counts.
6. The publications and admin pages are revalidated.
7. The publications page reads from the database.
8. If the database has no records or cannot be read, the page falls back to static demo data.

## Tech Stack

- Next.js 14 App Router
- React 18
- Prisma 6
- SQLite for local development
- OpenAlex API for publication metadata

## Project Structure

```txt
app/
  layout.js
  page.js
  api/publications/ingest/route.js
  team/page.js
  projects/page.js
  publications/page.js
  dissertations/page.js
  events/page.js
  open-positions/page.js
  people/page.js              # redirects to /team
  opportunities/page.js       # redirects to /open-positions
  admin/page.js
  admin/login/page.js
  admin/members/page.js
  admin/projects/page.js
  admin/events/page.js
  admin/dissertations/page.js
  admin/open-positions/page.js
  globals.css

components/
  AdminIngestionPanel.js
  site-data.js
  PublicationsPanel.js

lib/
  prisma.js
  publications.js

prisma/
  schema.prisma
  migrations/

scripts/
  ingest-openalex.js
  openalex-client.js

public/
  logo512.png
  home2-500w.png
```

## Environment

Create a `.env` file from `.env.example`:

```env
DATABASE_URL="file:./dev.db"
OPENALEX_API_KEY="your-openalex-key"
AUTH_SECRET="replace-with-a-long-random-string"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-this-password"
```

`OPENALEX_API_KEY` is optional for small experiments, but should be configured for regular use.
`AUTH_SECRET` signs the admin session cookie. Use a long random value outside local development.
Never use the example admin password in a deployed environment.

## Install

On Windows PowerShell, prefer `npm.cmd` if script execution policy blocks `npm`.

```powershell
npm.cmd install
```

## Database

Generate the Prisma Client:

```powershell
npm.cmd run db:generate
```

Create or update the SQLite database:

```powershell
npm.cmd run db:migrate -- --name init
```

The local database is created at:

```txt
prisma/dev.db
```

This file is ignored by git.

Load the initial MLKD content seed:

```powershell
npm.cmd run db:seed
```

The seed inserts the current and past members from the reference MLKD Team page, plus starter
records for projects, dissertations, events and open positions.

## Ingest Publications From The Admin UI

Start the app:

```powershell
npm.cmd run dev
```

Open:

```txt
http://localhost:3000/admin
```

If you are not signed in, the middleware redirects you to:

```txt
http://localhost:3000/admin/login
```

For local development, the checked-in `.env.example` shows the variables you need. The local
`.env` used during prototype development can use:

```env
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin"
```

Change those values before sharing or deploying the app.

The admin page lets you:

- Paste one DOI per line.
- Paste multiple DOIs separated by commas or semicolons.
- Load an example DOI.
- Submit the batch to the internal API route.
- See immediate per-DOI results.
- See publication count and recent ingestion runs.
- Expand recent runs to inspect error details.
- Open dedicated maintenance pages for members, projects, events, dissertations and positions.

The browser flow calls:

```txt
POST /api/publications/ingest
```

This route is protected by the same session middleware as `/admin`. Unauthenticated requests
receive HTTP `401`.

Request body:

```json
{
  "dois": "10.48550/arXiv.2205.01833"
}
```

Successful response:

```json
{
  "total": 1,
  "succeeded": 1,
  "failed": 0,
  "results": []
}
```

The route returns HTTP `207` when the batch partially succeeds and partially fails.

## Ingest Publications From The CLI

Pass one or more DOIs after `--`:

```powershell
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833
```

Example with multiple DOIs:

```powershell
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833 10.1145/example
```

For each DOI, the script:

- Normalizes the DOI.
- Fetches the OpenAlex work.
- Extracts title, authors, institutions, topics, keywords, venue, year, URLs and citation count.
- Reconstructs the abstract when OpenAlex provides `abstract_inverted_index`.
- Maps OpenAlex metadata into the local topic filters.
- Performs an upsert into `Publication`.
- Records failures in `IngestionError`.
- Tracks the batch in `IngestionRun`.

## Run Locally

```powershell
npm.cmd run dev
```

Open:

```txt
http://localhost:3000
```

## Production Build

```powershell
npm.cmd run build
```

## Data Model

The current Prisma schema has three models.

`Publication` stores imported publication metadata:

- DOI and OpenAlex ID.
- Title.
- Authors, topics, institutions and keywords as serialized JSON strings.
- Year, date, venue and type.
- Abstract.
- Local topic and topic label.
- Citation count.
- Open-access status.
- Landing page and PDF URL.
- Raw OpenAlex JSON for auditing.
- Creation, update and ingestion timestamps.

`IngestionRun` stores one import execution:

- Total DOI count.
- Successful count.
- Failed count.
- Start and completion timestamps.

`IngestionError` stores failed DOI imports:

- DOI.
- Error message.
- Related ingestion run.

## Authentication Model

Authentication is intentionally small and local to this prototype.

The login form posts credentials to:

```txt
POST /api/auth/login
```

The route compares the submitted credentials with:

```env
ADMIN_USERNAME
ADMIN_PASSWORD
```

On success, the route creates a signed session token and stores it in an HTTP-only cookie named:

```txt
mlkd_admin_session
```

The cookie is:

- HTTP-only, so client-side JavaScript cannot read it.
- SameSite=Lax, reducing cross-site request risk for normal navigation.
- Signed with HMAC SHA-256 using `AUTH_SECRET`.
- Time-limited to 8 hours.

The `middleware.js` file protects:

- `/admin`
- `/admin/*`
- `/api/publications/ingest`

The logout button posts to:

```txt
POST /api/auth/logout
```

That route expires the session cookie.

## Content Management

The public site now reads managed content from Prisma for:

- Team members and alumni.
- Projects.
- Events.
- Dissertations.
- Open positions.

The admin maintenance routes are:

```txt
/admin/members
/admin/projects
/admin/events
/admin/dissertations
/admin/open-positions
```

Each maintenance page supports:

- Adding a new record.
- Editing existing records.
- Changing visibility on the public site.
- Deleting records.
- Setting sort order.

The Team seed is based on the reference MLKD Team page:

```txt
https://mlkd.idss.inesc-id.pt/mlkd-team.html
```

The public pages are dynamic so changes saved in the admin are reflected from the database.

## Implemented Files

- `prisma/schema.prisma`: database schema.
- `prisma/migrations/`: applied database migrations.
- `lib/prisma.js`: shared Prisma Client instance.
- `lib/auth.js`: session token creation, verification and cookie helpers.
- `middleware.js`: protects admin pages and the ingestion API.
- `lib/publications.js`: server-side publication loader with static fallback.
- `app/admin/login/page.js`: admin login page.
- `app/api/auth/login/route.js`: credential check and session creation.
- `app/api/auth/logout/route.js`: session expiration.
- `app/api/publications/ingest/route.js`: API route used by the admin UI.
- `scripts/openalex-client.js`: OpenAlex API client and metadata normalization.
- `scripts/ingest-openalex.js`: DOI ingestion CLI.
- `app/page.js`: public About/home page aligned with the original MLKD entry point.
- `app/team/page.js`: current members and alumni.
- `app/projects/page.js`: active and past projects.
- `app/dissertations/page.js`: dissertation entry points.
- `app/events/page.js`: event and reading group history preview.
- `app/open-positions/page.js`: open position entry points.
- `app/people/page.js`: compatibility redirect to `/team`.
- `app/opportunities/page.js`: compatibility redirect to `/open-positions`.
- `app/admin/page.js`: server page that loads publication count and recent ingestion runs.
- `app/admin/members/page.js`: member and alumni maintenance.
- `app/admin/projects/page.js`: project maintenance.
- `app/admin/events/page.js`: event maintenance.
- `app/admin/dissertations/page.js`: dissertation maintenance.
- `app/admin/open-positions/page.js`: open position maintenance.
- `app/publications/page.js`: server page that loads publications from the database.
- `components/AdminIngestionPanel.js`: client UI for DOI submission and ingestion feedback.
- `components/LoginForm.js`: login form.
- `components/LogoutButton.js`: logout action for the admin page.
- `components/AdminContentForms.js`: reusable admin forms for managed content.
- `components/PublicationsPanel.js`: client UI for searching, filtering and selecting publications.
- `lib/content.js`: public content loaders with database-first behavior and static fallback.
- `lib/admin-content-actions.js`: server actions for content CRUD.
- `prisma/seed.js`: initial database seed for MLKD content.
- `.env.example`: required environment variables.

## Current Limitations

This is intentionally still a narrow MVP.

The admin ingestion experience is protected by a simple username/password login. This is enough
for a local prototype, but production should use stronger account management, password storage,
rate limiting and role-based authorization.

Imported authors, topics and institutions are stored as JSON strings instead of normalized
relational tables. This keeps the prototype simple, but it is not the final shape for
analytics-heavy workflows.

The AI summary panel is still a UI placeholder. It displays imported abstracts or fallback copy,
but there is no LLM summarization pipeline yet.

## Recommended Next Implementation Steps

1. Add rate limiting to login and ingestion routes.
2. Add CSV upload for bulk DOI ingestion.
3. Add publication review/editing screens for local summaries, industry angle and social snippet.
4. Add role-based authorization for multiple admin users.
5. Normalize publication authors, institutions and topics into separate tables.
6. Add tests for content CRUD, DOI normalization, abstract reconstruction, auth, API route behavior and OpenAlex mapping.
7. Move from SQLite to PostgreSQL for production.
8. Add deployment configuration.
9. Add retry/backoff for larger OpenAlex batches.
10. Add AI-generated summaries persisted in the database.

## What To Study

To understand and extend this project, study these topics in order:

1. Next.js App Router: pages, layouts, Server Components and Client Components.
2. React state: how `PublicationsPanel` manages search, filters and selected publication.
3. Prisma basics: schema, migrations, Prisma Client, `findMany` and `upsert`.
4. SQLite basics: local database files, tables, unique constraints and migrations.
5. OpenAlex works API: DOI lookup, authorships, topics, locations and abstract format.
6. ETL pipelines: extract from API, transform metadata, load into a database.
7. Data modeling: when to store JSON and when to normalize into relational tables.
8. Admin workflows: validation, review, authorization and audit logs.
9. Web authentication basics: cookies, HMAC signatures, middleware and route protection.
