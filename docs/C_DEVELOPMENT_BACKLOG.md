# CAIXA FORTE — DEVELOPMENT BACKLOG
**Versão:** 1.1 · **Data:** 19/10/2026 · **Status:** backlog inicial ordenado para decomposição em Issues GitHub

> Este documento contém **identificadores internos `CF-###`**, distintos do número real da Issue/PR. Ao criar a Issue, gravar seu número real e criar a branch `tipo/<numero-da-issue>-slug`. Ex.: `feat/123-motor-ingressos`. Critérios complementares: `A_PRD_MASTER_CAIXA_FORTE.md`; gates: `E_ENGINEERING_DELIVERY_PLAN.md` e `F_QA_TEST_STRATEGY.md`.

## 1. Convenções operacionais
- **P0:** necessário ao MVP (inclusive controle de risco/produção); **P1:** próxima versão; **P2:** evolução.
- **Status:** `backlog → ready → in_progress → in_review → qa → done` ou `blocked`. Marcar `done` somente após DoD.
- **Rastreabilidade:** Epic → Feature → CF-ID → Issue # → branch → PR # → testes → release. Issue real ainda não existe; **não fabricar números**.
- **Responsáveis por papel:** `Ellen` = negócio/conteúdo/homologação; `Luiggi` = arquitetura/código/infra; `Comercial` = operação de evento e testes de check-in. Assignments exatos em ferramenta após planejamento.
- **Estimativas:** story points/horas só após análise do código existente. Não inventar datas; ordem abaixo representa dependência, não promessa.

## 2. Épicos e entregas mínimas

### EPIC-00 — Product Discovery, auditoria e aprovações
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-001 | P0 | Auditar projeto atual de Luiggi e inventariar repositório, dependências, deploy e banco | — | Relatório do que existe, riscos e recursos reutilizáveis, sem sobrescrever código |
| CF-002 | P0 | Validar provider de pagamentos (mensal, anual, ingresso) em sandbox | CF-001 | Matriz Pix/cartão/anual12x, webhooks, chargebacks, repasses e taxas realistas |
| CF-003 | P0 | Fechar contratos/termos, responsabilidade fiscal e políticas comerciais | CF-002 | Políticas publicáveis de compra, cancelamento, privacidade e evento aprovadas |
| CF-004 | P0 | Consolidar identidade visual implementável e assets de produção | CF-001 | Tokens, logo licenciada/aprovada, fontes e imagem real aprovadas; mockups não usados como dados |
| CF-005 | P0 | Decidir domínio independente e mapa de URLs | CF-001 | DNS/rotas documentados e sem dependência do site Ellen Conrado |
| CF-006 | P0 | Validar programação mínima e calendário editorial | — | Lista real de aulas disponíveis e cronograma de futuras publicações aprovado por Ellen |
| **CF-007** | **P0** | **Homologar layout v1.1 minimalista** e ativos de produção | CF-004 | Ellen aprova desktop/mobile com 1 hero, 1 jornada, até 3 cursos, 2 blocos auxiliares; mock sintético não vira foto real |

### EPIC-01 — Engenharia base, CI/CD, infra e segurança
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-010 | P0 | Estabelecer monorepo/estrutura compatível com repositório auditado | CF-001 | Web/API/contratos organizados sem quebra de build existente |
| CF-011 | P0 | Configurar TypeScript strict, lint, formatter e scripts reprodutíveis | CF-010 | CI executa comandos localmente e em runner limpo |
| CF-012 | P0 | Criar ambientes dev/staging/prod independentes | CF-010 | Chaves, banco, storage e gateways separados; staging não consulta dados reais |
| CF-013 | P0 | Criar pipelines CI: lint, typecheck, testes, build, security | CF-011 | PR falha quando check obrigatório falha e relatório é legível |
| CF-014 | P0 | Proteger branches, PR template, issue template, CODEOWNERS e naming numérico | CF-010 | Push direto para `main` negado e branch sem Issue ID bloqueada |
| CF-015 | P0 | Pipeline de deploy staging e produção com gates | CF-012,CF-013 | Promoção da versão rastreável, aprovação produção e smoke pós-release |
| CF-016 | P0 | Migrações versionadas e teste de compatibilidade | CF-012 | Banco sobe de zero e aplica migrations em staging; rollback/runbook documentado |
| CF-017 | P0 | Logs estruturados, error tracking e healthcheck | CF-010 | Erros de API e web detectáveis, sem PII e com correlation ID |
| CF-018 | P0 | Backup e teste de restauração; runbook incidente | CF-012 | Restore demonstrado em ambiente isolado e procedimento acessível |
| CF-019 | P0 | Gerenciamento de segredos e scanning de dependências | CF-012 | Segredos fora do repo e scans sem achados críticos não tratados |
| CF-020 | P0 | Base de design system, AppShell, layouts públicos/privados/admin | CF-004,CF-010,CF-007 | Tokens v1.1, layout cream+plum, hierarquia minimalista, responsividade e estados aprovados por Ellen |
| **CF-021** | **P0** | Sidebar progressiva + menu Mais e topbar minimalistas | CF-020 | Seis links primários no máximo, demais em Mais, teclado e mobile corretos, todas rotas P0 acessíveis |
| **CF-022** | **P0** | Biblioteca de componentes editoriais reutilizáveis | CF-020 | Hero, JourneyFocusCard, três CourseCards e cartões compactos, tokens e estados sem duplicação de estilos |

### EPIC-02 — Identidade e papéis
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-030 | P0 | Integrar cadastro/login/verificação/recuperação de senha | CF-012 | Login, reset e invalidação de sessão funcionam; nenhuma credencial exposta |
| CF-031 | P0 | Criar perfis pessoais com consentimentos versionados | CF-030,CF-016 | Dados gravados com validação e acessíveis só pelo titular e operações autorizadas |
| CF-032 | P0 | RBAC para owner, commercial, tech e member | CF-030 | comercial não edita preços/roles; tech sem acesso financeiro por padrão |
| CF-033 | P0 | RLS e testes de isolamento/IDOR em todas tabelas com PII | CF-031,CF-032 | tentativas cross-user bloqueadas pelo caminho real da API/DB |
| CF-034 | P0 | MFA/admin hardening e restrição de rotas | CF-032 | conta anônima e member não acessam `/admin`; owner/técnico privileg. tratados |
| CF-035 | P0 | Onboarding inicial por estágio, cidade/UF, objetivo | CF-031 | retomada de onboarding após interrupção; perfil não cadastra dados públicos sem opt-in |

### EPIC-03 — Monetização de assinaturas
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-040 | P0 | Schema `plans`, `price_versions`, `subscriptions`, `payments`, `entitlements` | CF-016,CF-002 | migração e constraints impedem duplicidade estrutural |
| CF-041 | P0 | CRUD owner de planos e versões de preço | CF-040,CF-032 | Ellen altera preço para novas vendas sem afetar assinaturas antigas |
| CF-042 | P0 | Landing e comparador de planos com checkout | CF-020,CF-041,CF-003 | preço consistente no servidor e no frontend, termos visíveis |
| CF-043 | P0 | Adapter gateway e checkout assinatura mensal | CF-040,CF-002 | compra sandbox aprovada cria assinatura e correlaciona ID seguro |
| CF-044 | P0 | Gateway plano anual com 12 parcelas **ou bloqueio explícito se não suportado** | CF-043,CF-003 | cenário anual homologado com condições e repasse ou opção indisponível |
| CF-045 | P0 | Webhook autenticado, idempotente e com reconciliação | CF-043 | evento repetido gera somente uma transição, erro recuperável |
| CF-046 | P0 | Máquina de estados e regra de acesso por entitlement | CF-045,CF-032 | ativos entram; pendentes/expirados são bloqueados; cancelamento conforme contrato |
| CF-047 | P0 | Minha Assinatura com estado e instruções de gerenciamento | CF-046 | membro vê plano correto, cobranças e canal de cancelamento/alteração conforme gateway |
| CF-048 | P0 | Concessões manuais de acesso com expiração e auditoria (se indispensáveis a suporte) | CF-046 | operação owner-only, motivo obrigatório, log e data de expiração |
| CF-049 | P0 | Testes de falha, estorno, renovação, chargeback e condição de corrida | CF-045,CF-046 | cenários de F-QA documentados passam em sandbox |

### EPIC-04 — Café Estratégico e bilheteria
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-060 | P0 | Schema edição, lote, reserva, pedido, ingresso, check-in | CF-016 | chaves/constraints garantem vínculo válido, ingressos sem dupes |
| CF-061 | P0 | CRUD de evento e lotes configuráveis no admin | CF-060,CF-032 | Ellen cria evento rascunho e publica somente após preencher dados mínimos |
| CF-062 | P0 | Landing dinâmica `/eventos/[slug]` | CF-061,CF-020 | evento reflete dados verdadeiros, preço e vagas; CTA direto compra |
| CF-063 | P0 | Controle de capacidade, reserva TTL e concorrência | CF-060,CF-061 | requisições simultâneas não excedem capacidade sem ação explícita |
| CF-064 | P0 | Checkout Pix/cartão e estados de pedido de ingresso | CF-002,CF-063 | confirmação depende de gateway, pendência não emite ticket válido |
| CF-065 | P0 | Webhook ingresso, emissão idempotente e tratamento tardio | CF-064,CF-045 | cada pagamento elegível gera 1 ticket e reconcilia excesso/atraso |
| CF-066 | P0 | Gerador QR opaco e página protegida de ingresso | CF-065 | token sem PII; adivinhação/reutilização não liberam dado |
| CF-067 | P0 | Envio transacional e segunda via segura | CF-066,CF-100 | comprador recebe ingresso e pode solicitar reenvio seguro |
| CF-068 | P0 | Interface de check-in para papel commercial/owner | CF-066,CF-032 | câmera/entrada manual valida QR; busca pelo nome com proteção |
| CF-069 | P0 | Check-in atômico e anti-replay | CF-068 | segundo check-in bloqueado, com registro de hora/operador |
| CF-070 | P0 | Cancelamento, estorno e invalidação de ingresso | CF-065,CF-066 | ingresso estornado/cancelado não é aceito; auditoria registrada |
| CF-071 | P0 | Relatório evento: vendas, vagas, presentes, atribuição à comunidade | CF-069,CF-046 | separa compra de ingresso e compra de assinatura; filtros verdadeiros |
| CF-072 | P0 | Simulação do evento piloto e checklist de operação no local | CF-067,CF-071 | 20 vagas, duplicação de QR, queda parcial de conexão e recuperação testados |

### EPIC-05 — Aprendizado e biblioteca
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-080 | P0 | Schema trilhas/cursos/módulos/aulas e status | CF-016 | ordem/publish_at/roles persistidos corretamente |
| CF-081 | P0 | CMS owner para criar/editar/publicar/agendar | CF-080,CF-032 | aula nova sem deploy, estado futuro não liberado cedo |
| CF-082 | P0 | Catálogo e filtros básicos | CF-081,CF-020 | mostra apenas cursos permitidos, distinguindo publicados e programados |
| CF-083 | P0 | Player de vídeo autenticado com provider protegido | CF-082,CF-046 | URL pública direta não dá acesso a não assinantes |
| CF-084 | P0 | Progresso por membro, conclusão e continuar aula | CF-083 | posição e conclusão persistem, sem vazamento de outro usuário |
| CF-085 | P0 | Biblioteca de materiais privados e acesso temporário | CF-046,CF-016 | material inacessível sem entitlement; metadados completos |
| CF-086 | P0 | Publicar primeira onda de aulas e recursos reais | CF-081,CF-006 | catálogo do launch coincide com conteúdos efetivamente liberados |
| CF-087 | P1 | Busca transversal por cursos/materiais | CF-082,CF-085 | resultados autorizados e relevantes; sem exposição privada |

### EPIC-06 — Comunidade e networking
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-090 | P0 | Perfis públicos opt-in para diretório de membros | CF-031,CF-046 | desligar opt-in remove membro da pesquisa, contato privado |
| CF-091 | P0 | Busca cidade/UF/áreas e perfis paginados | CF-090 | filtros corretos, rate limit e nenhuma PII não autorizada |
| CF-092 | P0 | CRUD de grupos temáticos no admin | CF-032,CF-016 | Ellen publica ou oculta grupo sem código |
| CF-093 | P0 | Aderir a grupo e feed de publicações | CF-092,CF-046 | membros ativos veem grupos autorizados, outros não |
| CF-094 | P0 | Publicar/editar/excluir posts próprios e comentar | CF-093 | validação servidor; registro por autor; ownership protegido |
| CF-095 | P0 | Denúncias e moderação owner | CF-094,CF-032 | denúncia privada, ocultação eficaz e log de decisão |
| CF-096 | P0 | Páginas de regras e aviso contra sigilo de clientes | CF-094,CF-003 | regras aceitas/visíveis; mensagens preventivas na publicação |
| CF-097 | P1 | Reações, anexos em posts e notificações de discussões | CF-094 | recurso sob permissões e antiabuso |
| CF-098 | P1 | Mensagens privadas com privacidade e bloqueio | CF-090,CF-095 | chat 1:1 com proteção/moderação adequada; **não no MVP** |

### EPIC-07 — Dashboard, jornada, ao vivo e administração
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-100 | P0 | Provedor de e-mail e templates transacionais | CF-012 | mensagens de signup, compra e ingresso com retentativa/log seguro |
| CF-101 | P0 | Home híbrida **minimalista v1.1** com dados reais e estados vazios | CF-084,CF-094,CF-035,CF-021,CF-022 | 1 hero, 1 jornada, até 3 cursos, 2 secundários; apenas progresso real; primeiro acesso vazio útil; sem feed/gráficos na home |
| **CF-111** | **P0** | QA de estados do home e navegação progressiva | CF-101 | primeiro acesso, progresso, conteúdo futuro, comunidade vazia e erro não estouram densidade; CTA correto |
| CF-102 | P0 | Diagnóstico inicial e recomendações simples | CF-035,CF-016 | dados privados e recomendações determinísticas por preferência |
| CF-103 | P0 | Objetivo 90 dias e 3 tarefas para 30 dias | CF-102 | gravação/edição e privacidade testadas |
| CF-104 | P0 | Calendário/admin de encontros ao vivo | CF-032,CF-020 | publicação/edição de data e link externo protegido |
| CF-105 | P0 | Painel administrativo e painel limitado do comercial | CF-032,CF-071,CF-081 | menus/ações corretamente segregados |
| CF-106 | P0 | Relatórios por período: aquisição, recebimentos, retenção | CF-045,CF-071 | fonte real e critérios documentados; distinguir café e online |
| CF-107 | P0 | Ajuda e canal de suporte operacional | CF-020 | comprador/membro pode abrir contato e saber prazo/canal |
| CF-108 | P1 | Histórico de diagnósticos e score 7 áreas | CF-103 | evolução real, sem penalizar advocacia solo |
| CF-109 | P1 | Mensagens de novos conteúdos e lembretes avançados | CF-100 | consentimento e opt-out aplicáveis |
| CF-110 | P2 | Metas gamificadas, IA e recomendação por comportamento | CF-108 | requisitos/proteção de dados aprovados antes de IA |

### EPIC-08 — QA, produto e release
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-120 | P0 | Suíte E2E autenticação, compra e bloqueio de conteúdo | CF-046,CF-083 | cenários positivos e negativos passando em staging |
| CF-121 | P0 | Suíte E2E bilheteria, dupla venda e check-in | CF-069,CF-070 | concorrência e reaproveitamento de QR bloqueados |
| CF-122 | P0 | Suíte segurança RLS/IDOR/RBAC por papel | CF-033,CF-095 | conta de um usuário não acessa dados de outro ou operações admin |
| CF-123 | P0 | QA mobile/responsive/a11y/polimento editorial | CF-101,CF-062 | 320/375/390/768/1024/1440px; comparação com referência v1.1, teclado, contraste e densidade visual aprovados |
| **CF-127** | **P0** | Screenshots de regressão visual para telas P0 | CF-020,CF-101,CF-062 | desktop/mobile, breakpoints e estados capturados; diferenças relevantes avaliadas sem atualização cega de snapshots |
| CF-124 | P0 | Homologação de conteúdo e termo de venda por Ellen | CF-086,CF-003 | nenhum curso inventado; valores/políticas corretos |
| CF-125 | P0 | Teste de backup/restore + rollback + smoke pré-release | CF-018,CF-015 | evidência de restauração, regressão e recuperação registrada |
| CF-126 | P0 | Go/no-go e deploy controlado com monitoramento | CF-120..CF-125 | checklist assinado, CI verde e release com identificador |

### EPIC-09 — Evolução e integração
| ID | Pri. | Feature / tarefa executável | Dependências | Critério de aceite |
|---|---|---|---|---|
| CF-140 | P1 | Plano de integração Ellen Conrado, SSO e domínio | CF-126 | ADR contempla contas, URLs, cookies, gateway e dados sem perda |
| CF-141 | P1 | Execução gradual de integração ao projeto Ellen Conrado | CF-140 | login e preços preservados, redirects e rollbacks testados |
| CF-142 | P1 | Exportações de relatórios e ferramentas editoriais avançadas | CF-106 | export acessível a owner, auditado e sem campos excessivos |
| CF-143 | P2 | Benefícios comerciais Seven Box (cupom/link) | CF-126 | assinaturas independentes sem concessão acidental de acesso |
| CF-144 | P2 | Matching de membros, desafios, gamificação e assistente IA | CF-098,CF-108 | só após nova validação de mercado, segurança e escopo |

## 3. Sequenciamento por marcos (sem datas inventadas)
| Marco | Itens essenciais | Demonstração de valor |
|---|---|---|
| M0 — Entendimento | CF-001…007 | requisitos decisivos, referência minimalista e estado do repositório conhecidos |
| M1 — Fundação | CF-010…035 (inclusive CF-021/022) | app protegido, hierarquia minimalista e papéis testados |
| M2 — Pagamentos | CF-040…049 | mensal e anual homologado ou opção anual bloqueada explicitamente |
| M3 — Café | CF-060…072,CF-100 | vender 1 ingresso de teste e validar QR no check-in |
| M4 — Conteúdo | CF-080…086 | owner publica curso, membro estuda/progride |
| M5 — Comunidade | CF-090…096 | perfil opt-in, grupo/posts/comentários e denúncia |
| M6 — Jornada & gestão | CF-101…107 e CF-111 | home **minimalista**, meta privada, relatórios reais e estados vazios validados |
| M7 — QA/release | CF-120…127 | evidências visuais e funcionais, go/no-go e produção rastreável |
| Evolução | CF-087,097,098,108…110,140…144 | crescimento com uso real e integração futura |

**OBSERVAÇÃO IMPORTANTE:** a sequência M2 antes de M3 indica que ambos reutilizam adapter e webhook; tarefas de conteúdo e Café podem avançar em paralelo depois da fundação. O PRD exige que **todos os P0 relacionados ao produto efetivamente vendido** estejam prontos para produção, não que as 100+ tarefas sejam tratadas como um sprint único.

## 4. Definição de ticket técnico pronto para Claude Code/Cursor
```markdown
## CF-0XX — [título]
**Epic:** EPIC-XX · **Prioridade de negócio:** P0/P1/P2
**Issue GitHub:** #<número real após criação>
**Objetivo / User story:** Como [papel], quero [resultado], para [benefício].
**Escopo incluído:** ...
**Fora de escopo:** ...
**Regras de negócio:** ...
**Contratos/API:** ...
**Permissões / RLS:** ...
**Estados UI:** loading, empty, error, success, forbidden
**Critérios de aceite (Given/When/Then):** ...
**Testes esperados:** ...
**Dependências:** CF-0YY
**Evidências de QA:** ...
**Riscos e rollback:** ...
```
**Regra:** criar Issue numérica antes da branch. A PR real é registrada quando criada; não inventar identificadores.
