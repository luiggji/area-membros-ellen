# CAIXA FORTE — BACKLOG EXECUTÁVEL (ordem completa até o lançamento e evolução)

**Propósito:** a ordem de execução do projeto do início ao fim, com prioridades, dependências, branches e bloqueios de negócio, para tirar a próxima Issue do topo sem precisar replanejar.
**Fontes:** `C_DEVELOPMENT_BACKLOG.md` v1.1 (IDs `CF-001…CF-144`) e as demandas técnicas identificadas na auditoria do setup (IDs `CF-150+`, marcadas **(novo)**). Requisitos completos ficam em `A_PRD_MASTER_CAIXA_FORTE.md`, a UI em `G_DESIGN_SYSTEM_MINIMALISTA.md`, os gates em `E_ENGINEERING_DELIVERY_PLAN.md` / `F_QA_TEST_STRATEGY.md` e as decisões em `D_DECISION_LOG.md`.
**Regra de ouro:** este arquivo **não** inventa datas, estimativas em horas nem números de Issue. A coluna `Issue #` fica `—` até a Issue ser criada no GitHub. Depois disso, o número real é preenchido aqui por uma PR `docs/<issue>-...`.

## Legenda

| Campo | Valores | Significado |
|---|---|---|
| **Pri** (prioridade de requisito) | `P0` / `P1` / `P2` | P0 = necessário ao MVP/lançamento (inclui controles de risco e produção). P1 = próxima versão. P2 = evolução futura. **Não confundir com severidade de bug** (Bug P0/P1/P2 em `F_QA_TEST_STRATEGY.md` §2): um chat privado inexistente é requisito P1, não bug P0. |
| **Status** | `backlog → ready → in_progress → in_review → qa → done` ou `blocked` | `ready` só com DoR atendido (objetivo, aceite, dependências, referência visual, Issue real). `done` só após DoD (CI verde, review, testes, evidências). |
| **Tam** | `S` / `M` / `L` | S ≈ 1 PR pequena e direta · M ≈ 1 PR média ou 2 pequenas · L ≈ deve ser quebrada em várias Issues/PRs antes de começar. Tamanho relativo, não prazo. |
| **Branch sugerida** | `tipo/<issue>-slug` | `<issue>` é **substituído pelo número real** da Issue. Regex obrigatória: `^(feat\|fix\|hotfix\|refactor\|perf\|test\|chore\|docs\|release)/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$` |
| **Decisão pendente** | `P-###` | Pendência do `D_DECISION_LOG.md` que pode bloquear o item. Sem a decisão, o item pode ser preparado (ex.: schema, adapter com interface), mas **não** liberado para produção. |
| **Issue #** | `—` ou `#n` | Número real do GitHub. Nunca fabricado. |

---

## 1. Ritmo de desenvolvimento

- **WIP:** no máximo **1–2 Issues em `in_progress`** ao mesmo tempo. Termina antes de abrir a próxima.
- **Uma Issue = uma branch = uma PR.** Alvo de **≤ ~400 linhas úteis** por PR (sem contar lockfile, migrations geradas e snapshots). Item `L` é quebrado em Issues menores antes de começar.
- **Fluxo:** Issue real criada → branch `tipo/<ISSUE>-slug` a partir de `develop` atualizada → commits Conventional Commits → PR para `develop` (template completo, `Closes #<issue>`) → CI verde + review → **merge squash** → deploy em staging → QA do tema.
- **Release:** ao fechar um **marco** (M1…M7), PR `develop → main` (ou `release/<issue>-vX-Y-Z`) com gates G2/G3. `hotfix/<issue>-slug` nasce de `main` e volta para `develop`.
- **Regra de PR objetiva (sem trâmite infinito):**
  - A PR resolve **a fundo** o que a Issue pede (critérios de aceite, estados de UI, autorização no servidor, testes), e **só isso**.
  - O review **só bloqueia** por: (1) bug de severidade P0/P1, (2) falha de segurança/privacidade, (3) critério de aceite não atendido, (4) CI vermelho.
  - Todo o resto (nits, refinamentos, melhorias "seria bom") vira **Issue de follow-up priorizada** (P1/P2) e **não segura o merge**.
  - **Máximo de 2 ciclos de ajuste** por PR. Se surgir um 3º ponto bloqueante, a Issue é re-escopada, não estendida indefinidamente.
- **Trilha de negócio paralela:** decisões de Ellen/Luiggi/comercial (Onda 0) andam em paralelo ao código desde o primeiro dia. Código que depende de decisão é construído atrás de interface/feature flag e só vai para produção após a decisão registrada como `D-###`.

## 2. Ordem de execução — visão geral das ondas

| Onda | Tema | Marco | Paralelismo |
|---|---|---|---|
| 0 | Setup e Discovery (inclui trilha de decisões de negócio) | M0 | Decisões de Ellen (CF-002…007) correm em paralelo a **todas** as ondas até serem fechadas |
| 1 | Fundação técnica (CI/CD, ambientes, banco, segurança base) | M1 | Começa após CF-150; Onda 2 pode iniciar quando CF-010/011 estiverem prontos |
| 2 | Design system e shell minimalista | M1 | Em paralelo ao fim da Onda 1 e à Onda 3 (tokens propostos; homologação final em CF-007) |
| 3 | Identidade e papéis | M1 | Após CF-012/016. Base obrigatória para 4–8 |
| 4 | Receita: assinaturas | M2 | Após Onda 3. Compartilha adapter/webhook com a Onda 5 |
| 5 | Café Estratégico e bilheteria | M3 | **Em paralelo** com a Onda 6 depois da fundação. Reusa o gateway da Onda 4 (CF-043/045) |
| 6 | Conteúdo e biblioteca | M4 | **Em paralelo** com as Ondas 4/5 (o schema/CMS não depende de pagamento; o player depende de CF-046) |
| 7 | Comunidade e networking | M5 | Após CF-046 (entitlement). Pode correr junto com o fim da Onda 6 |
| 8 | Jornada, home, ao vivo e administração | M6 | Home (CF-101) só depois de cursos, comunidade e onboarding prontos |
| 9 | QA e release do MVP | M7 | Suítes E2E começam assim que cada fluxo fecha; go/no-go no fim |
| 10 | Evolução P1 | Evolução | Só após M7 (go-live), salvo aprovação expressa |
| 11 | Evolução P2 | Evolução | Após uso real e nova validação |

> Ordem recomendada pelo PRD: **ENG/Auth/Security → Billing/Events → Learning → Community → Planning/Dashboard → QA/Launch**. Nenhum P1/P2 pode atrasar um P0 sem aprovação expressa.

---

## 3. Backlog por onda

### Onda 0 — Setup e Discovery (M0)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 0.1 | **CF-150 (novo)** | P0 | Setup monorepo pnpm + Turborepo (apps/web Next.js, apps/api NestJS, packages ui/contracts/config), estrutura Supabase, CI, templates GitHub, `.claude/` e docs. **Status: in_progress** | — | `chore/<issue>-setup-monorepo` (bootstrap inicial em `main`, exceção única por repo vazio) | L | P-014 (provedor final) | — |
| 0.2 | CF-001 | P0 | Auditoria do repositório e inventário (o repo estava vazio; registrar relatório, riscos e relação com `landing-ELLEN`) | — | `docs/<issue>-auditoria-inicial` | S | P-013 | — |
| 0.3 | CF-002 | P0 | Validar provedor de pagamentos em sandbox (mensal, anual, ingresso; Pix/cartão; webhooks; chargeback; taxas) | CF-001 | `docs/<issue>-decisao-gateway` (ADR + spike) | M | P-001 | — |
| 0.4 | CF-003 | P0 | Fechar contratos/termos, responsabilidade fiscal e políticas comerciais (compra, cancelamento, privacidade, evento) | CF-002 | `docs/<issue>-politicas-comerciais` | M | P-002, P-003, P-004, P-012 | — |
| 0.5 | CF-004 | P0 | Consolidar identidade visual implementável: tokens, logo, fontes licenciadas, fotos reais autorizadas | CF-001 | `docs/<issue>-identidade-visual` | M | P-006 | — |
| 0.6 | CF-005 | P0 | Decidir domínio independente e mapa de URLs | CF-001 | `docs/<issue>-dominio-urls` | S | P-005 | — |
| 0.7 | CF-006 | P0 | Validar programação mínima e calendário editorial (aulas reais e cronograma) | — | `docs/<issue>-calendario-editorial` | S | P-009 | — |
| 0.8 | CF-007 | P0 | Homologar layout v1.1 minimalista e ativos de produção (desktop/mobile, 1 hero + 1 jornada + 3 cursos + 2 auxiliares) | CF-004 | `docs/<issue>-homologacao-layout` | S | P-006 | — |

> CF-002…CF-007 são **decisões de negócio** de Ellen/Luiggi. O "código" delas é registrar o resultado (`D-###` no Decision Log, ADR, tokens finais). Elas destravam a produção, não o desenvolvimento.

### Onda 1 — Fundação técnica (M1)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 1.1 | CF-010 | P0 | Monorepo/estrutura compatível (validar o que CF-150 entregou; fechar lacunas) | CF-001, CF-150 | `chore/<issue>-estrutura-monorepo` | S | — | — |
| 1.2 | CF-011 | P0 | TS strict, lint, formatter e scripts reprodutíveis (validar em runner limpo) | CF-010 | `chore/<issue>-lint-typecheck` | S | — | — |
| 1.3 | CF-013 | P0 | Pipelines CI: lint, typecheck, testes, build, security (validar no 1º PR real) | CF-011 | `chore/<issue>-pipeline-ci` | S | — | — |
| 1.4 | CF-014 | P0 | Branch protection, templates de PR/Issue, CODEOWNERS, nome numérico obrigatório | CF-010 | `chore/<issue>-branch-protection` | S | P-015 (+ plano GitHub p/ repo privado) | — |
| 1.5 | CF-012 | P0 | Ambientes dev/staging/prod independentes (Supabase, storage, gateway sandbox separados) | CF-010 | `chore/<issue>-ambientes` | M | P-014 | — |
| 1.6 | CF-016 | P0 | Migrações versionadas + teste de compatibilidade (sobe do zero; runbook de rollback) | CF-012 | `chore/<issue>-pipeline-migrations` | M | — | — |
| 1.7 | **CF-156 (novo)** | P0 | Cliente Supabase server/browser tipado (`@supabase/ssr`), geração de types do schema no CI. *Justificativa: evita acesso direto não tipado e uso de `service_role` no browser.* | CF-012, CF-016 | `feat/<issue>-supabase-client` | S | — | — |
| 1.8 | **CF-154 (novo)** | P0 | Seeds fictícios dev/staging (planos R$89/R$790 de referência, usuários de teste por papel, sem dados reais). *Justificativa: B §5 exige seed e proíbe constantes no frontend.* | CF-016 | `chore/<issue>-seeds-ficticios` | S | — | — |
| 1.9 | **CF-155 (novo)** | P0 | Suíte pgTAP para RLS rodando no CI (base para CF-033/CF-122). *Justificativa: RLS precisa de teste automatizado por PR, não só E2E.* | CF-016, CF-013 | `test/<issue>-pgtap-rls-ci` | M | — | — |
| 1.10 | CF-017 | P0 | Logs estruturados, error tracking e healthcheck (correlation ID, sem PII) | CF-010 | `feat/<issue>-observabilidade` | M | P-014 | — |
| 1.11 | CF-019 | P0 | Gerenciamento de segredos e scanning de dependências | CF-012 | `chore/<issue>-segredos-scan` | S | — | — |
| 1.12 | **CF-152 (novo)** | P0 | Rate limiting e headers de segurança (helmet/CSP, cookies) em web e API. *Justificativa: controles P0 do PRD §09 e E §8 sem item próprio no doc C.* | CF-010 | `feat/<issue>-rate-limit-headers` | M | — | — |
| 1.13 | **CF-151 (novo)** | P0 | OpenAPI/Swagger da API `/api/v1` gerado do código, sem segredos. *Justificativa: E §11 lista OpenAPI como artefato obrigatório.* | CF-010 | `feat/<issue>-openapi` | S | — | — |
| 1.14 | **CF-161 (novo)** | P0 | Audit log genérico append-only (`audit_logs`) + helper de uso nos módulos. *Justificativa: exigido por CF-041/048/061/070/095, mas sem item base.* | CF-016 | `feat/<issue>-audit-log` | M | — | — |
| 1.15 | **CF-157 (novo)** | P0 | Padrões Next: `error.tsx`, `loading.tsx`, `not-found.tsx`, `EmptyState`/`ErrorState` base. *Justificativa: convenção de estados do PRD §03 em todas as telas.* | CF-010 | `feat/<issue>-estados-padrao-next` | S | — | — |
| 1.16 | **CF-158 (novo)** | P0 | Feature flags simples por ambiente para módulos não lançados. *Justificativa: lançamento progressivo sem CTA morto (B §8) e código pronto atrás de decisão pendente.* | CF-010 | `feat/<issue>-feature-flags` | S | — | — |
| 1.17 | **CF-162 (novo)** | P0 | Buckets privados no Storage + política de upload (tipo/tamanho) + signed URLs de curta duração. *Justificativa: base comum para materiais, capas e anexos (CF-085, CF-066).* | CF-012, CF-016 | `feat/<issue>-storage-privado` | M | P-007 (vídeo à parte) | — |
| 1.18 | **CF-163 (novo)** | P0 | Política de cache/rendering Next: público cacheável com revalidação em mudança de preço/evento, privado `no-store`. *Justificativa: E §7; evita preço desatualizado e vazamento de dados por cache.* | CF-010 | `feat/<issue>-politica-cache` | S | — | — |
| 1.19 | CF-015 | P0 | Pipeline de deploy staging e produção com gates (promoção rastreável, smoke) | CF-012, CF-013 | `chore/<issue>-deploy-pipeline` | M | P-014, P-005 | — |
| 1.20 | CF-018 | P0 | Backup e teste de restauração; runbook de incidente | CF-012 | `docs/<issue>-backup-restore-runbook` | M | P-014 | — |

### Onda 2 — Design system e shell minimalista (M1)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 2.1 | CF-020 | P0 | Base de design system, AppShell, layouts público/privado/admin (cream + plum, tokens v1.1) | CF-004, CF-010, CF-007 | `feat/<issue>-design-system-shell` | L | P-006 | — |
| 2.2 | CF-021 | P0 | Sidebar progressiva (≤ 6 links + Mais) e topbar minimalista; drawer mobile | CF-020 | `feat/<issue>-sidebar-mais` | M | — | — |
| 2.3 | CF-022 | P0 | Componentes editoriais: EditorialHero, JourneyFocusCard, CourseCard, cartões compactos, estados | CF-020 | `feat/<issue>-componentes-editoriais` | M | — | — |

> CF-020 pode ser **desenvolvido com os tokens propostos** do doc G. A homologação (CF-007) é gate de merge para `main`, não para começar.

### Onda 3 — Identidade e papéis (M1)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 3.1 | CF-030 | P0 | Cadastro/login/verificação/recuperação de senha (Supabase Auth) | CF-012 | `feat/<issue>-auth` | M | — | — |
| 3.2 | CF-031 | P0 | Perfis pessoais com consentimentos versionados | CF-030, CF-016 | `feat/<issue>-perfis-consentimentos` | M | P-012 | — |
| 3.3 | CF-032 | P0 | RBAC owner/commercial/tech/member (servidor) | CF-030 | `feat/<issue>-rbac` | M | — | — |
| 3.4 | CF-033 | P0 | RLS e testes de isolamento/IDOR em todas as tabelas com PII | CF-031, CF-032, CF-155 | `test/<issue>-rls-idor` | M | — | — |
| 3.5 | CF-034 | P0 | MFA/admin hardening e restrição de rotas `/admin` | CF-032 | `feat/<issue>-mfa-admin` | M | — | — |
| 3.6 | CF-035 | P0 | Onboarding inicial (estágio, cidade/UF, objetivo) com retomada | CF-031 | `feat/<issue>-onboarding` | M | — | — |
| 3.7 | **CF-153 (novo)** | P0 | Páginas legais LGPD (termos, privacidade, cookies) + centro de preferências de comunicação. *Justificativa: exigidas por CF-01/CF-13 e pelo checklist go/no-go, mas sem item de implementação.* | CF-031, CF-003 | `feat/<issue>-paginas-lgpd` | M | P-012, P-004 | — |

### Onda 4 — Receita: assinaturas (M2)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 4.1 | CF-100 | P0 | Provedor de e-mail e templates transacionais (signup, compra, ingresso) com retry/log | CF-012 | `feat/<issue>-email-transacional` | M | P-008 | — |
| 4.2 | CF-040 | P0 | Schema `plans`, `price_versions`, `subscriptions`, `payments`, `entitlements`, `webhook_receipts` | CF-016, CF-002 | `feat/<issue>-schema-billing` | M | P-001 | — |
| 4.3 | CF-041 | P0 | CRUD owner de planos e versões de preço (novas vendas, sem retroatividade) | CF-040, CF-032 | `feat/<issue>-crud-planos` | M | — | — |
| 4.4 | CF-042 | P0 | Landing pública e comparador de planos com checkout | CF-020, CF-041, CF-003 | `feat/<issue>-landing-planos` | M | P-002 | — |
| 4.5 | CF-043 | P0 | Adapter do gateway + checkout assinatura mensal | CF-040, CF-002 | `feat/<issue>-gateway-mensal` | L | P-001 | — |
| 4.6 | CF-045 | P0 | Webhook autenticado, idempotente, com reconciliação | CF-043 | `feat/<issue>-webhook-idempotente` | M | P-001 | — |
| 4.7 | CF-046 | P0 | Máquina de estados e regra de acesso por entitlement | CF-045, CF-032 | `feat/<issue>-entitlements` | M | — | — |
| 4.8 | **CF-160 (novo)** | P0 | Outbox + worker idempotente para e-mails e emissões pós-pagamento. *Justificativa: PRD §7.5; erro de e-mail não pode reverter pagamento nem duplicar envio.* | CF-045, CF-100 | `feat/<issue>-outbox-worker` | M | P-014 | — |
| 4.9 | CF-044 | P0 | Plano anual 12x **ou bloqueio explícito se não suportado** | CF-043, CF-003 | `feat/<issue>-plano-anual` | M | P-002 | — |
| 4.10 | CF-047 | P0 | Minha Assinatura: estado, cobranças, instruções de gestão | CF-046 | `feat/<issue>-minha-assinatura` | S | — | — |
| 4.11 | CF-048 | P0 | Concessões manuais com expiração e auditoria (owner-only) | CF-046, CF-161 | `feat/<issue>-concessao-manual` | S | — | — |
| 4.12 | CF-049 | P0 | Testes de falha, estorno, renovação, chargeback e corrida | CF-045, CF-046 | `test/<issue>-billing-cenarios` | M | P-002 | — |

### Onda 5 — Café Estratégico e bilheteria (M3) — em paralelo com a Onda 6
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 5.1 | CF-060 | P0 | Schema edição, lote, reserva, pedido, ingresso, check-in (constraints anti-duplicidade) | CF-016 | `feat/<issue>-schema-eventos` | M | — | — |
| 5.2 | CF-061 | P0 | CRUD de evento e lotes no admin (rascunho → publicado com dados mínimos) | CF-060, CF-032 | `feat/<issue>-crud-eventos` | M | P-010 | — |
| 5.3 | CF-062 | P0 | Landing dinâmica `/eventos/[slug]` | CF-061, CF-020 | `feat/<issue>-landing-evento` | M | P-010 | — |
| 5.4 | **CF-165 (novo)** | P0 | Listagem pública `/eventos` (edições publicadas, sem eventos fictícios). *Justificativa: rota do sitemap §4.2 sem item próprio.* | CF-062 | `feat/<issue>-listagem-eventos` | S | — | — |
| 5.5 | CF-063 | P0 | Capacidade, reserva TTL e concorrência (row lock/constraints) | CF-060, CF-061 | `feat/<issue>-reserva-ttl` | M | — | — |
| 5.6 | **CF-159 (novo)** | P0 | Job agendado de expiração de reservas TTL (devolve vaga ao estoque, idempotente). *Justificativa: QA-019 exige que a vaga volte; precisa de scheduler.* | CF-063 | `feat/<issue>-job-expiracao-reservas` | S | P-014 | — |
| 5.7 | CF-064 | P0 | Checkout Pix/cartão e estados do pedido de ingresso | CF-002, CF-063 | `feat/<issue>-checkout-ingresso` | M | P-001, P-003 | — |
| 5.8 | CF-065 | P0 | Webhook de ingresso, emissão idempotente e pagamento tardio | CF-064, CF-045 | `feat/<issue>-emissao-ingresso` | M | — | — |
| 5.9 | CF-066 | P0 | QR opaco (token hasheado, sem PII) e página protegida do ingresso | CF-065 | `feat/<issue>-qr-ingresso` | M | — | — |
| 5.10 | CF-067 | P0 | Envio transacional do ingresso e segunda via segura | CF-066, CF-100 | `feat/<issue>-envio-ingresso` | S | P-008 | — |
| 5.11 | CF-068 | P0 | Interface de check-in (câmera + busca manual) para commercial/owner | CF-066, CF-032 | `feat/<issue>-interface-checkin` | M | P-011 | — |
| 5.12 | CF-069 | P0 | Check-in atômico e anti-replay (`unused → used`, operador, hora) | CF-068 | `feat/<issue>-checkin-atomico` | S | — | — |
| 5.13 | CF-070 | P0 | Cancelamento, estorno e invalidação de ingresso | CF-065, CF-066 | `feat/<issue>-cancelamento-ingresso` | M | P-003 | — |
| 5.14 | **CF-164 (novo)** | P0 | Captura de atribuição café → assinatura (`origin_event_id`, `acquisition_channel=event`) no checkout, sem dupla atribuição. *Justificativa: J2 e US-011; CF-071/106 só relatam, ninguém captura.* | CF-043, CF-065 | `feat/<issue>-atribuicao-cafe` | M | — | — |
| 5.15 | CF-071 | P0 | Relatório do evento: vendas, vagas, presentes, atribuição | CF-069, CF-046, CF-164 | `feat/<issue>-relatorio-evento` | M | — | — |
| 5.16 | CF-072 | P0 | Simulação do evento piloto e checklist de operação no local | CF-067, CF-071 | `test/<issue>-simulacao-piloto` | M | P-010, P-011 | — |

### Onda 6 — Conteúdo e biblioteca (M4) — em paralelo com a Onda 5
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 6.1 | CF-080 | P0 | Schema trilhas/cursos/módulos/aulas e status (`rascunho`/`agendada`/`publicada`) | CF-016 | `feat/<issue>-schema-conteudo` | M | — | — |
| 6.2 | CF-081 | P0 | CMS owner: criar/editar/publicar/agendar sem deploy | CF-080, CF-032 | `feat/<issue>-cms-conteudo` | L | — | — |
| 6.3 | CF-082 | P0 | Catálogo e filtros básicos (publicados vs programados) | CF-081, CF-020 | `feat/<issue>-catalogo-cursos` | M | — | — |
| 6.4 | CF-083 | P0 | Player de vídeo autenticado com provedor protegido | CF-082, CF-046 | `feat/<issue>-player-protegido` | L | P-007 | — |
| 6.5 | CF-084 | P0 | Progresso por membro, conclusão e "continuar aula" | CF-083 | `feat/<issue>-progresso-aulas` | M | — | — |
| 6.6 | CF-085 | P0 | Biblioteca de materiais privados com acesso temporário | CF-046, CF-016, CF-162 | `feat/<issue>-cofre-materiais` | M | — | — |
| 6.7 | CF-086 | P0 | Publicar a primeira onda de aulas e recursos reais (operação de conteúdo) | CF-081, CF-006 | `docs/<issue>-primeira-onda-conteudo` | M | P-009 | — |

### Onda 7 — Comunidade e networking (M5)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 7.1 | CF-090 | P0 | Perfis públicos opt-in para o diretório (contato privado por padrão) | CF-031, CF-046 | `feat/<issue>-perfil-diretorio` | M | — | — |
| 7.2 | CF-091 | P0 | Busca cidade/UF/áreas, paginada e com rate limit | CF-090 | `feat/<issue>-busca-diretorio` | M | — | — |
| 7.3 | CF-092 | P0 | CRUD de grupos temáticos no admin | CF-032, CF-016 | `feat/<issue>-crud-grupos` | S | — | — |
| 7.4 | CF-093 | P0 | Aderir a grupo e feed de publicações | CF-092, CF-046 | `feat/<issue>-feed-grupos` | M | — | — |
| 7.5 | CF-094 | P0 | Publicar/editar/excluir posts próprios e comentar (XSS neutralizado) | CF-093 | `feat/<issue>-posts-comentarios` | M | — | — |
| 7.6 | CF-095 | P0 | Denúncias e moderação owner (privada, auditada) | CF-094, CF-032, CF-161 | `feat/<issue>-moderacao` | M | — | — |
| 7.7 | CF-096 | P0 | Regras da comunidade e aviso contra sigilo de clientes | CF-094, CF-003 | `feat/<issue>-regras-comunidade` | S | P-012 | — |

### Onda 8 — Jornada, home, ao vivo e administração (M6)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 8.1 | CF-102 | P0 | Diagnóstico inicial (5–10 perguntas) e recomendações determinísticas | CF-035, CF-016 | `feat/<issue>-diagnostico` | M | — | — |
| 8.2 | CF-103 | P0 | Objetivo de 90 dias e 3 tarefas de 30 dias (privados) | CF-102 | `feat/<issue>-planejamento-metas` | M | — | — |
| 8.3 | CF-104 | P0 | Calendário/admin de encontros ao vivo com link protegido | CF-032, CF-020 | `feat/<issue>-encontros-ao-vivo` | M | — | — |
| 8.4 | CF-107 | P0 | Ajuda e canal de suporte operacional | CF-020 | `feat/<issue>-ajuda-suporte` | S | — | — |
| 8.5 | CF-105 | P0 | Painel administrativo (owner) e painel limitado do comercial | CF-032, CF-071, CF-081 | `feat/<issue>-painel-admin` | L | — | — |
| 8.6 | CF-106 | P0 | Relatórios por período: aquisição, recebimentos, retenção (café vs online) | CF-045, CF-071 | `feat/<issue>-relatorios` | M | — | — |
| 8.7 | CF-101 | P0 | Home híbrida minimalista v1.1 com dados reais e estados vazios | CF-084, CF-094, CF-035, CF-021, CF-022 | `feat/<issue>-home-minimalista` | M | — | — |
| 8.8 | CF-111 | P0 | QA de estados da home e navegação progressiva | CF-101 | `test/<issue>-qa-estados-home` | S | — | — |

### Onda 9 — QA e release do MVP (M7)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 9.1 | CF-120 | P0 | Suíte E2E: autenticação, compra e bloqueio de conteúdo | CF-046, CF-083 | `test/<issue>-e2e-auth-compra` | M | — | — |
| 9.2 | CF-121 | P0 | Suíte E2E: bilheteria, dupla venda e check-in | CF-069, CF-070 | `test/<issue>-e2e-bilheteria` | M | — | — |
| 9.3 | CF-122 | P0 | Suíte de segurança RLS/IDOR/RBAC por papel | CF-033, CF-095 | `test/<issue>-seguranca-papeis` | M | — | — |
| 9.4 | CF-123 | P0 | QA mobile/responsivo/a11y/polimento editorial (320…1440px) | CF-101, CF-062 | `test/<issue>-qa-responsivo-a11y` | M | — | — |
| 9.5 | CF-127 | P0 | Screenshots de regressão visual das telas P0 | CF-020, CF-101, CF-062 | `test/<issue>-regressao-visual` | M | — | — |
| 9.6 | CF-124 | P0 | Homologação de conteúdo e termos de venda por Ellen | CF-086, CF-003 | `docs/<issue>-homologacao-conteudo` | S | P-003, P-009 | — |
| 9.7 | CF-125 | P0 | Backup/restore + rollback + smoke pré-release | CF-018, CF-015 | `test/<issue>-restore-rollback-smoke` | M | P-014 | — |
| 9.8 | CF-126 | P0 | Go/no-go e deploy controlado com monitoramento | CF-120…CF-125, CF-127 | `release/<issue>-v1-0-0` | M | todas as P0 abertas | — |

### Onda 10 — Evolução P1 (após go-live)
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 10.1 | CF-087 | P1 | Busca transversal por cursos/materiais | CF-082, CF-085 | `feat/<issue>-busca-transversal` | M | — | — |
| 10.2 | CF-097 | P1 | Reações, anexos em posts e notificações de discussões | CF-094 | `feat/<issue>-reacoes-anexos` | M | — | — |
| 10.3 | CF-109 | P1 | Mensagens de novos conteúdos e lembretes (com consentimento/opt-out) | CF-100 | `feat/<issue>-avisos-conteudo` | M | — | — |
| 10.4 | CF-108 | P1 | Histórico de diagnósticos e score de 7 áreas | CF-103 | `feat/<issue>-historico-diagnostico` | M | P-016 | — |
| 10.5 | CF-142 | P1 | Exportações de relatórios (CSV) e ferramentas editoriais avançadas | CF-106 | `feat/<issue>-exportacoes` | M | — | — |
| 10.6 | **CF-166 (novo)** | P1 | Upload de foto de perfil com validação e remoção (diretório). *Justificativa: o PRD cita foto opt-in; P0 usa placeholder não personalizado.* | CF-090, CF-162 | `feat/<issue>-foto-perfil` | S | — | — |
| 10.7 | **CF-167 (novo)** | P1 | Direitos do titular LGPD: exportar, excluir e anonimizar conta com preservação fiscal. *Justificativa: PRD §8.4; depende da política de retenção.* | CF-153 | `feat/<issue>-direitos-titular` | M | P-012 | — |
| 10.8 | CF-098 | P1 | Mensagens privadas 1:1 com privacidade, bloqueio e moderação (**fora do MVP**) | CF-090, CF-095 | `feat/<issue>-mensagens-privadas` | L | — | — |
| 10.9 | CF-140 | P1 | Plano de integração Ellen Conrado, SSO e domínio (ADR) | CF-126 | `docs/<issue>-adr-integracao-ellen` | M | P-017, P-005 | — |
| 10.10 | CF-141 | P1 | Execução gradual da integração ao projeto Ellen Conrado | CF-140 | `feat/<issue>-integracao-ellen` | L | P-017 | — |
| 10.11 | **CF-168 (novo)** | P1 | Upgrade NestJS 11 → 12 (ESM) e reavaliar Vitest+SWC na API. *Justificativa: Nest 12 saiu em set/2026; setup ficou no 11 para estabilidade (ADR 0001).* | CF-126 | `chore/<issue>-upgrade-nestjs-12` | M | — | — |

### Onda 11 — Evolução P2
| Ordem | CF-ID | Pri | Título | Dependências | Branch sugerida | Tam | Decisão pendente | Issue # |
|---|---|---|---|---|---|---|---|---|
| 11.1 | CF-110 | P2 | Metas gamificadas, IA e recomendação por comportamento | CF-108 | `feat/<issue>-gamificacao-ia` | L | avaliação LGPD | — |
| 11.2 | CF-143 | P2 | Benefícios comerciais Seven Box (cupom/link), sem acesso acidental | CF-126 | `feat/<issue>-beneficio-seven-box` | S | acordo comercial | — |
| 11.3 | CF-144 | P2 | Matching de membros, desafios, gamificação e assistente IA | CF-098, CF-108 | `feat/<issue>-matching-desafios` | L | nova validação | — |

### Contagem
| Prioridade | Doc C | Novos (CF-150+) | Total |
|---|---|---|---|
| P0 | 80 | 16 | 96 |
| P1 | 8 | 3 | 11 |
| P2 | 3 | 0 | 3 |
| **Total** | **91** | **19** | **110** |

---

## 4. Marcos e critério de pronto

| Marco | Itens essenciais | Critério de pronto / demonstração de valor |
|---|---|---|
| **M0 — Entendimento** | CF-150, CF-001…CF-007 | Repositório configurado e auditado; decisões bloqueantes encaminhadas com responsável; referência minimalista homologada (CF-007) |
| **M1 — Fundação** | CF-010…CF-022, CF-030…CF-035, CF-151…CF-158, CF-161…CF-163 | App protegido em staging; CI bloqueando PR; migrations do zero; login + papéis testados (RLS/IDOR); shell minimalista com tokens v1.1 em desktop/mobile |
| **M2 — Pagamentos** | CF-040…CF-049, CF-100, CF-160 | Compra mensal sandbox ativa acesso só via webhook; webhook duplicado sem efeito; anual homologado **ou** desativado explicitamente |
| **M3 — Café** | CF-060…CF-072, CF-159, CF-164, CF-165 | Vender 1 ingresso de teste, receber QR por e-mail, validar no check-in; 21ª venda bloqueada com capacidade 20; segundo check-in negado |
| **M4 — Conteúdo** | CF-080…CF-086 | Ellen publica curso/aula sem código; membro assiste, progride e baixa material; visitante/expirado bloqueado na mídia |
| **M5 — Comunidade** | CF-090…CF-096 | Perfil opt-in na busca; grupo, post, comentário e denúncia funcionando; sem DM |
| **M6 — Jornada & gestão** | CF-101…CF-107, CF-111 | Home minimalista (1 hero + 1 jornada + ≤3 cursos + ≤2 auxiliares) com dados reais; metas privadas; relatórios reais distinguindo café e online |
| **M7 — QA/release** | CF-120…CF-127 | Evidências visuais e funcionais, restore testado, go/no-go assinado (Ellen + Luiggi + comercial), produção rastreável por tag |
| **Evolução** | CF-087, 097, 098, 108…110, 140…144, 166, 167 | Crescimento guiado por uso real e integração futura ao portal Ellen Conrado |

## 5. Bloqueios externos e decisões de negócio

| ID | Decisão em aberto | Responsável | Momento-limite | Bloqueia |
|---|---|---|---|---|
| P-001 | Gateway de assinatura/ingresso, taxas Pix/cartão, split e contrato | Ellen + Luiggi | Antes do billing | CF-002, CF-040, CF-043, CF-045, CF-064 |
| P-002 | Anual em 12x: cobrança, repasse, inadimplência, renovação, cancelamento | Ellen + contador/jurídico + gateway | Antes de vender o anual | CF-003, CF-042, CF-044, CF-049 |
| P-003 | Política de estorno, transferência e cancelamento do café | Ellen + jurídico | Antes de vender ingressos | CF-003, CF-064, CF-070, CF-124 |
| P-004 | Empresa/CNPJ, notas fiscais e tributação | Ellen + contador | Antes de produção | CF-003, CF-153 |
| P-005 | Domínio da plataforma e destino futuro no site Ellen Conrado | Ellen + Luiggi | Antes do DNS de produção | CF-005, CF-015, CF-140 |
| P-006 | Logo definitiva, fonte oficial, fotos reais autorizadas, HEX exatos | Ellen | Antes de publicar a marca final | CF-004, CF-007, CF-020 |
| P-007 | Provedor de vídeo, proteção de mídia e custo | Luiggi + Ellen | Antes do player de produção | CF-083, CF-162 (vídeo) |
| P-008 | Provedor de e-mail, remetente e domínio autenticado | Luiggi | Antes dos ingressos reais | CF-100, CF-067 |
| P-009 | Conteúdo efetivamente disponível e calendário prometido | Ellen | Antes da primeira venda | CF-006, CF-086, CF-124 |
| P-010 | Local, data, capacidade e recepção do café | Ellen + comercial | Antes de anunciar o evento | CF-061, CF-062, CF-072 |
| P-011 | Quem valida o check-in presencial (temporários?) | Ellen | Antes do evento | CF-068, CF-072 |
| P-012 | Retenção/exclusão, termos, moderação e responsabilidade por dados | Ellen + jurídico | Antes da operação real | CF-003, CF-031, CF-096, CF-153, CF-167 |
| P-013 | Estado real do repositório e integrações existentes | Luiggi | Antes de implementar | CF-001 (repo vazio na auditoria do setup) |
| P-014 | Hosting, backups, observabilidade e custos (inclui Supabase cloud × local) | Luiggi | Fundação técnica | CF-012, CF-015, CF-017, CF-018, CF-125, CF-159, CF-160 |
| P-015 | Número literal da PR na branch × número da Issue (padrão aprovado: Issue) | Ellen + Luiggi | Antes do primeiro fluxo Git | CF-014 |
| P-016 | Certificados, mentorias e encontros especiais | Ellen | Refinamento P1 | CF-108 (e futuros itens P1) |
| P-017 | Migração futura de recorrências, SSO e contas | Ellen + Luiggi | Antes da integração P1 | CF-140, CF-141 |

## 6. Próximos 10 passos imediatos (após o setup)

1. **Fechar CF-150:** commit do setup em `main`, criar `develop`, push das duas e confirmar que o CI roda.
2. **Bootstrap do GitHub** (`.github/scripts/bootstrap-github.sh`, após `gh auth login`): labels P0/P1/P2, `type:*`, `epic:*`; milestones M0–M7; Issues P0 das Ondas 0–3. Depois, preencher a coluna `Issue #` deste arquivo numa PR `docs/<issue>-numeros-issues`.
3. **Trilha de negócio (Ellen):** iniciar CF-002 (gateway, P-001), CF-004/CF-007 (identidade e homologação visual, P-006) e CF-006 (calendário editorial, P-009). Em paralelo, sem bloquear o código.
4. **CF-001:** registrar o relatório de auditoria (repo vazio, `landing-ELLEN` separado, ferramentas da máquina) e fechar P-013.
5. **CF-011 / CF-013 / CF-014:** primeiro PR real para `develop` validando `branch-convention`, lint, typecheck, test, build e security. Aplicar branch protection (ou registrar a limitação do plano GitHub para repo privado).
6. **CF-012 (P-014):** decidir Supabase cloud × local (Docker) e criar os projetos dev/staging isolados.
7. **CF-016 + CF-156 + CF-154:** pipeline de migrations, cliente Supabase tipado e seeds fictícios.
8. **CF-020:** shell minimalista com tokens propostos e screenshots 1440/390px para a homologação de Ellen (CF-007).
9. **CF-030:** autenticação (cadastro, login, recuperação, sessão).
10. **CF-032 → CF-033 (+ CF-155):** RBAC no servidor e RLS com testes de isolamento/IDOR no CI. Isso destrava as Ondas 4, 5 e 6.
