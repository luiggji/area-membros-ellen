# CAIXA FORTE — PACOTE PRD v1.1 MINIMALISTA
**Preparado em:** 19 de outubro de 2026 · **Para:** Ellen Conrado, Luiggi e equipe comercial

## Qual foi a mudança aprovada?
O layout aprovado pela cliente é **minimalista, elegante e editorial**, com **sidebar vinho**, fundo principal **creme/marfim**, hierarquia clara, apenas uma jornada prioritária, **até 3 cursos em destaque e 2 acessos secundários** na home. **Não voltar** ao modelo anterior de dashboard cheio de informações. Referência: `references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png`.

**Este é o mesmo produto do PRD v1.0, com a direção de UI atualizada.** Não houve retirada de funcionalidades P0. A imagem de referência inclui pessoa sintética, textos/datas ilustrativos, não é foto verdadeira de Ellen e não deve ser copiada literalmente para produção.

## Escopo reafirmado
Caixa Forte própria independente primeiro, integração Ellen Conrado posteriormente. Assinaturas mensais e anuais editáveis; cursos e conteúdos progressivos; diretório de profissionais, grupos/posts/comentários sem DM; diagnóstico e planejamento básico; encontros online; **ciclo completo do Café Estratégico** (venda, QR digital, check-in) dentro do produto. Ellen, Luiggi e comercial com papéis diferenciados. Git Flow, CI/CD, QA e segurança fazem parte da entrega.

## Por onde o Luiggi começa?
1. **`CLAUDE.md`** — colocar na raiz do repositório real **após revisar caminhos**.
2. **`I_PROMPT_INICIAL_CLAUDE_CODE.md`** — enviar ao Claude Code para auditar antes de codar.
3. **`D_DECISION_LOG.md`** — acordos aprovados e pendências.
4. **`A_PRD_MASTER_CAIXA_FORTE.md`** — o PRD funcional completo.
5. **`G_DESIGN_SYSTEM_MINIMALISTA.md`** — como as telas devem ficar (documento crucial desta revisão).
6. **`B_MVP_BLUEPRINT.md`** — somente P0 e condições de lançamento.
7. **`C_DEVELOPMENT_BACKLOG.md`** — Issues CF-###, prioridades e dependências.
8. **`E_ENGINEERING_DELIVERY_PLAN.md`** — governança técnica, ambientes e CI/CD.
9. **`F_QA_TEST_STRATEGY.md`** — testes, visual QA, aprovação.
10. **`H_GUIA_CLAUDE_CODE_GITFLOW.md`** — Git Flow operacional, comandos ilustrativos e gates.
11. **`J_CHANGELOG_V1_1.md`** — tudo que mudou em relação a v1.0.

## Como instalar esta documentação no repositório (sem sobrescrever conteúdo existente)
Recomendação a validar conforme o repo real:
```text
<REPO-REAL>/
  CLAUDE.md                  <- arquivo da raiz incluído no pacote
  docs/
    00_LEIA_PRIMEIRO.md
    A_PRD_MASTER_CAIXA_FORTE.md
    ...
    J_CHANGELOG_V1_1.md
    references/
      REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png
```
Não criar pasta `docs` duplicada se já houver documentação equivalente. Arquivos não precisam ser renomeados se a equipe registrar os links certos; o importante é uma única fonte de verdade.

## Regra Git
`main` produção; `develop` integração; branch temporária `tipo/<NUMERO_REAL_DA_ISSUE>-slug` **obrigatória**; commits com número opcional; PRs com Issue vinculada, CI, review e homologação. O número da PR nasce quando a PR é criada; não inventar. Exigir o número **da própria PR** literalmente na branch dependeria de método especial aprovado — pendência `P-015`.

## Pendências essenciais antes de venda real
Gateway e repasse do anual 12×, renovação e política de cancelamento, contratos e notas, vídeo protegido, remetente de e-mail, domínio, fotos/logo final e informações confirmadas do café. Todos registrados em `D_DECISION_LOG.md`.

## Honestidade da entrega
A v1.1 revisa **documentos** e inclui a **imagem de direção visual**. Não cria componentes Next.js, branch remota, banco de dados, CI, aplicação de gateway, site publicado ou testes executados.
