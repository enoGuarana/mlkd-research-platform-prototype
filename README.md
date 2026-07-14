# MLKD Research Platform Prototype

Protótipo de uma plataforma modular de pesquisa para o grupo Machine Learning and Knowledge
Discovery do INESC-ID.

O projeto começou como uma interface pública em Next.js e já possui um primeiro backend funcional:
autenticação administrativa simples, CRUD de conteúdo institucional, ingestão de publicações por DOI
via OpenAlex, persistência com Prisma e uma página pública de publicações com busca e filtros.

Este README documenta duas camadas:

- **Estado atual:** o que já existe no protótipo.
- **Arquitetura-alvo:** o molde técnico para evoluir o MVP para uma plataforma com PostgreSQL,
  pgvector, filas, serviços bibliográficos, busca híbrida, RAG, RBAC e observabilidade.

## Visão Do Produto

A plataforma deve servir quatro tipos principais de usuário:

- **Público:** consulta informações do grupo, equipe, projetos, eventos, vagas, dissertações e publicações.
- **Pesquisador:** mantém perfil, publicações, projetos e conteúdos científicos associados.
- **Editor:** revisa metadados, summaries, snippets, curadoria e visibilidade pública.
- **Administrador:** gerencia usuários, permissões, ingestões, integrações, auditoria e operação.

## Escopo Atual

Implementado:

- Site público com páginas de About, Team, Projects, Publications, Dissertations, Events e Open Positions.
- Área administrativa protegida por login local.
- CRUD administrativo para membros, projetos, eventos, dissertações e vagas.
- Middleware protegendo `/admin`, `/admin/*` e `POST /api/publications/ingest`.
- Cookie de sessão HTTP-only assinado.
- Ingestão de DOI pela UI administrativa.
- Ingestão de DOI pela CLI.
- Cliente OpenAlex com normalização de metadados.
- Prisma com SQLite para desenvolvimento local.
- Tabelas de publicação, conteúdo institucional, execução de ingestão e erros de ingestão.
- Página pública de publicações com busca, filtros e painel de detalhe.
- Fallback para dados estáticos quando o banco está vazio ou indisponível.

Ainda não implementado:

- PostgreSQL em produção.
- pgvector e embeddings persistidos.
- Busca semântica real.
- Chat RAG.
- Worker assíncrono e fila.
- RBAC multiusuário.
- Integrações Crossref, ORCID e DBLP.
- Sumarização por LLM.
- Reindexação automática.
- Observabilidade completa.
- Testes automatizados.
- Deploy e infraestrutura.

## Arquitetura-Alvo

```txt
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                            │
│ Público | Pesquisador | Editor | Administrador              │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    APLICAÇÃO NEXT.JS                        │
│                                                             │
│  Frontend React                                             │
│  ├── Site público                                           │
│  ├── Portal de publicações                                  │
│  ├── Busca semântica                                        │
│  ├── Chat RAG                                               │
│  └── Painel administrativo                                  │
│                                                             │
│  BFF / Application Layer                                    │
│  ├── Route Handlers                                         │
│  ├── Server Actions                                         │
│  ├── Autenticação e RBAC                                    │
│  ├── Validação                                              │
│  └── Orquestração de casos de uso                           │
└───────────────┬──────────────────────┬──────────────────────┘
                │                      │
                │ síncrono             │ cria jobs
                ▼                      ▼
┌──────────────────────────┐  ┌───────────────────────────────┐
│ PostgreSQL + pgvector    │  │ FILA / PROCESSAMENTO ASSÍNCRONO│
│ Prisma                   │  │                               │
│                          │  │ Worker                        │
│ Dados institucionais     │  │ ├── Ingestão bibliográfica    │
│ Metadados científicos    │  │ ├── Geração de embeddings     │
│ Usuários e permissões    │  │ ├── Sumarização por LLM       │
│ Conteúdo gerado          │  │ ├── Manutenção automática     │
│ Auditoria                │  │ └── Reindexação               │
│ Vetores                  │  │                               │
└───────────────┬──────────┘  └──────────────┬────────────────┘
                │                            │
                └──────────────┬─────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAMADA DE SERVIÇOS                       │
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
│  └── Reranking opcional                                     │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SEARCH + RAG                             │
│                                                             │
│ Pergunta → busca híbrida → seleção de contexto → LLM        │
│          → resposta estruturada → fontes                    │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                OBSERVABILIDADE E OPERAÇÃO                   │
│ Logs | Métricas | Auditoria | Alertas | Backups | Custos IA │
└─────────────────────────────────────────────────────────────┘
```

## Princípios De Arquitetura

- **Next.js como produto e BFF:** o App Router hospeda UI, server components, route handlers e server actions.
- **Banco relacional como fonte de verdade:** PostgreSQL deve guardar conteúdo, metadados, usuários, permissões, auditoria e vetores.
- **Serviços isolam integrações:** OpenAlex, Crossref, ORCID, DBLP, LLMs e embeddings devem ficar atrás de interfaces locais.
- **Jobs para trabalho caro ou lento:** ingestão em lote, embeddings, summaries e reindexação não devem bloquear requests.
- **Busca híbrida:** combinar full-text, vetores e ranking de domínio para melhorar descoberta científica.
- **RAG com fontes:** respostas devem citar publicações, trechos, DOI, URLs ou registros internos usados como contexto.
- **Auditoria por padrão:** ações administrativas, ingestões e geração de conteúdo devem ser rastreáveis.
- **Evolução incremental:** o SQLite atual é aceitável para MVP; a migração para PostgreSQL deve preservar os fluxos existentes.

## Estrutura Do Projeto

```txt
app/
  api/
    auth/                       # login/logout atuais
    publications/ingest/        # ingestão síncrona atual por DOI
    search/                     # futuro endpoint de busca híbrida
    rag/                        # futuro endpoint de chat/RAG
  admin/                        # painel administrativo
  publications/                 # portal público de publicações
  team/ projects/ events/ ...   # site público

components/
  AdminContentForms.js          # forms CRUD administrativos
  AdminIngestionPanel.js        # UI de ingestão DOI
  PublicationsPanel.js          # busca/filtro client-side atual
  site-data.js                  # dados fallback/demo

lib/
  auth.js                       # sessão local atual
  prisma.js                     # Prisma Client compartilhado
  content.js                    # loaders de conteúdo institucional
  publications.js               # loader de publicações
  actions/                      # futura camada de server actions por domínio
  audit/                        # futura gravação de eventos auditáveis
  jobs/                         # contratos de criação/execução de jobs
  observability/                # logs, métricas e custos IA
  rag/                          # seleção de contexto e resposta RAG
  rbac/                         # papéis, permissões e guards
  search/                       # full-text, vector, hybrid e reranking
  services/
    ai/                         # LLM, embeddings, prompts e structured output
    bibliographic/              # OpenAlex, Crossref, ORCID e DBLP
  validation/                   # schemas e validação de entrada

prisma/
  schema.prisma                 # schema atual
  migrations/                   # migrações Prisma
  seed.js                       # carga inicial

scripts/
  ingest-openalex.js            # CLI de ingestão atual
  openalex-client.js            # cliente OpenAlex atual

workers/
  bibliographic-ingestion/      # futuro worker de ingestão bibliográfica
  embeddings/                   # futuro worker de embeddings
  summarization/                # futuro worker de summaries por LLM
  reindexing/                   # futuro worker de reindexação

docs/
  architecture/                 # decisões e desenho técnico
  operations/                   # runbooks, backups, alertas e custos
```

## Camadas

### 1. Frontend React

Responsável pela experiência do usuário:

- Site público institucional.
- Portal de publicações.
- Busca por texto, tópicos, ano, autores e futuramente busca semântica.
- Chat RAG com respostas estruturadas e fontes.
- Painel administrativo para conteúdo, ingestão e operação.

Estado atual:

- As páginas públicas estão em `app/*/page.js`.
- Publicações são renderizadas por `app/publications/page.js` e `components/PublicationsPanel.js`.
- A administração fica em `app/admin/*`.

### 2. BFF / Application Layer

Responsável por requests, autenticação, autorização, validação e orquestração:

- Route handlers em `app/api/**/route.js`.
- Server actions para CRUD administrativo.
- Guards de sessão e, futuramente, RBAC.
- Validação de payloads.
- Criação de jobs assíncronos.
- Revalidação de páginas afetadas por mudanças.

Estado atual:

- `app/api/auth/login/route.js`
- `app/api/auth/logout/route.js`
- `app/api/publications/ingest/route.js`
- `lib/admin-content-actions.js`
- `middleware.js`

### 3. Dados

Estado atual:

- Prisma com SQLite local (`DATABASE_URL="file:./dev.db"`).
- Modelos: `Publication`, `Member`, `Project`, `Dissertation`, `Event`, `OpenPosition`,
  `IngestionRun` e `IngestionError`.

Arquitetura-alvo:

- PostgreSQL como banco principal.
- Extensão `pgvector` para embeddings.
- Tabelas normalizadas para autores, instituições, tópicos, fontes, chunks e permissões.
- Índices full-text para busca textual.
- Índices vetoriais para similaridade semântica.
- Tabelas de auditoria para ações humanas e automações.

Entidades futuras recomendadas:

- `User`, `Role`, `Permission`, `UserRole`
- `ResearcherProfile`
- `Author`, `Institution`, `PublicationAuthor`, `PublicationInstitution`
- `PublicationSource`, `PublicationTopic`
- `DocumentChunk`, `Embedding`
- `GeneratedContent`
- `Job`, `JobAttempt`
- `AuditLog`
- `AiUsageEvent`

### 4. Fila E Workers

Trabalho lento, caro, repetível ou sujeito a falha deve sair do request síncrono.

Casos de uso:

- Ingestão de centenas de DOIs.
- Atualização automática de publicações por pesquisador.
- Consulta a OpenAlex, Crossref, ORCID e DBLP.
- Deduplicação e reconciliação de metadados.
- Geração de embeddings.
- Sumarização por LLM.
- Reindexação de busca.
- Reprocessamento em caso de mudança de prompt ou modelo.

Estratégia sugerida:

- Começar com tabela `Job` no PostgreSQL se o volume for baixo.
- Migrar para BullMQ/Redis quando houver concorrência, retries e dashboards.
- Cada job deve registrar status, tentativas, erro, payload e custo estimado quando envolver IA.

### 5. BibliographicService

Interface de domínio para buscar e normalizar metadados científicos.

Responsabilidades:

- Normalizar DOI, ORCID, OpenAlex ID e DBLP keys.
- Buscar metadados externos.
- Unificar dados divergentes entre fontes.
- Aplicar deduplicação.
- Preservar payload bruto para auditoria.
- Produzir uma saída interna estável para persistência.

Fontes planejadas:

- **OpenAlex:** fonte principal para works, autores, instituições, tópicos e citações.
- **Crossref:** validação de DOI, publisher, eventos de publicação e metadados editoriais.
- **ORCID:** perfis de pesquisadores e associação autor-publicação.
- **DBLP:** publicações de ciência da computação, conferências e autoria.

Estado atual:

- `scripts/openalex-client.js` já atua como cliente OpenAlex inicial.
- A evolução natural é mover essa lógica para `lib/services/bibliographic/openalex`.

### 6. AIService

Camada de IA independente do provedor.

Responsabilidades:

- Gerar embeddings.
- Chamar LLM para summaries, snippets e respostas RAG.
- Centralizar templates de prompt.
- Validar structured outputs.
- Registrar custos e latência.
- Permitir troca de provedor/modelo sem alterar telas ou route handlers.

Saídas previstas:

- Summary público acessível.
- Summary técnico para pesquisadores.
- Industry angle.
- Social snippet.
- Keywords enriquecidas.
- Classificação de tópicos.
- Resposta RAG com fontes.

### 7. SearchService

Camada de descoberta e ranking.

Modos planejados:

- **Full-text:** título, abstract, autores, venue, tópicos e summaries.
- **Vector:** similaridade semântica usando embeddings.
- **Hybrid:** combinação de full-text, vetor, filtros e boosts.
- **Reranking opcional:** reranker aplicado aos top-k resultados quando a qualidade justificar o custo.

Filtros importantes:

- Ano.
- Tipo de publicação.
- Autor.
- Instituição.
- Projeto.
- Tópico.
- Open access.
- Status de revisão.

### 8. Search + RAG

Pipeline desejado:

```txt
Pergunta do usuário
  -> validação e normalização
  -> busca híbrida
  -> seleção de contexto
  -> montagem de prompt
  -> chamada LLM
  -> resposta estruturada
  -> fontes e trechos usados
  -> auditoria/custos
```

Regras de produto:

- Toda resposta deve indicar fontes.
- O sistema deve recusar respostas quando não houver contexto suficiente.
- O contexto deve favorecer publicações visíveis e revisadas.
- Conteúdo não revisado pode ser usado apenas em áreas administrativas ou com aviso explícito.

### 9. Observabilidade E Operação

Itens necessários para produção:

- Logs estruturados por request, job e integração externa.
- Métricas de latência, erro, throughput e fila.
- Auditoria de ações administrativas.
- Alertas para falha de ingestão, fila parada, erro de LLM e custo anormal.
- Backups PostgreSQL.
- Monitoramento de custos IA por rota, job, usuário e modelo.
- Runbooks operacionais em `docs/operations`.

## Fluxos Atuais

### Ingestão pelo Admin

```txt
Admin
  -> /admin
  -> components/AdminIngestionPanel.js
  -> POST /api/publications/ingest
  -> scripts/openalex-client.js
  -> Prisma
  -> SQLite
  -> IngestionRun/IngestionError
  -> revalidatePath("/publications")
```

### Ingestão pela CLI

```txt
npm run ingest:publications -- DOI
  -> scripts/ingest-openalex.js
  -> scripts/openalex-client.js
  -> Prisma
  -> SQLite
```

### Conteúdo Institucional

```txt
Admin CRUD
  -> Server Actions
  -> Prisma
  -> SQLite
  -> páginas públicas dinâmicas
```

## Variáveis De Ambiente

Crie `.env` a partir de `.env.example`:

```env
DATABASE_URL="file:./dev.db"
OPENALEX_API_KEY="your-openalex-key"
AUTH_SECRET="replace-with-a-long-random-string"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="replace-this-password"
```

Notas:

- `OPENALEX_API_KEY` é opcional para testes pequenos, mas recomendado para uso frequente.
- `AUTH_SECRET` deve ser longo e aleatório fora do desenvolvimento local.
- Nunca use a senha de exemplo em ambiente compartilhado ou público.

Variáveis futuras recomendadas:

```env
POSTGRES_URL="postgresql://..."
REDIS_URL="redis://..."
LLM_PROVIDER="openai"
LLM_MODEL="..."
EMBEDDING_MODEL="..."
RAG_MAX_CONTEXT_ITEMS="8"
AI_DAILY_BUDGET_USD="..."
```

## Instalação

No Windows PowerShell, prefira `npm.cmd` se a policy de execução bloquear `npm`.

```powershell
npm.cmd install
```

## Banco De Dados

Gerar Prisma Client:

```powershell
npm.cmd run db:generate
```

Criar ou atualizar o banco local:

```powershell
npm.cmd run db:migrate -- --name init
```

Carregar seed inicial:

```powershell
npm.cmd run db:seed
```

O SQLite local fica em:

```txt
prisma/dev.db
```

Esse arquivo deve permanecer fora do Git.

## Rodar Localmente

```powershell
npm.cmd run dev
```

Abra:

```txt
http://localhost:3000
```

Área administrativa:

```txt
http://localhost:3000/admin
```

## Ingestão De Publicações

### Admin UI

O painel aceita:

- Um DOI por linha.
- Vários DOIs separados por vírgula ou ponto e vírgula.
- Exemplo pré-preenchido.
- Resultado por DOI.
- Histórico recente de ingestões.
- Detalhes de erro por execução.

Endpoint:

```txt
POST /api/publications/ingest
```

Payload:

```json
{
  "dois": "10.48550/arXiv.2205.01833"
}
```

Resposta de sucesso:

```json
{
  "runId": "...",
  "total": 1,
  "succeeded": 1,
  "failed": 0,
  "results": []
}
```

Quando há sucesso parcial, a rota retorna HTTP `207`.

### CLI

```powershell
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833
```

Múltiplos DOIs:

```powershell
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833 10.1145/example
```

## Modelo De Autenticação Atual

A autenticação atual é simples e adequada apenas para protótipo local:

- Credenciais vindas de `ADMIN_USERNAME` e `ADMIN_PASSWORD`.
- Cookie `mlkd_admin_session`.
- Assinatura HMAC SHA-256 com `AUTH_SECRET`.
- Expiração em 8 horas.
- Cookie HTTP-only e SameSite=Lax.

Evolução recomendada:

- Tabela `User`.
- Hash de senha.
- RBAC.
- Rate limiting.
- Recuperação/rotação de credenciais.
- Auditoria de login, logout e falhas.

## Roadmap Técnico

### Fase 1: Consolidar MVP

- Adicionar testes para auth, CRUD, ingestão e normalização OpenAlex.
- Extrair OpenAlex de `scripts/` para `lib/services/bibliographic/openalex`.
- Adicionar validação explícita de inputs.
- Adicionar rate limiting em login e ingestão.
- Criar edição/revisão de publicação importada.

### Fase 2: PostgreSQL E Modelo Científico

- Migrar de SQLite para PostgreSQL.
- Normalizar autores, instituições, tópicos e fontes.
- Adicionar usuários, papéis e permissões.
- Adicionar auditoria.
- Preparar extensão pgvector.

### Fase 3: Jobs E IA

- Criar tabela/fila de jobs.
- Implementar worker de ingestão bibliográfica.
- Implementar embeddings.
- Persistir summaries e snippets gerados por LLM.
- Registrar custo, modelo, prompt version e latência.

### Fase 4: Busca E RAG

- Implementar full-text search.
- Implementar vector search.
- Implementar ranking híbrido.
- Criar endpoint `/api/search`.
- Criar endpoint `/api/rag`.
- Criar UI de chat RAG com fontes.

### Fase 5: Operação

- Logs estruturados.
- Métricas.
- Alertas.
- Backups.
- Deploy.
- Runbooks.

## Convenções De Implementação

- Route handlers ficam em `app/api/**/route.js`.
- Server actions por domínio devem migrar para `lib/actions`.
- Integrações externas devem ficar em `lib/services`.
- Regras de busca ficam em `lib/search`.
- Regras de RAG ficam em `lib/rag`.
- Criação e execução de jobs ficam em `lib/jobs` e `workers`.
- Validação de entrada fica em `lib/validation`.
- RBAC fica em `lib/rbac`.
- Logs, métricas e custos ficam em `lib/observability`.
- Decisões arquiteturais longas ficam em `docs/architecture`.
- Procedimentos operacionais ficam em `docs/operations`.

## Comandos

```powershell
npm.cmd run dev
npm.cmd run build
npm.cmd run db:generate
npm.cmd run db:migrate
npm.cmd run db:seed
npm.cmd run ingest:publications -- 10.48550/arXiv.2205.01833
```

## Arquivos Importantes

- `prisma/schema.prisma`: schema atual.
- `lib/prisma.js`: Prisma Client compartilhado.
- `lib/auth.js`: sessão local.
- `middleware.js`: proteção de rotas administrativas.
- `lib/content.js`: loaders de conteúdo institucional.
- `lib/publications.js`: loader de publicações.
- `lib/admin-content-actions.js`: server actions CRUD.
- `app/api/publications/ingest/route.js`: ingestão DOI via UI.
- `scripts/openalex-client.js`: cliente e normalizador OpenAlex atual.
- `scripts/ingest-openalex.js`: CLI de ingestão.
- `components/PublicationsPanel.js`: interface pública de publicações.
- `components/AdminIngestionPanel.js`: interface administrativa de ingestão.

## Status

Este repositório está preparado como MVP funcional e esqueleto arquitetural. As pastas de serviços,
jobs, busca, RAG, RBAC e observabilidade existem para orientar a próxima implementação sem misturar
responsabilidades no App Router ou nos componentes React.
