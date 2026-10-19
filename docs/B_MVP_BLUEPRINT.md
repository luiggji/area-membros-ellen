# CAIXA FORTE — MVP BLUEPRINT
**Versão:** 1.1 · **Data:** 19/10/2026 · **Escopo:** produto próprio independente + ciclo comercial do Café Estratégico

> Documento de execução da primeira release. O PRD completo está em `A_PRD_MASTER_CAIXA_FORTE.md`. **P0 significa necessário ao lançamento, não “implementar tudo de uma vez sem priorização”.** Os detalhes e testes ficam nos Documentos C, E e F.

## 1. Definição do que será lançado
**Caixa Forte:** assinatura recorrente com área privada, catálogo de aulas reais, diretório e comunidades básicas, encontros online, biblioteca, jornada inicial e administração. **Café Estratégico:** página pública própria, lote e limite, checkout, ingresso digital e check-in. Tudo funcionando sem integração imediata ao site Ellen Conrado; essa integração é posterior.

### Objetivos de aceitação P0
| Código | Capacidade mínima | Prova de funcionamento |
|---|---|---|
| MVP-01 | Site público com planos editáveis | Ellen altera preço **para novas vendas** e valor aparece corretamente no checkout |
| MVP-02 | Cadastro/login e permissões | visitante, membro, owner, técnico e comercial têm acessos corretos |
| MVP-03 | Checkout/assinatura/webhook | pagamento aprovado ativa acesso, falha não ativa, estorno revoga conforme política |
| MVP-04 | Catálogo e player | Ellen publica aula sem código; membro assiste e marca progresso |
| MVP-05 | Recursos privados | membro ativo acessa arquivos; outro usuário/visitante é bloqueado |
| MVP-06 | Home híbrida **minimalista aprovada** | hero editorial, uma jornada com CTA prioritário, **até 3 cursos**, encontro e comunidade compactos; dados reais e estados vazios honestos |
| MVP-07 | Perfis e diretório | opt-in explícito; filtros cidade/UF/especialidade; sem telefone público automático |
| MVP-08 | Grupos, posts e comentários | membros interagem; denúncia e moderação por Ellen; sem DMs |
| MVP-09 | Diagnóstico e plano básico | membro registra objetivo de 90 dias + ações de 30 dias privadas |
| MVP-10 | Calendário de encontros | Ellen agenda encontros e links protegidos a membros |
| MVP-11 | Evento e checkout | lote, capacidade e reserva; pagamento confirmado gera ticket individual |
| MVP-12 | Check-in digital | QR validado apenas uma vez e vinculado ao evento correto |
| MVP-13 | Operação e relatórios | Ellen visualiza receita verdadeira, vendas e atribuição de membros a cafés |
| MVP-14 | E-mails/avisos transacionais | recuperação, confirmação de acesso e ingresso; logs de entrega/retentativa |
| MVP-15 | Engenharia e QA | staging isolado, CI, revisão, RLS/RBAC, smoke tests, backups e go/no-go |

## 2. Experiência mínima para três pessoas

**Pessoa comprando a comunidade:** abre landing → escolhe plano mensal/anual → paga → recebe confirmação → entra → vê aula para continuar, grupo para conhecer advogados e meta para definir. Material ainda não liberado é claramente identificado como agendado.

**Pessoa indo ao Café:** abre `/eventos/[slug]` → verifica data/local/valor → compra o ingresso direto (WhatsApp só dúvidas) → recebe QR individual → comercial valida na entrada → recebe kit físico, que **não** é item produzido pelo sistema.

**Ellen:** publica aulas, altera o catálogo de preços para novas compras, abre edição do Café com lote e capacidade, consulta vendas e membros; decide sobre moderação. **Comercial:** acompanha pedidos, auxilia inscrição e valida presença, sem alterar preços. **Luiggi:** administra infraestrutura com privilégios limitados.

## 3. Conteúdo inicial mínimo
**Publicação progressiva aprovada.** Primeira onda editorial recomendada: Comece Aqui (4 aulas), Primeiros Clientes (4–6), Atendimento e Conversão (4–6), Planejamento 2027 (4). Podem ser publicadas sequencialmente; a landing exibirá somente o que está efetivamente disponível e o calendário real do que está programado. Gestão Solo, Finanças, Família, Audiências e Tecnologia são próximos ciclos editoriais, **não necessariamente funcionalidades de software P1** — o mesmo CMS P0 recebe esses cursos quando a produção estiver pronta.

Cada aula: título, objetivo, duração aproximada, vídeo protegido, recursos relacionados, botão de conclusão, próxima aula disponível e data de publicação quando futura.

## 4. Tela inicial mínima v1.1 — referência visual aprovada
```text
DESKTOP:    Topbar enxuta: Busca discreta | Alertas | Perfil
SIDEBAR:    Início | Minha Jornada | Cursos | Comunidade | Café Estratégico |
            Assinatura | Mais (Conexões, Ao Vivo, Materiais, Planejamento, Ajuda)
HOME:       Hero editorial (bem-vinda + frase curta, sem várias CTAs)
            [MINHA JORNADA — 1 CTA PRIMÁRIO: Começar/Continuar]
            Cursos em destaque: [01] [02] [03]      Ver todos
            [Próximo encontro]                  [Comunidade e conexões]
MOBILE:     menu compacto; título + jornada + cursos; ações secundárias abaixo
```
**Design aprovado:** layout leve, premium, com muito espaço em branco, canvas creme/marfim, menu vinho escuro, tipografia serifada nos grandes títulos e UI sans-serif. **Não** reproduzir antigos mosaicos densos, múltiplos gráficos, sete cards no topo ou home em modo escuro integral. Uma ação principal. O membro continua acessando os mesmos módulos nas telas internas.

**Entregáveis de aceite visual P0:** (1) screenshots reais desktop 1440px e mobile 390px do ambiente de preview; (2) comparação com `references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png`; (3) validação de densidade máxima, recortes, contraste, foco e estados loading/empty/error; (4) aprovação de Ellen. Detalhes implementáveis no documento **`G_DESIGN_SYSTEM_MINIMALISTA.md`**.

## 5. Operação dos pagamentos

- Preços de referência no seed de staging: R$89 mensal e R$790 anual; **não** embutir como constantes no frontend.
- Plano anual e parcelamento em até 12 vezes: **liberação depende de validação de gateway e política de renovação/cancelamento**. Se o gateway não suportar contratação aceita pela cliente, **não vender modalidade anual incorreta**; desativar temporariamente essa opção e registrar decisão.
- Um pedido só vira pagamento aprovado após evento verificado na API ou webhook assinado; `success_url` não é prova.
- Preços versionados; modificar preços do catálogo não altera assinaturas existentes por acidente.
- Paywall em API, Storage/vídeo e banco; não apenas no menu.
- Comunicação transacional e comprovantes conforme obrigações aplicáveis.

## 6. Operação dos ingressos

- Evento tem lote(s), limite, endereço e status editáveis no admin.
- Reservas com prazo de expiração e estoque consistente sob concorrência.
- QR com token opaco validado no servidor; não carregar dados pessoais em claro.
- `CHECKED_IN` somente uma vez, em operação atômica. Ticket cancelado/reembolsado nunca libera entrada.
- E-mail de ingresso e página de segunda via; consulta autorizada por nome para contingência online.
- Vendas e membros adquiridos no café são relatórios distintos, vinculados por identificadores; não assumir que presença equivale a compra de assinatura.
- Sem modo offline no check-in no MVP: prover Wi-Fi/dados e checklist de contingência.

## 7. Papéis e limites
| Recurso | Ellen / owner | Comercial | Luiggi / técnico | Membro |
|---|---|---|---|---|
| Gerenciar planos/preços | Sim | Não | Não por padrão | Não |
| Publicar cursos/eventos | Sim | Não | Suporte técnico excepcional | Não |
| Ver status básico de inscrição | Sim | Sim | Só suporte auditado | Próprio |
| Check-in de participantes | Sim | Sim | Só diagnóstico autorizado | Próprio QR |
| Ver relatórios financeiros | Sim | Não | Não por padrão | Próprio contrato |
| Moderação | Sim | Não por padrão | Não por padrão | Denunciar |
| Perfil pessoal e progresso | Próprio; suporte restrito | Não | Não | Próprio |
| Deploy e observabilidade | Aprova mudança de produto | Não | Sim, com acesso limitado | Não |

## 8. Limites expressos do MVP (não construir como P0)
DM/mensagens privadas; chamadas de vídeo embutidas; IA para recomendações; gamificação; dashboards fictícios; indicadores complexos das sete áreas; aplicativo nativo; marketplace de professores; portal de terceiros; trilhas de certificação avançada; integração definitiva de login com Ellen Conrado; benefício automático do Seven Box; WhatsApp automatizado obrigatório; QR offline; integração com CRM externo. **Não deixar ganchos visuais com botões sem função.**

## 9. Checklist de go/no-go
- [ ] Site e termos revisados; preço e carga de conteúdo descritos corretamente.
- [ ] Compra mensal sandbox real passa no fluxo completo; acesso revoga quando devido.
- [ ] Modalidade anual homologada **ou desativada com aprovação expressa**.
- [ ] Ingresso pago é emitido só uma vez; acesso ao QR restrito; check-in atômico.
- [ ] 20 vagas não podem gerar 21 confirmações silenciosas sob concorrência.
- [ ] Owner, técnico e comercial testados com contas distintas.
- [ ] Diretório só exibe perfis opt-in; grupos moderáveis; sem mensagens privadas.
- [ ] Aulas e materiais privados protegidos por servidor/banco/storage.
- [ ] Pelo menos um curso real com aulas efetivamente publicadas e cronograma futuro correto.
- [ ] Admin cria conteúdo e evento sem editar código.
- [ ] CI verde, QA P0, permissões e RLS, teste mobile, staging separado.
- [ ] **Design minimalista v1.1 homologado**: 1 hero + 1 jornada + até 3 cursos + no máximo 2 cartões auxiliares; não há gráficos e números decorativos na home; mobile sem overflow; contraste/foco aprovados.
- [ ] Backup e restauração verificados; rollback preparado e smoke pós-deploy.
- [ ] Ellen homologa experiência e conteúdo; Luiggi homologa segurança/engenharia.

## 10. Ordem de construção em fatias de valor
1. **Tronco seguro e base visual aprovada:** app shell minimalista, tokens e componentes reais + Auth, RBAC, banco e ambiente/staging/CI.
2. **Motor de receita:** planos, gateway, webhooks, acesso.
3. **Motor do café:** landing evento, estoque, checkout, ticket, e-mail, check-in.
4. **Entrega de valor:** cursos, player, biblioteca e home.
5. **Comunidade:** diretório opt-in, grupos, posts e moderação.
6. **Jornada:** diagnóstico, objetivos, eventos online e relatórios.
7. **Homologação integral:** bugs bloqueantes, go/no-go e publicação controlada.

**Dependência de calendário:** o Café de Ourinhos em 26/11/2026 é referência preliminar. Se o módulo próprio de eventos não atingir padrão seguro a tempo, o escopo comercial/datas deverá ser revisto pela cliente; nenhuma ferramenta externa está automaticamente aprovada como substituição.
