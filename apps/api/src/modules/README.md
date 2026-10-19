# Módulos de domínio (Clean Architecture)

Cada módulo segue 4 camadas. **Dependências só apontam para dentro** (presentation → application → domain; infrastructure implementa portas da application).

```
modules/<contexto>/
  domain/          entidades, value objects, regras puras e erros de domínio — sem Nest, sem Supabase
  application/     use cases + portas (interfaces/tokens) — orquestra o domínio
  infrastructure/  adapters: repositórios Supabase/Postgres, gateway de pagamento, e-mail, vídeo
  presentation/    controllers REST (/api/v1), DTOs validados com zod (@caixa-forte/contracts), guards
  <contexto>.module.ts   wiring do Nest (bind porta → adapter)
```

Referência implementada: `health/`. Testes: `*.spec.ts` ao lado do código (unit) e `test/*.e2e-spec.ts` (HTTP).

| Módulo        | Escopo (PRD)                                  | CF principais      |
| ------------- | --------------------------------------------- | ------------------ |
| identity      | Auth, perfis, consentimentos, RBAC            | CF-030…035         |
| membership    | entitlements e regra de acesso                | CF-046, CF-048     |
| billing       | planos, price_versions, assinaturas, webhooks | CF-040…049         |
| learning      | trilhas, cursos, aulas, progresso             | CF-080…084         |
| resources     | Cofre de materiais, signed URLs               | CF-085, CF-162     |
| community     | diretório opt-in, grupos, posts, moderação    | CF-090…096         |
| events        | Café Estratégico: edições e lotes             | CF-060…062         |
| ticketing     | reservas TTL, pedidos, ingressos QR           | CF-063…067, CF-070 |
| checkin       | check-in atômico                              | CF-068, CF-069     |
| planning      | diagnóstico, metas 90/30 dias                 | CF-102, CF-103     |
| notifications | e-mail transacional, outbox                   | CF-100, CF-160     |
| admin         | painel owner/comercial                        | CF-105             |
| audit         | audit log append-only                         | CF-161             |
| analytics     | relatórios e atribuição café→assinatura       | CF-071, CF-106     |

Regras inegociáveis: autorização no servidor (RBAC + ownership), `service_role` nunca no browser, webhooks assinados e idempotentes, valores em centavos (inteiro), timestamps UTC.
