# ADR 0001 — Monorepo pnpm + Turborepo e versões da stack

- **Status:** aceita (setup inicial, CF-150) · **Data:** 19/10/2026 · **Decisor:** Luiggi
- **Relacionada:** D-009 (stack aprovada), T-001/T-002 (recomendações técnicas)

## Contexto

O repositório estava vazio. O PRD recomenda monorepo TypeScript com `apps/web` (Next.js), `apps/api` (NestJS) e `packages/*`. O projeto irmão `landing-ELLEN` usa Next 16.2 + Tailwind 4 + npm.

## Decisão

- **pnpm workspaces + Turborepo** (cache de lint/test/build, pipeline por dependência).
- **Next.js 16.4 / React 19.3 / Tailwind 4.3** no web (mesma geração do landing).
- **NestJS 11.2** na API (CommonJS). O NestJS 12 (ESM-only) saiu em set/2026; o upgrade fica como **CF-168 (P1)** para não acoplar o setup a uma major recém-lançada.
- **TypeScript 6.0** (o TS 7 nativo ainda não é suportado pelo `typescript-eslint`).
- **Clean Architecture** por módulo: `domain / application / infrastructure / presentation` (API e web).
- **Testes:** Vitest em `packages/*` e `apps/web`; **Jest + ts-jest** na API.
- **Supabase:** só estrutura versionada (`supabase/`); provedor do ambiente decidido no CF-012 (P-014).

## Por que Jest na API

O Nest depende de `emitDecoratorMetadata`. Com Vitest isso exige SWC (`unplugin-swc`). Nesta máquina Windows o binário nativo do SWC 1.16 **recusa carregar**: a pasta de cache em `C:\Users\User` concede direitos de substituição a outro SID do Windows. O `ts-jest` usa o próprio compilador TypeScript e funciona em qualquer ambiente. Pode-se rever quando o problema de permissão local for corrigido.

## Consequências

- Um único `pnpm check` reproduz o CI localmente.
- Pacotes internos são ESM; no Jest o `@caixa-forte/contracts` é mapeado para o código-fonte (`moduleNameMapper`).
- Scripts de instalação de dependências só rodam se listados em `allowBuilds` (`pnpm-workspace.yaml`): mitigação de supply chain.
