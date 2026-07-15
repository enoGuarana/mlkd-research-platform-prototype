# Bibliographic Service

This layer owns external bibliographic integrations and their metadata normalization.

Implemented sources:

- OpenAlex (`openalex.js`)

Planned sources:

- Crossref
- ORCID
- DBLP

The OpenAlex module exposes work retrieval by DOI or OpenAlex ID, candidate searches by title or
landing-page URL, and conversion to the current `Publication` persistence shape. Route handlers
and CLI scripts consume this module instead of owning integration logic.
