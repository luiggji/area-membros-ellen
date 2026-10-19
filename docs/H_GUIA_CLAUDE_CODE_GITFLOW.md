# CAIXA FORTE — GUIA OPERACIONAL PARA CLAUDE CODE + GIT FLOW
**Documento H · versão 1.1 · 19/10/2026**

> Guia para desenvolver a Caixa Forte a partir do PRD real, **sem recriar o projeto do zero quando já houver código**. Não afirma que repositórios, Issues, workflows, gates, pipelines ou testes já existem. Primeiro auditar. Não executar ações remotas/destrutivas sem autorização explícita do responsável.

## 0. Ordem obrigatória de leitura pelo Claude Code
1. `00_LEIA_PRIMEIRO.md` — diretriz do pacote.
2. `D_DECISION_LOG.md` — decisões confirmadas, pendências e recomendação técnica.
3. `A_PRD_MASTER_CAIXA_FORTE.md` — escopo funcional, arquitetura, regras.
4. `G_DESIGN_SYSTEM_MINIMALISTA.md` + imagem aprovada — **fonte principal da UI**.
5. `B_MVP_BLUEPRINT.md` — limites P0.
6. `C_DEVELOPMENT_BACKLOG.md` — ordem dos tickets/IDs `CF-###`.
7. `E_ENGINEERING_DELIVERY_PLAN.md` e `F_QA_TEST_STRATEGY.md` — branches, tests, gates.
8. `CLAUDE.md` (copiar para a **raiz do repositório**, adaptar caminhos depois de auditar).

## 1. Primeira sessão — SOMENTE AUDITORIA E PLANO
O agente deve consultar o repositório **real**, responder:
- Estrutura de pastas, scripts, package manager, dependências e lockfile.
- Branch atual, remotes, histórico recente e políticas de CI existentes.
- Next.js/React/TypeScript, API/NestJS, Supabase e migrations já presentes.
- Telas, componentes e tokens atuais versus design aprovado.
- Banco e isolamento de ambientes; **não** solicitar segredos no chat.
- Diferenças e possíveis conflitos com os PRDs, incluindo funcionalidades implementadas.
- Matriz “reaproveitar / adaptar / criar / decisão pendente”, riscos e fatias verticais.

**NÃO** iniciar refatoração em massa nem executar migration/deploy nesse primeiro passo. Se houver arquivos modificados sem commit, reportar; não sobrescrever alterações existentes.

Comandos locais seguros para inspeção, após entrar no diretório correto:
```bash
git status --short --branch
git branch -a
git remote -v
git log --oneline -n 12
find . -maxdepth 2 -type f -name 'package.json' -o -name 'pnpm-workspace.yaml'
```
A presença de `gh` CLI e permissões de GitHub deve ser verificada; nunca assumir que uma Issue real existe.

## 2. Git Flow do projeto — exigência de governança
**Branches permanentes:**
- `main`: somente releases aprovadas / produção; bloqueio de push direto, checks e review.
- `develop`: integração / staging, protegida contra push direto.

**Branches temporárias**: `feat`, `fix`, `hotfix`, `refactor`, `perf`, `test`, `chore`, `docs`, `release`.

**NOME OBRIGATÓRIO**: `tipo/<NUMERO_REAL_DA_ISSUE>-slug` com regex:
```regex
^(feat|fix|hotfix|refactor|perf|test|chore|docs|release)/[0-9]+-[a-z0-9]+(-[a-z0-9]+)*$
```
Exemplos ilustrativos: `feat/123-home-minimalista`, `fix/124-checkin-duplicado`, `test/125-rls-comercial`.

O número da **Issue é real, criado antes do desenvolvimento**; o número da **PR é atribuído depois**, na criação da PR. Vincular ambos, sem inventar número nem renomear a branch de PR aberta para tentar igualar ao número dela. A solicitação histórica de número literal da PR permanece pendência `P-015`; não implementar workaround automático sem decisão de Ellen/Luiggi. Os commits podem seguir Conventional Commits sem ID: `feat: implementa hero minimalista`.

**Fluxos:**
- `feat/fix/refactor/perf/test/chore/docs` nascem de `develop` → PR para `develop`.
- `release` pode sair de `develop` → PR para `main`, com sincronização posterior de `main` em `develop`. Alternativa de PR direto `develop → main` apenas por ADR aprovada.
- `hotfix` nasce de `main` → PR para `main`, testes mínimos proporcionais + aprovação, e obrigatoriamente volta a `develop` via PR/sync.
- Nunca commits diretos em `main` ou `develop`, `git push --force`, bypass de review, PR autoaprovada, uso de dados reais em preview.

## 3. Procedimento por tarefa (Issue real antes de branch)
**Passo A — escolher a Issue real:** identificar `CF-###`, prioridade P0/P1/P2, dependências e critério de aceite. Criar/selecionar Issue no GitHub **somente com autorização**; registrar `#NUMERO_REAL`. Se não houver acesso, entregar ticket e pedir ao responsável que o crie.

**Passo B — atualizar base (exemplo para features):**
```bash
git status --short
# Não descartar alterações locais alheias.
git switch develop
git pull --ff-only origin develop
git switch -c feat/<NUMERO_REAL_DA_ISSUE>-home-minimalista
```
Substituir `<NUMERO_REAL_DA_ISSUE>` pelo identificador verdadeiro antes de executar. Não copiar colchetes literais como nome de branch. Se o workspace não estiver limpo ou `develop` não existir, parar e apresentar alternativas, sem improvisar o fluxo.

**Passo C — implementação pequena e restrita:**
- Ler código atual e identificar impacto; escrever plano conciso e pontos de teste.
- Implementar apenas a Issue; preservar UX v1.1 e sistema de tokens.
- Criar/ajustar testes de sucesso, vazio, erro, autorização, responsividade (conforme escopo).
- Não publicar no catálogo conteúdos fictícios nem criar planos de pagamento hard-coded.
- Em mudanças de API, atualizar contratos/OpenAPI. Em migrations, usar arquivos versionados novos e teste em ambiente isolado.

**Passo D — validação local:**
```bash
git diff --check
git diff --stat
git status --short
```
Em seguida **descobrir scripts reais** do repositório (`package.json`, monorepo) e executar **lint, typecheck, tests e build** adequados. Não assumir comandos que não existem; informar exatamente o que rodou e falhou. Para UI, capturar screenshot real desktop/mobile, comparar com referência; para dados/pagamentos, testar sandbox e ambiente isolado.

**Passo E — commit e PR (com permissão):**
```bash
git add <ARQUIVOS_RELACIONADOS_A_ISSUE>
git commit -m "feat: implementa home minimalista"
git push -u origin feat/<NUMERO_REAL_DA_ISSUE>-home-minimalista
# Se gh estiver configurado e for autorizado:
gh pr create --base develop --head feat/<NUMERO_REAL_DA_ISSUE>-home-minimalista --draft
```
Os comandos ilustram o formato; substitua os placeholders e confira `git diff --cached` antes de commit. Escrever descrição PR com `CF-ID`, `Closes #<ISSUE>`, riscos, testes executados e evidências; marcar como pronta para revisão somente quando realmente estiver pronta. Caso uma branch contenha vários commits, manter todos dentro do escopo.

**Passo F — CI / review / staging:** aguardar checks obrigatórios, revisar diff, solicitar review proporcional ao risco, corrigir falhas com novos commits, homologar preview. Após merge em `develop` via PR, validar staging com Supabase e gateway de teste separados; não promover para `main` por conta própria.

## 4. Critérios de PR visual especificamente para o design v1.1
Checklist de UI em toda PR de shell/home/cursos/comunidade:
- [ ] Layout usa tokens definidos em `G_DESIGN_SYSTEM_MINIMALISTA.md`.
- [ ] Home tem um único bloco principal de jornada.
- [ ] Home mostra até três cursos e no máximo dois cartões complementares.
- [ ] Não aparecem gráficos decorativos, contadores irreais, dark dashboard integral ou ícones excessivos.
- [ ] Sidebar/menu preservam rotas P0 sem poluir a tela.
- [ ] Captura de tela de **implementação real** em 1440px e 390px anexada.
- [ ] Primeiro acesso/sem aulas/sem evento/sem posts/erro/permissão tratados.
- [ ] Labels, teclado, contraste, foco e zoom verificados.
- [ ] Não há rostos sintéticos identificados como Ellen, avatares/depoimentos falsos ou dados de exemplo publicados como verdade.
- [ ] Ellen aprovou a aparência quando a mudança for de referência visual relevante.

## 5. CI/CD obrigatório, mas implementar segundo o repo real
**Em PR:** validação de nome de branch e Issue vinculada; instalação reproduzível; lint/format; TS strict; unit/integration; build; segurança de dependências/segredos; migrations testadas; casos de RBAC/RLS tocados. E2E crítico (pagamento, entrega de acesso, ingresso/QR, check-in) em ambiente adequado.

**Em develop/staging:** deploy controlado com secrets de staging, smoke e regressão; QA visual/a11y/responsividade; sandbox de pagamentos e testes de disponibilidade de vídeo/armazenamento.

**Em main/produção:** merge/release aprovada, backup avaliado, migrations revisadas, deploy rastreável e monitoramento. Sem auto-deploy de código de PR não revisada com segredo de produção.

**Gates:**
- **G0 Ready:** Issue real e regras claras.
- **G1 PR:** checks e revisão técnica.
- **G2 Staging:** testes funcionais + QA visual + segurança.
- **G3 Go/no-go:** Ellen aprova produto e Luiggi aprova técnica, sem P0/P1 bloqueantes.
- **G4 Production:** release controlada, smoke e rollback previsto.
- **G5 Monitor:** incidentes, métricas reais, acompanhamento.

## 6. Design x segurança: regras de conflito
- Minimalismo **não** permite suprimir aviso de erro/cobrança, preferências de privacidade, consentimento ou elemento obrigatório de checkout.
- `P0` de produto = MVP indispensável. `P0` de bug = incidente crítico; são dimensões diferentes.
- Pagamentos: nunca ativar acesso apenas via `success_url`, somente evento verificado no servidor.
- Bilheteria: reserva TTL, vendas concorrentes, QR sem PII e check-in atômico.
- Conteúdo: acesso protegido no backend/storage e estado publicado/programado real.
- Membros no diretório: opt-in explícito, contatos ocultos por padrão.
- Sem chat privado no MVP.

## 7. Relatório obrigatório de conclusão do agente
Responder por Issue/PR:
```text
CF-ID / GitHub Issue: [real]
Branch: tipo/<issue>-slug
Pull Request: #... (somente se realmente criada)
Objetivo e mudanças:
Arquivos alterados:
Critérios de aceite satisfeitos:
Testes EXECUTADOS (comandos e resultados):
Testes NÃO executados (motivo):
Screenshots de UI (se houver):
Migrações/RLS/risco de segurança:
Preview/staging QA:
Pendências e decisões da Ellen:
Próxima Issue indicada:
```
Não usar “feito”, “pronto para produção”, “CI verde” ou “QA aprovado” sem as evidências correspondentes. Se faltarem ferramentas, credenciais ou autorização, registrar precisamente o bloqueio e continuar somente no que for permitido.

## 8. Primeira sequência de Issues recomendada
1. `CF-001` — auditoria repositório e situação real.
2. `CF-004` e `CF-007` — aprovar ativos reais e densidade visual final.
3. `CF-010`–`CF-020`, `CF-021`, `CF-022` — ambiente, segurança, design system e layouts.
4. `CF-030`–`CF-035` — autenticação e papéis.
5. Dependendo do prazo do café: motor do evento/ingresso (`CF-060`+) em paralelo ao conteúdo e pagamentos, respeitando dependências.
6. `CF-101` e `CF-111` — home minimalista e estados reais.
7. `CF-120`–`CF-127` — homologação, segurança e release gates.

**Importante:** o fluxo de Git é parte do projeto, mas não faz sentido que o agente comece criando código ou workflows sem auditar o repositório e receber autorização do responsável.
