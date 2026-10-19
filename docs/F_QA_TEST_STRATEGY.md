# CAIXA FORTE — QA & TEST STRATEGY
**Versão:** 1.1 · **Data:** 19/10/2026 · **Status:** plano de qualidade para implementação e homologação  
**Referências:** `A_PRD_MASTER_CAIXA_FORTE.md`, `B_MVP_BLUEPRINT.md`, `C_DEVELOPMENT_BACKLOG.md`, `D_DECISION_LOG.md`, `E_ENGINEERING_DELIVERY_PLAN.md`, **`G_DESIGN_SYSTEM_MINIMALISTA.md`**.

> **Aviso:** os cenários abaixo são especificações de testes **a executar**, não evidências de testes já executados. Os critérios de go/no-go são propostas de governança do produto, a confirmar pela proprietária e liderança técnica. Prioridade do requisito (P0/P1/P2) não se confunde com severidade do defeito (P0/P1/P2).

## 1. Objetivos, alcance e responsáveis
Validar que a Caixa Forte permite, com segurança e clareza, **(a)** comprar e administrar assinaturas, **(b)** estudar e usar materiais reais, **(c)** participar do networking optativo sem mensagens privadas, **(d)** adquirir ingressos dos Cafés Estratégicos sem sobrelotação e realizar check-in, **(e)** operar o negócio por Ellen, Luiggi e comercial com privilégios mínimos. Cobrir acessibilidade, responsividade, segurança, desempenho, manutenção e integridade dos dados.

| Papel | Responsabilidade de qualidade | Limite |
|---|---|---|
| Ellen — Product Owner | Validar conteúdo, experiência, contratos e critérios de aceite; decisão final de negócio/go-live | Não substitui revisão de segurança |
| Luiggi — liderança técnica | Planejar suítes, revisar arquitetura/PR, verificar CI, staging, migrations, observabilidade, rollback | Não autodeclarar QA independente por conveniência |
| Comercial — operadora | Homologar lista de eventos, atendimento, compra, QR e check-in com perfil de permissões real | Sem acesso a chaves, finanças sensíveis ou RLS administrativo |
| Revisor adicional, quando necessário | Revisão independente de pagamentos/autorização/migrations de alto risco | A designar; pode ser auditor pontual |

**Ambientes:** testes de unidade e integração em instância isolada; preview por PR sem segredos de produção; staging independente, com contas fictícias, gateway sandbox, conteúdos de teste e banco próprio; produção apenas smoke tests seguros e transações reais autorizadas. **Não** usar credenciais ou banco de produção para QA invasivo.

## 2. Severidade de bugs e prioridades
| Severidade | Definição | Exemplos Caixa Forte | Tratamento |
|---|---|---|---|
| **Bug P0 — crítico/bloqueante** | Impacto grave em segurança, receita, integridade ou indisponibilidade generalizada do fluxo essencial | Leitura de dados de outros usuários; cobrança duplicada; acesso pago sem confirmação; QR reutilizável que burla controle; perda de pagamentos; overbooking significativo | Bloqueia release. Corrigir, testar causa, regressão e analisar incidente/rollback |
| **Bug P1 — alto** | Fluxo relevante indisponível, falha frequente, perda funcional significativa | Membro pago sem conseguir assistir aulas; comercial sem check-in; falha persistente no filtro do diretório; publicação de conteúdo falhando | Corrigir antes do release quando impactar P0 ou não houver workaround seguro. Exceção somente com risco aceito e documentado |
| **Bug P2 — baixo/moderado** | Falha localizada de baixo impacto; contorno aceitável | Espaçamento ruim em viewport específico; microtexto; ordenação secundária incorreta | Registrar e agendar sem ocultar |

**Prioridade de requisito:** P0 = essencial ao MVP; P1 = versão seguinte; P2 = futuro. Exemplo: chat privado é requisito **P1/P2** e não pode virar bug P0 por ainda não existir; o check-in é requisito P0 e um bypass pode ser **bug P0**.

## 3. Pirâmide de testes e critérios por camada
| Camada | Ferramentas candidatas (confirmar após auditoria) | Cobertura exigida por risco |
|---|---|---|
| Unitários | Vitest/Jest, Nest Testing | Regras de assinatura, status, elegibilidade, limites de lote, progresso, atribuição, permissões de domínio |
| Integração | Nest/supertest, banco PostgreSQL isolado, mocks de gateway assinados | API + Auth + RLS + migrations + webhooks + idempotência + reservas atômicas |
| Contrato | OpenAPI schema validation / contract tests | Campos da API e respostas de erro estáveis; erros tipados, autenticação e paginação |
| E2E | Playwright ou equivalente | Jornada paga da comunidade, evento, ingresso, check-in, autorizações e CRUD administrativo |
| UI/acessibilidade | axe-core, Playwright, teclado/manual, leitores de tela amostrados | Estados, formulários, contraste, foco, semântica, responsive e textos |
| Segurança | SAST/secret scanning, testes de autorização e API, revisão humana | IDOR, RLS, abuso de webhook, cross-account, XSS em posts, exposição de arquivos e segredos |
| Desempenho/confiabilidade | k6 ou equivalente, smoke/monitoring | Páginas centrais, consultas, check-in em rede degradada, eventos concorrentes |

Não estabelecer "100% de cobertura" arbitrária; privilegiar **cenários e invariantes críticos com testes observáveis**. Relatório deve separar: executado/aprovado, executado/falhou, não executado, bloqueado e não aplicável.

## 4. Matriz P0 de testes de aceitação e regressão

| ID QA | Risco / fluxo | Cenário e procedimento principal | Resultado esperado | Nível |
|---|---|---|---|---|
| QA-001 | Cadastro | Registrar novo membro com campos válidos; repetir e-mail; senha fraca | Conta única; validação correta; erro claro; nenhuma duplicidade | E2E + integração |
| QA-002 | Login/sessão | Login, logout, expiração, tentativa anônima em rota privada | Acesso somente com sessão válida; redirecionamento sem vazamento | E2E + segurança |
| QA-003 | RBAC | Testar usuário, comercial, Ellen e Luiggi no mesmo endpoint | Ações limitadas por permissão efetiva no servidor/DB | Integração + E2E |
| QA-004 | Assinatura pendente | Abrir checkout e não pagar; forjar acesso à URL de sucesso | `entitlement` não é ativado | Integração + E2E |
| QA-005 | Assinatura confirmada | Webhook autêntico; reconciliar ordem | Um acesso ativo, plano correto, recibo e histórico | Integração + E2E |
| QA-006 | Webhook duplicado | Reenviar payload com mesmo event ID e pagamento | Sem segunda assinatura, cobrança/ticket ou mutações duplicadas | Integração |
| QA-007 | Webhook inválido | Assinatura inválida, evento adulterado ou idempotency key inconsistente | Rejeitado/log seguro; sem mudança de negócio | Segurança |
| QA-008 | Falha/cancelamento/estorno | Simular transições contratuais conforme provedor e regras aprovadas | Entitlement refletindo status/periodicidade correta, sem revogar indevidamente | Integração + E2E |
| QA-009 | Anual parcelado | Compra de plano anual em 12x conforme gateway contratado | Contrato, cobranças, recebíveis, acesso e renovação coerentes; sem tratá-lo automaticamente como mensal | Integração + aceite comercial |
| QA-010 | Preço editável | Ellen altera preço para novas compras | Novas ofertas com preço novo; contratos anteriores preservados; audit trail | Unit + integração + E2E |
| QA-011 | Conteúdo restrito | Usuário expirado/anônimo adivinha URLs de vídeo/material | Sem acesso ao conteúdo protegido; URL de mídia com controles apropriados | Segurança + E2E |
| QA-012 | Player/progresso | Abrir aula, concluir, retornar, usar outro dispositivo | Progresso persistido para titular; não altera de terceiros | Integração + E2E |
| QA-013 | Cronograma de curso | Publicar curso com aulas agendadas | Aulas futuras identificadas como futuras; não há conteúdo fictício reproduzível | UI + E2E |
| QA-014 | Perfil/consentimento | Perfil privado → público opt-in → revogar opção | Busca e listagem obedecem consentimento; contato sensível oculto por padrão | Segurança + E2E |
| QA-015 | Busca no diretório | Buscar por cidade, área, nome e combinar filtros | Só perfis consentidos; paginação/ordenação previsíveis | Integração + E2E |
| QA-016 | Grupos/publicações | Membro posta, comenta, edita/apaga conforme política | Mudanças e ownership corretos; XSS neutralizado; sem DMs | Integração + E2E |
| QA-017 | Moderação | Denunciar postagem; comercial/owner tenta ações previstas | Moderação disponível apenas a papéis permitidos, ação auditada | E2E + segurança |
| QA-018 | Evento rascunho | Cadastrar rascunho sem publicar | Evento invisível para compra pública; admin edita | E2E |
| QA-019 | Ingresso pendente | Reservar vaga e não pagar até expiração | Vaga volta a estoque; nenhum ticket válido emitido | Integração + concorrência |
| QA-020 | Última vaga concorrente | Duas compras simultâneas para uma única vaga | No máximo uma reserva/pagamento confirmado com ticket elegível; nenhuma sobrevenda | Teste concorrente + DB |
| QA-021 | Alteração de lote | 6 de R$89 + 14 de R$109 (ou dados atuais configurados) | Virada de lote atômica; preços nunca alteram compra confirmada | Integração + concorrência |
| QA-022 | Ingresso digital | Confirmar pagamento de evento; emitir identificador/QR único | Um ingresso ativo por unidade comprada, com nome, evento, horário, local e status | E2E + integração |
| QA-023 | Check-in simples | Validar ingresso elegível uma vez | Entrada confirmada, operador, horário e evento gravados | E2E |
| QA-024 | Reutilização QR | Dois dispositivos tentam mesmo QR simultaneamente | Primeiro check-in confirmado; segundo negado com mensagem de já utilizado | Teste concorrente + segurança |
| QA-025 | QR adulterado | Alterar token, id/evento ou usar de evento diferente | Recusa; nenhum outro registro exposto | Segurança + integração |
| QA-026 | Busca manual | Operadora busca nome, confirma correspondência e entrada | Check-in manual autorizado e auditado; não burla cobrança | E2E |
| QA-027 | Reembolso/transferência | Anular ingresso e tentar check-in; regras aprovadas de transferência | Status válido respeitado em tempo real; ticket inválido bloqueado | Integração + E2E |
| QA-028 | Atribuição do café | Participante pago e com check-in depois contrata comunidade | Origem do membro documentada, uma só conversão por nova assinatura, sem atribuição inventada | Integração + E2E |
| QA-029 | Métricas reais | Conferir faturamento, ativos, lotes, presenças, conversão, MRR equivalente | Números reconciliáveis com tabelas transacionais e definições no PRD; estados sem dados honestos | Unit + integração |
| QA-030 | Publicação e administração | Ellen altera curso, evento, preço e grupos sem editar código | RBAC, validações e trilha de auditoria; comercial sem privilégios excessivos | E2E + segurança |
| QA-031 | Restore & release | Restaurar staging de backup de teste; rollback de frontend/API | Procedimento demonstrado e limitações de migrations documentadas | Operacional |
| QA-032 | Acessibilidade/responsive | Teste em 360/390/768/1024/1440 px, teclado, rótulos, zoom | Fluxos de pagamento, estudo e check-in utilizáveis; sem elementos bloqueados | Visual/manual + E2E |
| QA-033 | E-mail transacional | Envio/reenvio de ingresso e confirmação com falha temporária do provedor | Retry controlado; não gera pagamento/ingresso duplicado; fallback na conta | Integração + E2E |
| QA-034 | Degradação rede check-in | Falha de internet na recepção e posterior recuperação | Erro inequívoco, sem falso check-in; procedimento manual de contingência previamente aprovado | Operacional/manual |

**Observação:** QA-009 e QA-027 dependem de regras comerciais e do gateway ainda pendentes. Não simular contrato de parcelamento ou política de transferência como decisão aprovada; manter esses testes bloqueados para homologação até decisão formal.

## 5. Critérios BDD críticos (Given / When / Then)

### ASSINATURA-01 — Nunca liberar acesso pela página de obrigado
**Given** um usuário iniciou checkout com status `pending`  
**When** ele acessa a URL de sucesso sem notificação validada do provedor  
**Then** a área paga permanece bloqueada; mostrar estado "aguardando confirmação"; não criar um entitlement ativo.

### ASSINATURA-02 — Webhook idempotente
**Given** uma notificação de pagamento assinada já processada  
**When** a mesma notificação for entregue novamente ou em paralelo  
**Then** nenhum segundo entitlement/pedido/ticket é criado; log registrar redelivery sem dados sensíveis.

### INGRESSO-01 — Venda da última vaga
**Given** um lote possui apenas uma unidade reservável  
**When** dois compradores tentam reservá-la ao mesmo tempo  
**Then** somente um obtém reserva válida; o outro recebe indisponibilidade; estoque não fica negativo. A confirmação depende da regra de pagamento homologada.

### CHECKIN-01 — QR reutilizado
**Given** um ingresso confirmado para determinado café ainda não utilizado  
**When** duas operadoras tentam confirmar simultaneamente o QR  
**Then** a primeira transação aceita registra um check-in; a outra informa "ingresso já utilizado"; não há duplicidade.

### PRIVACIDADE-01 — Contato opt-in
**Given** perfil de membro não consentiu exibir dados no diretório  
**When** outro membro solicita busca ou endpoint de perfil  
**Then** o titular não aparece no diretório público de membros; telefone e e-mail permanecem inacessíveis, inclusive diretamente via API.

### ADMIN-01 — Separação de papéis
**Given** usuário possui papel comercial  
**When** tenta criar plano/preço, acessar credenciais do gateway ou editar RLS  
**Then** servidor nega a operação independentemente da interface; tentativa relevante fica auditada.

### CONTEUDO-01 — Curso lançado progressivamente
**Given** Ellen agendou aula futura ainda sem conteúdo publicado  
**When** membro abre catálogo/curso  
**Then** vê título, data prevista (se confirmada) e status de programação; não aparece player falso ou aula concluída fictícia.

## 6. Plano de acessibilidade, UX e responsividade
- Padrão de referência: WCAG 2.2 AA como **meta proposta**, validar alcance e recursos. Contraste mínimo adequado; zoom, foco e alvos de toque; não usar cor isolada para estados.
- Prioridades: cadastro/checkout/ingresso/QR (mobile), player/trilha e comunidade, backend em tabelas; menus com teclado; diálogos com trap de foco, escape, aria-labels e mensagens anunciadas.
- Estados: vazio, skeleton/loading, erro, acesso negado, conteúdo agendado, pagamento pendente, esgotado, transação reembolsada, check-in usado, rede indisponível.
- Tela de check-in: texto grande e contraste evidente; nome + status legível; confirmação explícita; opção de busca manual; sem revelar dados privados além do necessário.
- Print de referência é **inspiração visual**, não baseline pixel-perfect obrigatória; revisar com Ellen antes do fechamento.

## 6.1 Aceite visual P0 — referência minimalista aprovada em 19/10/2026
A validação deve ocorrer em implementação **real do browser**, não apenas em mockup. Referência: `references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png`; especificações: `G_DESIGN_SYSTEM_MINIMALISTA.md`.

| ID QA | Cenário | Critério objetivo |
|---|---|---|
| UI-001 | Home desktop com dados reais | Apenas 1 hero, 1 cartão de jornada, até 3 cursos e até 2 cartões complementares no estado padrão |
| UI-002 | Primeiro acesso sem dados | CTA de diagnóstico/começar; nenhum progresso ou evento fictício |
| UI-003 | Mobile 320/375/390px | Menu não ocupa tela principal, cards empilhados, títulos legíveis, sem overflow horizontal |
| UI-004 | Tablet/desktop 768/1024/1440px | Sidebar/menu, grid e espaços responsivos; foco não escondido |
| UI-005 | Identidade visual | Creme/marfim e vinho + toque rosé; sem dark-mode integral, sombras pesadas, 3D ou gráficos decorativos na home |
| UI-006 | Estados do sistema | Loading, vazio, erro, permissão e sucesso claros, sem CTA falso |
| UI-007 | Acessibilidade | Navegação teclado, contraste/zoom, foco, sem dependência apenas de cor |
| UI-008 | Fotografias e textos | Sem rosto sintético tratado como Ellen, sem membros/depoimentos/datas/números inventados; público inclusivo |
| UI-009 | Navegação | P0 acessíveis em até 2 interações de menu, recursos sob Mais não perdidos |
| UI-010 | Regressão visual | Capturas antes/depois da PR, revisão de mudanças relevantes e registro de aprovação |

**Gate:** falha grave de legibilidade, acesso, funcionalidade ou responsividade em tela P0 bloqueia a release; divergência estética não crítica exige decisão explícita de Ellen no QA, não é automaticamente bug severidade P0. Não aceitar “atualização de snapshots” como evidência suficiente de correção.

## 7. Performance, disponibilidade e confiabilidade
Definir baseline e metas **propostas, sujeitas à medição e aprovação**:
- LCP página pública em conexão móvel realista: alvo <= 2,5 s na mediana do conjunto de testes de laboratório acordado; não declarar Core Web Vitals aprovado sem dados reais.
- API de consulta p95 alvo < 500 ms em carga de referência a estabelecer; rotas pesadas podem ter orçamento separado documentado.
- Compra/check-in devem ser corretos sob concorrência; tolerância zero a tickets válidos em quantidade superior à capacidade. Correção precede velocidade.
- Banco com índices para lookup QR, email e eventos; avaliar planos de execução e N+1 no diretório.
- Emissão/envio podem ser assíncronos com fila/retry idempotentes; pós-pagamento o usuário deve poder recuperar ingresso no painel.
- No MVP, disponibilidade/SLO definitivo, RTO/RPO e número de usuários simultâneos dependem do provedor e do orçamento; registrar ADR, não inventar compromisso contratual.

## 8. Segurança e privacidade: checklist de homologação
1. Auth/sessão: cookies adequados, proteção de rotas e expiração/revogação; testar usuário não autenticado.
2. RBAC: owner, técnico, comercial, membro; negar acesso por URL, API e banco, não só ocultar botão.
3. RLS: testes com A e B; B não acessa conteúdo privado de A; acesso por serviços privilegiados delimitado.
4. Storage: arquivos privados exigem autorização; URLs assinadas limitadas; upload com tipo/tamanho e validação.
5. Payments: webhook com assinatura + idempotência + reconciliação; segredo fora do frontend; não confiar em `success` client-side.
6. QR: identificador imprevisível/assinado ou token opaco; não conter dados sensíveis em texto puro; status conferido no servidor.
7. Community: sanitização/escape XSS; limites e rate limit; denúncias, remoção e trilha de moderação.
8. Dados: LGPD, base legal, minimização, consentimento explícito para divulgação optativa, retenção e exclusão conforme obrigação aplicável.
9. Logs: não armazenar tokens, CPFs, pagamentos detalhados ou payloads pessoais sem necessidade; redigir dados sensíveis.
10. CI/infra: scan de secrets e vulnerabilidades, dependências versionadas, proteção de ambientes, privilégios mínimos, backups e restauração.
11. Conteúdo: não expor informações sigilosas de clientes na rede de membros; termos e moderação claramente publicados.
12. Vídeo: acesso à mídia restrito conforme fornecedor; DRM não é pressuposto do MVP, mas acesso público irrestrito não é aceitável para conteúdo pago.

## 9. QA de pagamentos e reconciliação
**Duas operações comerciais separadas:** assinatura da comunidade e compra de ingresso. Devem possuir `order_type`, tabelas/estados próprios e entitlements/tickets distintos. Testar reembolso parcial, cancelamento, falha de cartão, chargeback, webhook fora de ordem, indisponibilidade e retry. Conciliar provedor vs base (IDs externos únicos), estoque/reservas e financeiro. **Nunca** marcar pedido como pago baseado só em mudança de estado na UI. Guardar apenas dados essenciais: não armazenar dados completos de cartão.

**Plano anual:** validar com gateway escolhido se é parcelamento da venda anual, recorrência mensal, cobrança vinculada ao contrato ou outra forma; formalizar duração do acesso e regras de inadimplência, renovação, cancelamento, repasses e chargebacks antes de programar testes definitivos. Mudanças de preço produzem novas versões de plano/preço, sem alterar contratos assinados retroativamente.

## 10. Testes de implantação, homologação e recuperação
### Gate 1 — Pull Request
Branch `tipo/numero-real-da-issue-slug` e Issue relacionada; CI com lint, typecheck, build, testes relevantes, análise de secrets e dependências; revisão de diff, compatibilidade e migrations; screenshots para UI. Falha em gate crítico impede merge.

### Gate 2 — Integração / staging
Publicar versão no staging isolado; rodar migrations em snapshot de teste; smoke dos fluxos; validação visual e mobile; sandbox do gateway; teste de concorrência na última vaga; QA de permissão por papel; backup e restore demonstrados. P0 resolvidos; P1 bloqueantes resolvidos.

### Gate 3 — Go/no-go para produção
- Ellen aprova a experiência, preço exibido, termos, materiais publicados, agenda e operação de evento.
- Luiggi aprova qualidade técnica, segurança, CI, dados, rollback e monitoramento.
- Comercial aprova fluxo real de check-in como operadora sem poderes de owner.
- Validar domínio, SSL, e-mail transacional, gateway em produção, credenciais seguras e acesso administrativo.
- Verificar política de privacidade, termos de assinatura e regras de cancelamento de ingressos.
- Registrar lista de bugs abertos com severidade, dono, mitigação e decisão de aceite.
- **Bug P0 aberto = no-go. Bug P1 bloqueante de fluxo essencial = no-go.** Exceções P1 apenas com revisão explícita de risco e mitigação verificável, nunca para falha de segurança crítica.
- Não usar data do primeiro Café como justificativa para ignorar gates.

### Gate 4 — Pós-publicação
Smoke seguro em produção: abrir páginas, login teste autorizado, consulta de curso, consulta de evento, verificação de vídeo protegido, transação real de baixo valor **somente se autorizada e conciliada**, teste de e-mail/QR de conta teste, dashboard sem erro. Monitorar erros, pagamentos e check-ins. Não fazer reserva fake que consuma vagas reais.

### Plano de rollback
API/web: promover última versão testada; migrations DB: preferir expand/contract, backup e plano de recuperação específico para alterações incompatíveis; nunca afirmar que `git revert` reverte banco automaticamente. Incidente em pagamentos: congelar operações afetadas e reconciliar com provedor; incidente QR: bloquear verificação, acionar contingência e corrigir tokens sem duplicar acessos. Documentar responsáveis e canal de decisão.

## 11. Evidências obrigatórias e relatório de execução
Para cada caso registrar: `QA-ID`, `CF-ID`, Issue/PR, build SHA, ambiente, navegador/dispositivo, dataset fictício, pré-condição, passo, resultado esperado, resultado observado, PASS/FAIL/BLOCKED/NOT_RUN, evidências, criticidade, responsável, data. Evidências devem ser vídeos/screenshots/logs sanitizados, sem segredos e sem dados reais de alunos.

**Template:**
```md
### QA-023 — Check-in válido
- Ambiente / build: staging / <SHA>
- PR / Issue: #<n> / #<n>
- Executado por / data:
- Pré-condições: ingresso fictício pago em sandbox e não utilizado
- Passos: entrar como comercial → abrir check-in → escanear QR → confirmar
- Esperado: ingresso entra uma vez, com horário/operador
- Observado:
- Evidência (link/caminho):
- Status: NOT_RUN | PASS | FAIL | BLOCKED
- Bug relacionado / severidade:
```
**Não preencher PASS por antecipação.** O template só vira relatório de execução depois de um teste real.

## 12. Matriz de rastreabilidade de QA → Epics
| Épico do Backlog | Testes QA |
|---|---|
| EPIC-00 Discovery e acordos | QA-009, QA-027, definição de políticas |
| EPIC-01 Engenharia e segurança | QA-002, QA-003, QA-011, QA-031, QA-032 |
| EPIC-02 Identidade e papéis | QA-001 a QA-003, QA-014 |
| EPIC-03 Monetização | QA-004 a QA-010, QA-033 |
| EPIC-04 Eventos | QA-018 a QA-028, QA-034 |
| EPIC-05 Conteúdo | QA-011 a QA-013 |
| EPIC-06 Networking | QA-014 a QA-017 |
| EPIC-07 Painel e administração | QA-028 a QA-030 |
| EPIC-08 Release e QA | todos + gates e restore |
| EPIC-09 Integração futura | suíte dedicada de migração e identidade, a escrever quando aprovada |

## 13. Critérios finais de aceite do MVP
O produto está elegível a lançamento **apenas** se Ellen pode vender ingressos sem overbooking, emitir tickets e operar check-in com sua equipe; clientes podem contratar planos e receber acesso de forma consistente com pagamento verificado; o catálogo contém aulas reais e cronograma honesto; membros podem encontrar colegas opt-in, publicar e comentar em grupos sem DM; dados e rotas permanecem isolados; owner gerencia preços futuros e conteúdo sem deploy; operações críticas têm testes e evidências; staging/CI/rollback estão operacionais; não há bug P0 ou P1 bloqueante. Demais funcionalidades P1/P2 ficam no roadmap.

**Estado inicial:** `PLANEJADO / NÃO EXECUTADO`. Este documento não declara que a implementação já ocorreu ou que qualquer teste passou.
