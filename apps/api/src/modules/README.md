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

**OpenAPI (CF-151):** toda rota anota a resposta com o schema zod do contrato, ex. `@ApiOkResponse({ schema: contractSchema(healthResponseSchema) })`, e o PR inclui o `docs/api/openapi.json` regenerado (`pnpm openapi:export`). O CI falha se o arquivo divergir do código. Swagger UI em `/api/v1/docs` fora de produção.

**Autorização (CF-032):** rota protegida usa `@Authenticated()` (só login) ou `@RequirePermission('prices.manage')` (`modules/identity/presentation/authorization`). O guard valida o access token do Supabase no Auth e lê os papéis em `user_roles` a cada requisição: 401 sem sessão, 403 sem a permissão. Toda permissão exige sessão `aal2` (MFA, CF-034): token só com senha recebe 403 `mfa_required`; `@Authenticated()` não exige. Matriz papel → permissão em `@caixa-forte/contracts` (`permissions.ts`). Quem chama: `@CurrentPrincipal()`.

**Paywall (CF-046):** rota de conteúdo pago usa `@RequireAccess()` (`modules/membership/presentation/access`): login + acesso vigente consultado no banco a cada requisição (`access_of_user` → `private.access_of`, a mesma regra da RLS e do web). Sem acesso: 403 `subscription_required`. Papel de equipe não abre paywall. Regra: assinatura `active`; `past_due`/`cancel_at_period_end` só até o fim do período pago; concessão manual até `valid_to`.

**Entrada validada (CF-048):** corpo com `@Body(new ZodPipe(schema))` (`shared/http/zod-pipe`), usando o schema de `@caixa-forte/contracts` que o web também usa. Erro: 400 `invalid_body` com `fields` (uma mensagem por campo, sem ecoar valor). Concessão manual: `/admin/acessos` (owner, `access.grant`); a trilha é trigger no banco, na mesma transação.

**Módulo não lançado (CF-158):** controller com `@RequireFeature('<flag>')` (`shared/http/feature-flag.guard`) responde 404 enquanto a flag estiver desligada no ambiente. Catálogo em `@caixa-forte/contracts` (`FEATURE_FLAGS`).

**Dado público mudou (CF-163):** depois de persistir preço, evento/lote ou catálogo, injete `WEB_CACHE` (`shared/cache/web-cache.module`) e chame `revalidate(['prices'])`: o web renova as páginas públicas daquela tag.

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
