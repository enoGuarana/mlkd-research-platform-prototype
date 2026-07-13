# MLKD Research Platform Prototype

This repository contains a modularized Next.js prototype for an AI-enhanced
research platform used by the Machine Learning and Knowledge Discovery group at
INESC-ID.

## What is included

- Modular homepage and landing page experience.
- Dedicated Research page with the research area map.
- Searchable Publications page with topic and year filters.
- AI-assisted summary panel for public summaries, industry angles and social snippets.
- Dynamic People page with grouped profile data.
- Opportunities page for MSc and PhD entry points.
- Admin page concept focused on maintenance and publishing workflows.

## Project structure

The project is organized in a simple App Router layout using Next.js:

```txt
app/
  layout.js
  page.js
  research/page.js
  publications/page.js
  people/page.js
  opportunities/page.js
  admin/page.js
components/
  site-data.js
  PublicationsPanel.js
public/
  logo512.png
  home2-500w.png
```

## How to run locally

1. Install dependencies:

```powershell
npm install
ou npm.cmd install
```

2. Start the development server:

```powershell
npm run dev
ou npm.cmd run dev
```

3. Open the app in your browser:

```txt
http://127.0.0.1:3000/
```

## Production build

To validate the Next.js build:

```powershell
npm run build
```