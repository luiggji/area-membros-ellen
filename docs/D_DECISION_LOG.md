# CAIXA FORTE — DECISION LOG
**Data-base:** 19/10/2026 · **Versão:** 1.1

**Estados:** `CONFIRMADA`, `REFERÊNCIA EM DISCUSSÃO`, `RECOMENDAÇÃO TÉCNICA`, `PENDENTE`. Uma referência visual gerada ou proposta do assistente não equivale a aprovação final. Quando houver conflitos, usar a decisão explícita mais recente.

## A. Decisões confirmadas pela cliente
| ID | Decisão | Impacto |
|---|---|---|
| D-001 | Criar a Caixa Forte como **plataforma independente inicialmente**, integrando ao projeto Ellen Conrado posteriormente | Arquitetura por módulos e migração futura, sem bloqueio de lançamento |
| D-002 | Prioridade do MVP: **pagamentos/acesso, cursos e networking** | Esses fluxos têm status P0 |
| D-003 | Painel inicial deve equilibrar **aprendizado, comunidade e planejamento** (opção D) | Home híbrida, sem foco exclusivamente Netflix |
| D-004 | Networking inicial com perfis/diretório, grupos, posts, comentários, **sem mensagem privada** | DM fora do MVP |
| D-005 | Café Estratégico com vendas, ingressos digitais e check-in **dentro da plataforma própria** | Módulo de bilheteria P0 |
| D-006 | Operadores iniciais: Ellen, Luiggi e comercial | RBAC com escopo mínimo |
| D-007 | Preços-base: R$89 mensal e R$790 anual; preços **alteráveis facilmente** | Catálogo versionado no admin |
| D-008 | Conteúdo liberado gradualmente | CMS com agendamento e transparência |
| D-009 | Stack-base aprovada no guia: Next.js, React, TS strict, Tailwind, Node.js/NestJS, Supabase/PostgreSQL | Restrição arquitetural, sem troca unilateral |
| D-010 | CI/CD, QA, severidade/prioridades P0/P1/P2, Git Flow e identificação numérica nas branches são exigências | Documentos E/F e controles automatizados |
| D-011 | Seven Box independente de preços e acesso | No máximo link/cupom promocional separado |
| D-012 | Ingresso de acesso **digital**; kit físico personalizado entregue no Café | QR e check-in, sem tíquete físico obrigatório |
| **D-013** | **19/10/2026: aprovada direção visual minimalista, leve, com menos informação, espaço generoso, sidebar vinho e canvas creme** | Substitui os antigos mockups densos como referência primária da home. Não altera recursos P0. Asset: `references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png` |
| **D-014** | **20/10/2026: adotado o Brand System V2 da agência** (`docs/brand/v2`) como fonte de identidade visual: logotipo e símbolo em PNG como marca oficial de trabalho, Playfair Display (títulos) + Inter (UI), tokens de `tokens.semantic.json` | Substitui as sementes de cor/fonte da v1.1 (R-002, R-004) e o cadeado provisório. Não muda a densidade do doc G nem o escopo P0. A agência marca HEX e fontes como "propostos para homologação": ajuste final da Ellen entra aqui e em `packages/ui/src/theme.css` |
| **D-015** | **21/10/2026 (Luiggi): Supabase cloud.** O projeto já criado atende **development e staging juntos**, só com dados fictícios. **Produção** fica num projeto separado, criado antes do go-live, com o ref registrado em `SUPABASE_PRODUCTION_REF` | Resolve parte da P-014. Descartados: Supabase local via Docker (esta máquina não tem Docker) e um projeto de staging próprio por enquanto. As migrations continuam testadas do zero no Postgres efêmero do CI. Ver `docs/runbooks/ambientes.md` · Issue #15 |
| **D-016** | **21/10/2026 (Luiggi): Vercel hospeda o web (Next.js).** Sem domínio por enquanto: staging/preview em `*.vercel.app`; produção espera a P-005. O projeto na Vercel ainda não foi criado | Resolve parte da P-014. Ainda em aberto: o host da API NestJS (funções da Vercel ou processo contínuo), a decidir no CF-015 (#29) |
| **D-017** | **21/10/2026 (Luiggi): Stripe é o gateway** de assinatura (mensal e anual) e de ingresso | Resolve parte da P-001. A validação em sandbox fica no CF-002 (#3): Pix na assinatura recorrente, taxas Pix/cartão, webhooks e chargeback. Taxas e contrato a confirmar com a Ellen. P-002, P-003 e P-004 seguem abertas |
| **D-018** | **26/10/2026 (Luiggi): Resend é o provedor de e-mail transacional** (cadastro, compra, ingresso) | Resolve parte da P-008. Remetente e domínio autenticado esperam o domínio (P-005). A integração (CF-100, #82) fica para depois do produto (D-019) |
| **D-019** | **26/10/2026 (Luiggi): produto antes das integrações.** O app interno (menus, conteúdo, comunidade, jornada, ao vivo, admin, planos e Minha Assinatura sem checkout) é construído antes de Stripe, Resend e outbox | Ordem em `BACKLOG.md` §2.1. Enquanto não houver webhook, o acesso pago nasce **só** de concessão manual do owner, auditada (CF-048); pagamento continua ativando acesso apenas por webhook assinado e idempotente quando o gateway entrar (mandamento 3). Nenhuma tela mostra botão de pagar sem ação |

## B. Diretrizes e referências em avaliação
| ID | Posição atual | Observação |
|---|---|---|
| R-001 | **Caixa Forte** é o nome de trabalho preferido e usado pela cliente | Marca, símbolo, slogan e domínio necessitam validação final |
| R-002 | Paleta: ameixa/vinho, rosé suave, creme/marfim, champagne | **Direção cromática aceita; HEX do Brand V2 adotados (D-014)**, homologação final com Ellen |
| R-003 | Ícone sóbrio de chave/fechadura/cofre e cartões editoriais discretos | Sem 3D exuberante ou excesso metálico; mockups não são marca/ativos finais |
| R-004 | Tipos editoriais Fraunces/Cormorant e UI Inter/Manrope | Superada por D-014: Playfair Display + Inter (OFL 1.1, hospedadas no repo) |
| R-005 | 8 cursos/trilhas e conteúdo Planejamento 2027 | Taxonomia e ordem editorial editáveis; conteúdos reais a produzir |
| R-006 | Café-piloto em Ourinhos/SP, 26/11/2026, ~20 vagas, recepção 18h30 | Estabelecimento, data e horário ainda sujeitos a confirmação |
| R-007 | Lotes piloto: 6 × R$89 e 14 × R$109 | Proposta comercial histórica, não tarifa imutável |
| R-008 | Evento dura aproximadamente 2–3 horas, diagnóstico e planejamento presencial | Agenda definitiva e material do kit serão externos ao MVP |
| R-009 | Divulgação principal por anúncios Meta e perfil Ellen Conrado | Regras atuais de marketing e orçamento sujeitos a validação |
| R-010 | Home editorial: um hero, uma jornada, até 3 cursos e 2 cartões secundários | Regra de implementação proposta para atender direção minimalista; homologar densidade com Ellen |

## C. Recomendações técnicas justificadas — **não presumir aprovação da cliente**
| ID | Recomendações | Razão |
|---|---|---|
| T-001 | Monorepo TypeScript com web, API e packages | Contratos e versionamento coesos com equipe pequena |
| T-002 | NestJS desde MVP **se compatível com repositório** | Bilheteria e pagamentos precisam de orquestração e testes consistentes |
| T-003 | Auth Supabase + RBAC no servidor + RLS consistente | Segurança de dados e autorização crítica |
| T-004 | Preços versionados para **novos compradores**, sem mutação retroativa | Evitar disputa contratual e inconsistências |
| T-005 | Event inventory transacional + reserva TTL + webhook idempotente | Evitar sobreventa e tickets duplicados |
| T-006 | Anexos privados e vídeos entregues por solução protegida | Paywall em mídia, não apenas na UI |
| T-007 | `issue-id` obrigatório na branch, PR real vinculado na plataforma | Número de PR só é criado ao abrir PR; correspondência literal exige fluxo especial não aprovado |
| T-008 | `main` protegida + `develop` + branches temporárias de curta vida | Fluxo Git adaptado, com revisão e staging |
| T-009 | AWS/GCP/Vercel/Supabase ou outros provedores apenas após avaliar custos/contratos | Não introduzir stack de infraestrutura não escolhida |
| T-010 | Staging isolado, previews, CI e go/no-go formal | Reduzir risco de lançamento |
| T-011 | Métricas de atribuição separando `event` e `online` | Mensurar meta de membros apenas dos cafés |
| T-012 | Design System v1.1 centralizado e QA visual automatizável | Evita regressão para dashboards carregados e estilos divergentes |
| T-013 | CLAUDE.md e playbook Git Flow para execução por agentes | Reduz risco de trabalho fora do escopo ou merges sem teste |

## D. Pendências que **não** bloqueiam escrever o PRD, mas podem bloquear a construção/release
| ID | Decisão em aberto | Responsável sugerido | Momento-limite |
|---|---|---|---|
| P-001 | Gateway de assinatura/ingresso, taxa Pix/cartão, split e contrato. *21/10/2026: gateway escolhido = Stripe (D-017); faltam taxas, Pix na recorrência, split e contrato* | Ellen + Luiggi | Antes de BILL-01 |
| P-002 | Anual em 12x: tipo de cobrança, repasse, inadimplência, renovação automática, condições de cancelamento | Ellen + contador/jurídico + gateway | Antes de vender plano anual |
| P-003 | Política de estorno do café, transferência de ingressos e cancelamento da edição | Ellen + jurídico | Antes de vender ingressos |
| P-004 | Empresa/CNPJ responsável pelas vendas e notas fiscais; tributação real | Ellen + contador | Antes de produção |
| P-005 | Domínio da plataforma independente e destino futuro no site Ellen Conrado | Ellen + Luiggi | Antes do DNS de produção |
| P-006 | Logomarca definitiva, fonte oficial, **fotografias reais autorizadas**, paleta HEX exata e titularidade das artes. *20/10/2026: logo, fontes e paleta recebidas no Brand V2 (D-014); faltam fotos reais, master vetorial do símbolo, registro de marca e homologação final* | Ellen | Antes de publicar marca comercial final |
| P-007 | Provedor de vídeo, armazenamento/DRM equivalente e custo mensal | Luiggi + Ellen | Antes do player de produção |
| P-008 | Provedor de e-mail transacional, remetente e domínio autenticado. *26/10/2026: provedor = Resend (D-018); faltam remetente e domínio autenticado* | Luiggi | Antes dos ingressos reais |
| P-009 | Conteúdo efetivamente disponível e calendário editorial prometido | Ellen | Antes da primeira venda |
| P-010 | Local, data definitiva, capacidade, consumo e política de recepção Café | Ellen + comercial | Antes de anunciar evento |
| P-011 | Quem poderá validar check-in presencial: comercial e owner confirmados; eventuais temporários? | Ellen | Antes do evento |
| P-012 | Retenção/exclusão, termos, moderação e responsabilidade por dados | Ellen + jurídico | Antes da operação real |
| P-013 | Estado real do repositório e integrações já desenvolvidas por Luiggi | Luiggi | Antes de iniciar implementação |
| P-014 | Plataforma final de hosting, backups, observabilidade e custos. *21/10/2026: Supabase cloud (D-015) e Vercel para o web (D-016); faltam o host da API, backups, observabilidade e custos* | Luiggi | Fundação técnica |
| P-015 | Se a regra exige literal **número da PR** na branch, definir mecanismo viável; padrão aprovado para execução é número prévio da Issue | Ellen + Luiggi | Antes do primeiro fluxo Git |
| P-016 | Prioridade de certificado ou mentorias e encontros especiais para membros | Ellen | Refinamento P1 |
| P-017 | Migração futura de recorrências, SSO e contas para Ellen Conrado | Ellen + Luiggi | Antes da integração P1 |

## E. Regra de governança do Decision Log
Qualquer alteração de preço, escopo do MVP, arquitetura aprovada, identidade final, política de acesso ou cronograma comercial entra em uma nova entrada `D-###` com: data, quem decidiu, alternativa descartada, impacto e link da Issue/PR quando houver. **Não** apagar decisões antigas; marcar como substituídas. Nenhuma proposta vira confirmação por ter sido escrita neste documento.
