---
name: start-issue
description: Inicia o trabalho em uma Issue real do GitHub seguindo o Git Flow da Caixa Forte — valida DoR, cria a branch tipo/<issue>-slug a partir de develop e apresenta um plano curto. Use quando o usuário pedir para começar/pegar uma Issue ou CF-ID.
argument-hint: <numero-da-issue> [slug]
---

# /start-issue $ARGUMENTS

1. **Issue real**: `gh issue view <n> --json number,title,body,labels,milestone,state`. Se não existir ou estiver fechada, pare e avise. Nunca invente número.
2. **DoR**: extraia CF-ID, prioridade, critérios de aceite, dependências e decisões pendentes (P-###). Confira em `docs/BACKLOG.md` se as dependências estão `done`; se houver P-### aberta que bloqueie, avise e pergunte antes de seguir.
3. **Workspace limpo**: `git status --short`. Se houver mudanças locais, **não descarte** — reporte e pergunte.
4. **Branch**:
   ```bash
   git switch develop && git pull --ff-only origin develop
   git switch -c <tipo>/<n>-<slug>
   pnpm branch:check
   ```
   `tipo` vem da coluna "Branch sugerida" do BACKLOG (feat/fix/chore/docs/test/refactor/perf). `hotfix` sai de `main`.
5. **Contexto**: leia as seções do PRD (doc A), design (doc G, se UI) e QA (doc F) ligadas ao CF-ID, e o código existente que será tocado.
6. **Plano curto** (≤ 10 linhas): arquivos/camadas afetados, contratos/migrations, testes a escrever (QA-IDs), riscos. Depois implemente — escopo restrito à Issue.
