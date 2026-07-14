# RAG

Camada planejada para responder perguntas com base em publicações e conteúdo institucional.

Pipeline:

```txt
pergunta -> busca híbrida -> seleção de contexto -> prompt -> LLM -> resposta com fontes
```

Regras:

- citar fontes usadas
- recusar quando não houver contexto suficiente
- registrar custo e auditoria
- separar conteúdo público de conteúdo administrativo
