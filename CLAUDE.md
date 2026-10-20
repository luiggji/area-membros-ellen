# CLAUDE.md — CAIXA FORTE (area-membros-ellen)

Área de membros premium para advogados: assinatura, cursos, comunidade sem DM, jornada/planejamento e **Café Estratégico** (venda, ingresso QR, check-in). Produto independente agora; integração com o portal Ellen Conrado depois.
Papéis: **Ellen** (produto, homologação), **Luiggi** (técnica, release), **Comercial** (inscrições, check-in).

## Fontes de verdade (ler sob demanda, nesta ordem de autoridade)

1. `docs/D_DECISION_LOG.md` — decisões confirmadas (D-###) e pendências (P-###). A decisão explícita mais recente vence.
2. `docs/A_PRD_MASTER_CAIXA_FORTE.md` — escopo funcional, regras, modelo de dados, RLS.
3. `docs/G_DESIGN_SYSTEM_MINIMALISTA.md` + `docs/references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png` — **fonte da UI**.
4. `docs/BACKLOG.md` — ordem de execução, prioridades, dependências, número real das Issues.
5. `docs/B_MVP_BLUEPRINT.md` (limites do MVP), `docs/E_…` (engenharia/CI/CD), `docs/F_…` (QA), `docs/H_…` (Git Flow operacional).

## Stack e comandos reais

pnpm 12 + Turborepo · Node 24 · TypeScript strict · Next.js 16 (App Router, Tailwind 4) · NestJS 11 · Supabase/Postgres · zod.

| Comando (raiz)                                              | O que faz                                                                    |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `pnpm dev`                                                  | web :3000 + api :4000 (`/api/v1`)                                            |
| `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm build` | gates locais (os mesmos do CI)                                               |
| `pnpm check`                                                | format:check + lint + typecheck + test + build — **rodar antes de abrir PR** |
| `pnpm --filter @caixa-forte/api test`                       | testes só da API (Jest + ts-jest)                                            |
| `pnpm branch:check`                                         | valida o nome da branch atual                                                |

Testes: API usa **Jest** (SWC nativo não carrega nesta máquina Windows — ver `docs/adr/0001`); pacotes e web usam **Vitest**.

## Arquitetura (Clean Architecture)

```
apps/api/src/modules/<contexto>/{domain,application,infrastructure,presentation}   # referência: health/
apps/web/src/app/            rotas finas (App Router)
apps/web/src/modules/<contexto>/{domain,application,infrastructure,presentation}
packages/ui        tokens (theme.css) + componentes editoriais
packages/contracts schemas zod compartilhados web↔api
packages/config    tsconfig/eslint compartilhados
supabase/          config, migrations, seeds fictícios, testes pgTAP de RLS
```

Dependências só apontam para dentro: `domain` não importa Nest/Next/Supabase; `infrastructure` implementa portas da `application`. Detalhes: `apps/api/src/modules/README.md`, `apps/web/src/modules/README.md`.

## Mandamentos

1. Caixa Forte independente; Seven Box nunca incluso gratuitamente. Não trocar a stack sem ADR.
2. **Autorização sempre no servidor** (RBAC + ownership + RLS). Paywall em API/storage/vídeo, nunca só na UI. `service_role` jamais no browser.
3. Pagamento só ativa acesso por **webhook assinado e idempotente** — nunca por `success_url`. Pagar ingresso ≠ virar assinante.
4. Bilheteria: reserva com TTL, sem overbooking sob concorrência, QR opaco sem PII, check-in atômico.
5. Nada inventado: cursos, preços, métricas, depoimentos, fotos, datas, progresso. Preços vêm do banco (versionados), nunca constantes no front.
6. **Visual v1.1 minimalista**: sidebar vinho, canvas creme, home = 1 hero + 1 jornada + ≤3 cursos + ≤2 auxiliares. Só tokens de `packages/ui/src/theme.css`. Não voltar a dashboards densos.
7. LGPD: diretório só opt-in, contato oculto por padrão, logs sem PII, sem DM no MVP.
8. Nunca push direto/force em `main`/`develop`, merge, deploy, migration destrutiva, gasto com serviço ou mudança em produção **sem autorização explícita**.
9. Não apagar mudanças locais de terceiros; não refatorar/reformatar fora do escopo da Issue.
10. Não declarar "pronto", "CI verde" ou "QA aprovado" sem evidência executada.
11. **Sempre algo para ver:** toda onda do `docs/BACKLOG.md` tem pelo menos uma entrega visual, e toda Issue declara a sua (tela/estado/rota ou onde o backend aparece: `/design`, `/status`, admin). Ao planejar backlog novo, incluir itens de design em cada onda.

## Prioridades (não confundir)

- **Requisito:** P0 = essencial ao MVP · P1 = próxima versão · P2 = evolução. Nenhum P1/P2 atrasa um P0 sem aprovação.
- **Bug (severidade):** P0 = segurança/receita/integridade (bloqueia release) · P1 = fluxo relevante quebrado · P2 = localizado com contorno.

## Git Flow (obrigatório)

- `main` = produção · `develop` = integração/staging. Ambas só recebem PR.
- Branch: `tipo/<NUMERO_REAL_DA_ISSUE>-slug` — regex `^(feat|fix|hotfix|refactor|perf|test|chore|docs|release)/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$`.
- Issue real **antes** da branch. Nunca inventar número de Issue/PR (o da PR nasce ao criá-la — P-015).
- `feat|fix|refactor|perf|test|chore|docs` saem de `develop` → PR para `develop`. `release` → `main`. `hotfix` sai de `main` → PR para `main` e volta para `develop`.
- Commits: Conventional Commits em português (`feat: ...`, `fix: ...`), pequenos; número opcional.
- Merge: squash na `develop`; release por PR `develop → main` com tag SemVer.

## PRs objetivas — sem trâmite infinito

- **Uma Issue por PR**, alvo ≤ ~400 linhas úteis. Resolve a Issue **a fundo** (critérios de aceite + testes), nada além.
- Review **bloqueia apenas**: bug P0/P1, falha de segurança, critério de aceite não atendido, CI vermelho, migration destrutiva sem plano.
- Todo o resto (melhorias, nits, ideias) vira **Issue de follow-up** com prioridade — não segura a PR.
- Máximo **2 ciclos de ajuste** por PR; se surgir algo novo e grande, é outra Issue.
- Skills: `/start-issue <n>` → implementar → `/open-pr` → `/review-pr <n>`.

## Definition of Done

Critérios de aceite atendidos · `pnpm check` verde (saída real) · testes dos cenários P0 tocados (sucesso, vazio, erro, sem permissão) · RLS/authz testados quando há dados · screenshots 1440/390 se UI · contrato/migration documentados · relatório final no formato abaixo.

## Relatório ao concluir uma Issue

```
CF-ID / Issue: #<real>        Branch: tipo/<issue>-slug        PR: #<real, se criada>
Mudanças e arquivos:
Critérios de aceite atendidos:
Testes EXECUTADOS (comando → resultado):   Testes NÃO executados (motivo):
Screenshots (UI):   Segurança/RLS/migrations:   Riscos e rollback:
Follow-ups abertos:   Pendências de decisão (Ellen/Luiggi):   Próxima Issue (BACKLOG.md):
```
