# Workers

Workers futuros para processamento assíncrono.

Cada worker deve:

- buscar jobs pendentes
- executar trabalho idempotente
- registrar tentativas e erros
- atualizar status
- emitir logs e métricas
