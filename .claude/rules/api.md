---
paths:
  - 'apps/api/**'
---

# Regras — API NestJS (`apps/api`)

- Novo módulo = copiar o padrão de `src/modules/health/`: `domain/` (puro) → `application/` (use case + portas como `Symbol`) → `infrastructure/` (adapters) → `presentation/` (controller) → `<contexto>.module.ts` (bind porta → adapter).
- `domain/` não importa `@nestjs/*`, Supabase, gateway nem `process.env`.
- Rotas sempre sob `/api/v1`. Entrada validada com schema zod de `@caixa-forte/contracts`; resposta tipada com o mesmo contrato. Nunca devolver entidade crua do banco.
- Toda rota não pública: guard de autenticação + checagem de papel (RBAC) **e** de ownership do recurso no use case. Testar 403/404 para outro usuário (IDOR).
- Dinheiro em centavos (`number` inteiro), datas em UTC, IDs `uuid`.
- Webhooks: verificar assinatura, deduplicar por `provider_event_id` (unique), transição de estado em transação, efeitos colaterais via outbox. Responder 2xx só após persistir.
- Logs: sem token, CPF, e-mail, payload de pagamento. Use correlation ID.
- Testes: `*.spec.ts` ao lado do código (unit, sem Nest quando possível) e `test/*.e2e-spec.ts` (HTTP com `configureApp`). Rodar `pnpm --filter @caixa-forte/api test`.
- Imports dos tipos usados em DI precisam ficar como valor (sem `import type`) por causa do `emitDecoratorMetadata`.
