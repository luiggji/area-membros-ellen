## CF-ID / Issue

CF-___ · Closes #___

## Por quê e o quê

<!-- 2–5 linhas: problema resolvido e solução. Uma Issue por PR. -->

## Critérios de aceite

- [ ] ...

## Testes EXECUTADOS (comando + resultado real)

```text
pnpm lint       →
pnpm typecheck  →
pnpm test       →
pnpm build      →
```

**Não executados (e por quê):**

## Segurança / dados

- [ ] Autorização validada no servidor (RBAC + ownership); nada depende só de esconder botão
- [ ] Tabelas com PII têm RLS + teste (A × B, anônimo, expirado) — ou N/A
- [ ] Sem segredo, `.env`, dado real ou PII em código, log, fixture ou screenshot
- [ ] Migration aditiva / plano de rollback descrito — ou N/A
- [ ] Contrato da API (`@caixa-forte/contracts` / OpenAPI) atualizado — ou N/A

## Entrega visual (obrigatória — regra do projeto)

<!-- O que dá para ver depois desta PR: tela, estado, rota ou página (/design, /status, admin). Screenshots aqui. -->

## UI (se aplicável — docs/G_DESIGN_SYSTEM_MINIMALISTA.md)

- [ ] Screenshots reais 1440px e 390px anexados
- [ ] Só tokens do design system; home ≤ 1 hero + 1 jornada + 3 cursos + 2 auxiliares
- [ ] Estados loading / vazio / erro / sem permissão tratados
- [ ] Teclado, foco visível, contraste, zoom 200%
- [ ] Sem dados, fotos, números ou depoimentos fictícios apresentados como reais

## Riscos, rollback e follow-ups

<!-- Riscos conhecidos, como reverter, e Issues de follow-up abertas (não bloqueiam esta PR). -->
