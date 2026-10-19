# ADR 0002 — Git Flow com número da Issue na branch

- **Status:** aceita para execução · **Data:** 19/10/2026 · **Pendência relacionada:** P-015
- **Relacionada:** D-010, T-007, T-008

## Contexto

A cliente exige branches numeradas. O número da PR só existe depois de a PR ser criada, então usá-lo no nome da branch exigiria renomear a branch (o que fecha a PR) ou um bootstrap artificial.

## Decisão

- Branch temporária = `tipo/<NUMERO_REAL_DA_ISSUE>-slug`, validada pela regex
  `^(feat|fix|hotfix|refactor|perf|test|chore|docs|release)/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$`.
- A PR referencia a Issue (`Closes #n`), e o job `branch-convention` do CI exige essa referência.
- `main` (produção) e `develop` (integração) só recebem PR. Promoção via PR `develop → main` (ou `release/*`). `hotfix/*` sai de `main` e é sincronizado de volta em `develop`.
- **Exceção única registrada:** o commit inicial do setup (CF-150) foi direto em `main`, porque o repositório estava vazio e não havia base para PR. `develop` foi criada a partir dele.

## Consequências

- Rastreabilidade: CF-ID → Issue # → branch → PR # → commits → release.
- Se Ellen/Luiggi exigirem o número literal da PR na branch (P-015), é preciso uma nova ADR com o mecanismo escolhido.
- A branch protection nativa do GitHub depende do plano: repositório privado em conta Free não a suporta. Nesse caso a regra é garantida pelo CI e por disciplina, até a migração para Pro/Team ou para repositório público.
