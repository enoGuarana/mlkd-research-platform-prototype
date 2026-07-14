# Bibliographic Service

Camada planejada para buscar, normalizar e reconciliar metadados científicos.

Fontes previstas:

- OpenAlex
- Crossref
- ORCID
- DBLP

O cliente OpenAlex atual está em `scripts/openalex-client.js`. A próxima evolução é mover essa lógica
para cá e expor uma API interna estável, por exemplo `ingestPublicationByDoi`.
