# Caixa Forte — Área de Membros

Comunidade premium de educação e networking para advogados: assinatura, cursos, comunidade sem DM, jornada/planejamento e **Café Estratégico** (venda de ingresso, QR e check-in).

> Documentação de produto em [`docs/`](docs/00_LEIA_PRIMEIRO.md) · Backlog ordenado em [`docs/BACKLOG.md`](docs/BACKLOG.md) · Regras para agentes em [`CLAUDE.md`](CLAUDE.md)

## Requisitos

- Node **24** (`.nvmrc`)
- pnpm **12** (`npm i -g pnpm`; versão fixada em `packageManager`)

## Começando

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
pnpm dev          # web http://localhost:3000 · api http://localhost:4000/api/v1/health
```

## Scripts

| Script                                       | Descrição                                     |
| -------------------------------------------- | --------------------------------------------- |
| `pnpm dev`                                   | web + api em modo watch                       |
| `pnpm build`                                 | build de todos os pacotes                     |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | gates de qualidade                            |
| `pnpm check`                                 | tudo acima + format:check (rodar antes da PR) |
| `pnpm branch:check`                          | valida o nome da branch (Git Flow)            |

## Estrutura

```
apps/web          Next.js 16 (App Router, Tailwind 4) — rotas em src/app, lógica em src/modules
apps/api          NestJS 11 — src/modules/<contexto>/{domain,application,infrastructure,presentation}
packages/ui       design tokens v1.1 (sidebar vinho, canvas creme) + componentes
packages/contracts schemas zod compartilhados
packages/config   tsconfig/eslint compartilhados
supabase/         config, migrations, seeds fictícios, testes de RLS
docs/             PRD v1.1, backlog, ADRs, QA, runbooks
.github/          CI (lint, typecheck, testes, build, audit, gitleaks, semgrep), templates, scripts
.claude/          regras, agentes e skills do Claude Code
```

## Fluxo de trabalho (Git Flow)

1. Issue real no GitHub (`[CF-###] ...`).
2. Branch a partir de `develop`: `tipo/<numero-da-issue>-slug` (ex.: `feat/42-home-minimalista`).
3. `pnpm check` verde → PR para `develop` com `Closes #<issue>`.
4. CI + review (bloqueia só P0/P1, segurança e critério de aceite) → squash merge.
5. Release por marco: PR `develop → main` + tag SemVer.

Detalhes: [`docs/H_GUIA_CLAUDE_CODE_GITFLOW.md`](docs/H_GUIA_CLAUDE_CODE_GITFLOW.md) e [`docs/adr/0002-gitflow-numero-da-issue.md`](docs/adr/0002-gitflow-numero-da-issue.md).
