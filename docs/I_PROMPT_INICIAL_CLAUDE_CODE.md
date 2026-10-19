# PROMPT INICIAL PARA COLAR NO CLAUDE CODE — CAIXA FORTE

Você é o engenheiro responsável por iniciar a implementação incremental da Caixa Forte com base nos documentos PRD v1.1 deste repositório.

**Objetivo desta primeira sessão:** FAZER APENAS AUDITORIA E PLANEJAMENTO; não implementar nada antes da minha aprovação.

1. Leia `CLAUDE.md`, `docs/00_LEIA_PRIMEIRO.md`, `docs/D_DECISION_LOG.md`, `docs/A_PRD_MASTER_CAIXA_FORTE.md`, `docs/B_MVP_BLUEPRINT.md`, `docs/C_DEVELOPMENT_BACKLOG.md`, `docs/E_ENGINEERING_DELIVERY_PLAN.md`, `docs/F_QA_TEST_STRATEGY.md`, `docs/G_DESIGN_SYSTEM_MINIMALISTA.md` e `docs/H_GUIA_CLAUDE_CODE_GITFLOW.md`. Se a localização diferir, descubra sem duplicar arquivos.
2. Inspecione em modo leitura o estado real do repositório, `git status`, branches, remotes, estrutura, package manager, componentes, auth, banco, Supabase, scripts de teste, CI/CD e configuração de ambientes. Não execute operações destrutivas nem modifique produção.
3. Compare tudo com o PRD v1.1 e produza uma tabela: requisito | status atual (implementado/parcial/ausente) | evidência (arquivo/linha) | prioridade | dependências | recomendação.
4. Analise especialmente a referência visual `docs/references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png`: sidebar vinho, canvas creme, home limpa, uma jornada principal, três cursos e dois cartões complementares. Não implemente antigos designs carregados. O rosto da arte não é a foto real de Ellen.
5. Identifique pendências comerciais/técnicas que bloqueiam P0 (gateway, anual parcelado, dados reais, domínio, vídeo, e-mails, políticas). Não tome decisões comerciais sozinho.
6. Proponha sequência de Issues GitHub pequenas, vinculadas aos IDs CF-###, com critérios de aceite e testes. Para cada uma, sugira `tipo/<NUMERO_DA_ISSUE_REAL>-slug` **somente após a Issue ser criada**. PRs para `develop`, `main` apenas por release/hotfix.
7. Proponha CI/CD, branch protection, staging, QA, smoke e rollback compatíveis com o código real; não afirme que existem antes de verificar.
8. Entregue seu relatório e aguarde explicitamente meu OK antes de criar branches, modificar arquivos, abrir PR, configurar serviços ou implantar.

**Não gere código nesta primeira execução. Quero primeiro entender o estado real, o plano por fases e os riscos.**
