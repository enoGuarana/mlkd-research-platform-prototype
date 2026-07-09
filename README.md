# MLKD Research Platform Prototype

This is a static prototype for an AI-enhanced web platform for the Machine
Learning and Knowledge Discovery group at INESC-ID.

## What is included

- Redesigned homepage with MLKD identity and research positioning.
- Research area map.
- Searchable publication portal with topic and year filters.
- AI-assisted summary panel for public summaries, industry angles and social snippets.
- Dynamic member profile preview.
- MSc and PhD opportunities section.
- Visibility and analytics section.
- Admin console concept focused on easier maintenance.

## How to open

Open `index.html` directly in a browser, or serve this folder locally:

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

Then visit:

```txt
http://127.0.0.1:8765/
```

## Notes

The prototype uses representative data from the current MLKD website and the
internship brief. It is intentionally static, so it can later be migrated to
Next.js, PostgreSQL, Prisma and an LLM-backed summarization service.
