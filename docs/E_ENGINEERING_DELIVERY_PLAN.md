# CAIXA FORTE — ENGINEERING DELIVERY PLAN
**Versão:** 1.1 · **Data:** 19/10/2026 · **Stack orientadora:** Next.js + React + TS strict + Tailwind; Node.js/NestJS; Supabase/PostgreSQL

> Este plano se aplica aos desenvolvedores e agentes de IA. A direção visual aprovada em 19/10/2026 está em `G_DESIGN_SYSTEM_MINIMALISTA.md`. O procedimento executável e comandos Git Flow estão em `H_GUIA_CLAUDE_CODE_GITFLOW.md` e `CLAUDE.md`. O estado do repositório precisa ser auditado antes de realizar mudanças. **Não confundir intenção de processo com automações já implantadas**: workflows, ambientes e branch rules deste documento são requisitos **a implementar e testar**.

## 1. Modelo de trabalho e governança
Fluxo iterativo de engenharia: **decisão de produto → Issue rastreável → DoR → branch tipada e numerada → mudanças pequenas → testes → PR → revisão → CI → integração → staging → QA → aprovação Ellen (produto) e Luiggi (técnica) → produção → smoke/monitoramento**.

**Responsabilidades:** Ellen decide escopo, preços, identidade, funcionalidades e homologação de produto; Luiggi decide implementação dentro da stack e políticas aprovadas, controla release; comercial homologa venda/QR/check-in e reporta falhas. A mesma pessoa pode executar múltiplas funções, mas evidências e gates não deixam de existir. Para produção de pagamento, mudanças de acesso e migrações potencialmente destrutivas, exigir uma aprovação técnica explícita **além** da homologação de negócio, mesmo quando o código foi gerado por agente.

## 2. Repositório recomendado
```text
caixa-forte/
  apps/
    web/                  Next.js App Router, layout, páginas públicas/privadas/admin
    api/                  NestJS módulos por domínio e OpenAPI
  packages/
    ui/                   tokens, componentes e padrões compartilhados
    contracts/            schemas/DTO/tipos aprovados e versionados
    config/               lint, tsconfig, presets
  supabase/
    migrations/           migrações versionadas
    seeds/                dados fictícios dev/staging, sem usuários reais
  infrastructure/         deploy/config infra, sem segredos
  docs/
    adr/                  architectural decision records
    qa/                   casos e evidências sem PII
    runbooks/             incidentes, deploy, rollback, backups
  .github/
    workflows/            ci, deploy-staging, deploy-production
    ISSUE_TEMPLATE/
    pull_request_template.md
  pnpm-workspace.yaml     ou package manager compatível com repo existente
```
A estrutura só se aplica após comparar com o repositório real. Não migrar de package manager ou reestruturar pastas sem justificativa. **NestJS é preferencial** conforme diretriz da cliente; considerar fases somente mediante ADR que preserva as decisões de stack e os fluxos críticos.

## 3. Git Flow adaptado e branch protection
**Branches permanentes:**
- `main`: **release aprovada para produção**, protegida, sem push direto, sem force push, sem exclusão, PR obrigatório, checks obrigatórios.
- `develop`: integração, protegida, PR obrigatório, checks obrigatórios, deploy controlado para staging.

**Branches temporárias:** `feat`, `fix`, `hotfix`, `refactor`, `perf`, `test`, `chore`, `docs`, `release`.

**REGRA NÃO NEGOCIÁVEL:** toda branch temporária deve conter **tipo + identificador numérico real + slug**, com padrão `^(feat|fix|hotfix|refactor|perf|test|chore|docs|release)/[0-9]+-[a-z0-9]+(?:-[a-z0-9]+)*$`.

Exemplos reais de **formato**, sem implicar existência no GitHub:
- `feat/123-perfis-diretorio`
- `fix/124-checkin-duplicado`
- `test/125-webhook-replay`
- `hotfix/126-controle-acesso`
- `release/127-v1-0-0`

**Número obrigatório é o da Issue/Tarefa previamente criada no GitHub.** Isso não deve ser confundido com o número da Pull Request: o número de PR é atribuído somente ao criá-la. Uma correspondência literal `branch = tipo/<numero-da-propria-pr>-...` precisaria de uma estratégia especial de bootstrap/abertura ou aceitação de interrupção e novo PR, não sendo assumida. Se a cliente mantiver requisito literal do número da própria PR, **não desrespeitar silenciosamente**: registrar `P-015` e homologar metodologia antes de executar. Usar número da Issue atende à rastreabilidade sem inventar números nem depender de renomear a branch da PR aberta.

**Origens/destinos:**
- `feat/fix/refactor/perf/test/chore/docs`: ramificam de `develop`, PR para `develop`.
- `release`: criada a partir de `develop` com Issue de release; só estabilização; PR para `main`, depois sincronizar `main` de volta a `develop` (merge ou cherry-pick rastreado conforme política).
- `hotfix`: ramifica de `main`, PR de emergência para `main` com testes/CI e aprovação proporcionais ao risco; **obrigatório** reproduzir correção em `develop` e testar.
- Para equipe pequena, releases frequentes podem ocorrer diretamente por PR `develop → main` com Issue de release, sem exigir branch `release` sempre; opção é ADR a validar. Não manter duas fontes de verdade por tempo prolongado.

**Commits:** Conventional Commits, pequenos e temáticos. Identificador numérico **opcional no commit**. Proibir mensagens vazias como `update`/`final`. Não fazer `git push --force` em branch compartilhada nem reescrever histórico de produção; nunca commitar `.env`, chaves, exportações de dados e backups.

## 4. Template obrigatório de Issue e PR
**Issue (DoR):** `CF-ID`, Epic, descrição, usuário/resultado, escopo, não escopo, prioridade, regras de negócio, casos de aceite, referências de UI, impacto em dados, dependências, plano de teste.

**PR:** `CF-ID` + Issue `#n`; por quê e o quê; screenshots reais antes/depois se UI; mudanças de API e migrations; checklist de segurança/RLS; testes executados com output (não apenas “ok”); riscos e rollback; link preview/staging; evidência QA; impacto em preços/serviços; marcação de modificação crítica.

**Checks de aprovação:** nome numérico da branch, Issue vinculada, status checks protegidos, revisão por quem não realizou alteração quando possível, conversas resolvidas, branches atualizadas contra base, cobertura dos fluxos mudados. Não exigir code review meramente formal de agente que aprovou o próprio código; se equipe for pequena, explicitar revisão manual diferenciada por criticidade.

## 5. CI — Continuous Integration

### 5.1 Pipeline de pull request (bloqueante)
1. Checkout com permissões mínimas do workflow (`contents: read`, sem credencial de produção).
2. Validar branch naming e Issue link; PR não recebe aprovação automática só por ter número válido.
3. Instalação reprodutível pelo lockfile.
4. Lint + format check + TypeScript strict typecheck.
5. Verificar compatibilidade de contratos API e migrations.
6. Testes unitários e de integração nas áreas alteradas.
7. Testes RLS/ownership por suíte e2e/integration pertinente.
8. Build produção da web/API.
9. Varredura de segredos, SAST e vulnerabilidades críticas de dependências.
10. Relatório em PR com sucesso/falha; testes ignorados explicitamente marcados.

**Exemplos de nomes de status-check a proteger:** `branch-convention`, `lint-and-typecheck`, `unit-integration`, `database-security`, `build`, `dependency-security`. Scripts reais serão ajustados após inventário do repositório, evitando comandos fantasmas.

### 5.2 Esboço ilustrativo de validação de branch (não workflow pronto para deploy)
```bash
BRANCH="$1"
if [[ ! "$BRANCH" =~ ^(feat|fix|hotfix|refactor|perf|test|chore|docs|release)/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "Branch inválida: exija tipo/NUMERO_DA_ISSUE-slug"
  exit 1
fi
# O workflow deve também verificar por API que o número corresponde a uma
# Issue real e relacionada à PR, com escopo/permissões mínimos.
```

**Segurança dos workflows:** em eventos de PR de forks/código não confiável, não usar secrets de produção; não executar código do branch em `pull_request_target` com permissões de escrita; actions pinadas em versões auditadas; dependabot/renovate com regras; isolamento dos runners. Nunca executar migrations de produção a partir de PR não revisada.

### 5.3 Política de testes e performance da CI
- Fast-path por PR com checks críticos, suite E2E completa em staging/antes de release; não manter fluxo crítico sem teste E2E.
- Flaky tests não são “resolvidos” sendo ignorados; registrar causa e corrigir, com exceção temporária aprovada e com prazo.
- Falha anterior à PR deve ter baseline verificável; não mascarar alterando snapshots arbitrariamente.
- Não impor percentual genérico de cobertura como substituto de cobertura de cenários P0. Meta quantitativa posterior, justificada pelos riscos.

## 6. CD — deploy e ambientes
| Ambiente | Uso | Dados / credenciais | Deploy |
|---|---|---|---|
| Local | Desenvolvimento | dados sintéticos, chaves sandbox | local |
| Preview PR | Revisão UI quando suportado | banco de preview ou dados mock segregados | temporário, sem pagamentos reais |
| Staging | Homologação de integração e QA | Supabase isolado, gateway sandbox, dados fictícios | PR mergeado em `develop`, conforme gate |
| Production | Usuários reais | credenciais próprias, backups e observabilidade | PR/release aprovada em `main` |

**Regra:** não usar banco de produção para staging; dados reais não são copiados sem anonimização e base legal. DNS, domínio, CORS, webhooks, Storage e e-mail com configuração explícita por ambiente. Secret manager, sem `.env` versionado.

**Pipeline de release:** tag SemVer (`v1.1.0`) depois de aprovação; artefato imutável ou commit SHA; migration review; backups/restore readiness; deploy controlado; smoke; monitorar taxas de erro/latência, compra sandbox de produção quando viável e sem cobrança real não autorizada; release note e changelog.

### Rollback
- Web/frontend: voltar a versão anterior do artefato.
- API: compatibilidade `N-1` quando possível.
- DB: **rollback automático nem sempre seguro**. Preferir migrations aditivas, `expand/contract`, plano de forward-fix quando necessário e backup testado; migração destrutiva precisa de plano explícito e janela controlada.
- Gateway: webhooks/replay persistidos e reconciliação. Ao voltar código, confirmar semântica dos eventos pendentes.
- Comunicação: Ellen decide se clientes precisam ser avisados de incidente/cancelamento; considerar LGPD.

## 7. Planejamento de arquitetura e padrões de código

**Domínios Nest:** identity, membership, billing, learning, resources, community, events, ticketing, planning, admin, audit, notification. Sem “service” gigantesco cross-domain. API REST `/api/v1`, DTO e validação estrita; CORS por ambiente; input sanitization e output minimization. Tipos/contratos reutilizáveis se stack compatível; limites de responsabilidade claros.

**Next:** App Router com rendering e caching analisados por conteúdo; página pública cacheável com invalidação quando preço/evento muda, área privada `no-store` onde há sessão/dados pessoais; tratar status de pagamento no servidor, não via `query string` confiável; `error.tsx` e `loading.tsx` para transições.

**Supabase:** RLS e policies versionadas para acesso direto autenticado; mesmo com Nest privilegiado, verificação RBAC/ABAC e vínculo do recurso no servidor. Storage privado, signed URLs de curta duração; Auth como autoridade de identidade; roles em DB confiável, não em campos editáveis pelo cliente. Índices para filtros e paginação. Testar migrations do zero e incrementalmente.

**Vídeo:** proteção de mídia por provider adequado, CDN/custos sob contrato, URLs com validade/assinatura; lembrar que não existe impedimento absoluto de gravação de tela. Segurança proporcional, sem falsa promessa de DRM inviolável.

**Pagamentos:** adapter de gateway; idempotency keys; armazenamento mínimo de dados (não armazenar cartão); event sourcing parcial desnecessário, mas `webhook_receipts` + transições auditadas + reconciliação; controles de disputa; modelar parcelas anuais sem simular MRR financeiro.

**Bilheteria:** row-level lock/consistência transacional para reserva/estoque, TTL, compensações para webhook tardio, ingresso token opaco hasheado em DB, `UNIQUE(ticket_id)` em `checkins` e condição transacional para evitar double-use. Sem QR aberto com CPF/e-mail.

## 8. Segurança operacional e incidentes
- Threat model mínimo para Auth, paywall, diretório, bilheteria e webhook.
- Roles de infraestrutura baseados em least privilege; owner do produto não deve precisar de chave de produção em computador local.
- MFA em provedores/admin e branch protection.
- Logs com correlation ID, redigir tokens, CPF, e-mail e segredos; acesso a logs segregado.
- Rate limit em login, cadastro, diretório, postagem, QR e endpoints públicos.
- Rotina de patch para CVEs relevantes, secret scanning e SBOM se adotado.
- Procedimento para backup, restore e runbooks de indisponibilidade.
- Alertas para erro 5xx, webhook em falha/retry, crescimento anormal de chargebacks e ticket overbooking.
- Plano de resposta com triagem, mitigação, evidências, comunicação, correção e post-mortem proporcional ao incidente.

## 8.1 Governança adicional de design — versão visual v1.1
Antes de implementar qualquer UI, ler `G_DESIGN_SYSTEM_MINIMALISTA.md` e ver referência visual aprovada; comparar com o código do repositório e registrar o que já existe. Tickets visuais P0 devem incluir screenshot de referência, estados desktop/mobile e critérios objetivos de densidade. O Claude Code não pode voltar à antiga home carregada, trocar paleta, acrescentar painéis de gráficos, copiar rostos sintéticos nem alterar identidade aprovada por iniciativa própria.

Quando uma Issue misturar mudança de interface com reestruturação extensa de backend, separar em PRs menores se possível. PR visual precisa evidências de telas reais em preview, **não somente imagens geradas**. Revisões do design sem confirmação de Ellen entram no Decision Log como propostas. Respeitar tokens centralizados e preservar acessibilidade dos controles.

## 9. Padrões para Claude Code e agentes
**Antes:** ler Issue e PRD, executar `git status`, confirmar base correta, branch com Issue real, dependências e testes, inspecionar código existente e migrations aplicadas. Solicitar decisões de negócio abertas; não inventar aprovação de preços, credenciais ou termos.

**Durante:** commits pequenos; escopo restrito; documentação de mudança arquitetural em ADR; evitar troca de stack, refactor global ou dependência nova sem justificativa; nunca editar diretamente banco de produção; não usar dados pessoais como fixtures; tratar erro e estado vazio.

**Depois:** revisão do diff, lint/types/tests/build, testes específicos dos fluxos alterados, relatório de falha, descrição PR, evidência de QA/staging, rollback e limitações. Declarar com precisão **o que executou**, **o que não executou** e **o que requer intervenção de Ellen ou Luiggi**.

## 10. Release gates e responsabilização
| Gate | Condição de passagem | Quem valida |
|---|---|---|
| G0 — Ready | Issue, DoR, definição da regra de negócio e mocks, identificação numérica | Ellen sobre produto, Luiggi sobre execução |
| G1 — PR | CI, testes, revisão, rollback quando necessário | Luiggi/revisor técnico |
| G2 — Staging | migration e E2E, QA visual, privacidade, pagamentos sandbox | Luiggi + comercial + Ellen por tema |
| G3 — Go/no-go | sem defeitos P0; P1 crítico resolvido; termos/conteúdo/preços verdadeiros; evidências | Ellen (produto) e Luiggi (técnico) |
| G4 — Production | artefato/tag verificáveis, backup, deploy aprovado, smoke e observabilidade | Luiggi |
| G5 — Pós-release | erros, checkouts, acessos, QR e relatos monitorados; fechamento de incidentes | Luiggi + comercial, Ellen informada |

Uma PR pode ter CI verde e ser rejeitada no QA; uma tela visualmente correta não é suficiente para passar G2. **Bugs P0 bloqueiam produção; bugs P1 em fluxos críticos bloqueiam até mitigar/autorizar formalmente; P2 são registrados.**

## 10.1 Roteiro executável para Git Flow e Claude Code
O passo a passo completo e os prompts de pré-implementação estão em `H_GUIA_CLAUDE_CODE_GITFLOW.md`. GitHub Issue **real** deve existir antes da branch `tipo/<issue>-slug`. PR de `feat` vai para `develop`; `release` entrega `develop` em `main` após gates; `hotfix` nasce de `main` e é sincronizada de volta para `develop`. Não usar números sintéticos em comandos reais. Requer evidência de testes e autorização para operações remotas de efeito durável. **A simples entrega destes documentos não configura branches ou workflows reais.**

## 11. Artefatos de entrega
- ADRs de escolhas arquiteturais e gateway.
- OpenAPI/Swagger real atualizado.
- Migration history, RLS testadas e backup/recovery runbook.
- Convenções de branch e PR template em `.github`.
- Relatórios CI por PR, QA em staging, smoke e release notes.
- Inventário de secrets e ambiente sem divulgar valores.
- Matriz de acesso e incident runbook.

**Critério final:** cada release pode ser ligada a requisitos `CF-###`, Issues reais, branches numeradas, PRs reais, testes, aprovações e commits/SHA publicados — sem prometer trabalho que não foi executado.
