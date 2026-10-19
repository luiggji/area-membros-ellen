# CAIXA FORTE — DESIGN SYSTEM & UI BLUEPRINT MINIMALISTA
**Documento G · versão 1.1 · 19/10/2026 · status: direção visual aprovada; tokens específicos propostos para homologação**

> **REFERÊNCIA PRIORITÁRIA:** `references/REFERENCIA_APROVADA_DASHBOARD_MINIMALISTA.png` — imagem produzida nesta conversa e aprovada pela cliente pela **aparência minimalista**. Não é interface programada, design em Figma, fotografia real, nem fonte para transcrever conteúdo fictício. Em caso de conflito entre o mock original mais carregado e o novo, prevalece a **direção visual minimalista v1.1**. Documentos A–F preservam os requisitos funcionais.

## 1. Ideia orientadora
**Caixa Forte deve parecer uma experiência editorial premium e acolhedora para advogados, não um painel operacional cheio de widgets.** O assinante consegue escolher uma próxima ação em segundos, sem navegar por dezenas de informações simultâneas.

Princípios:
1. **Uma tarefa por foco:** no topo, um CTA prioritário para continuar jornada ou começar o diagnóstico.
2. **Respiração:** espaçamento amplo e ritmado; evitar microcards e badges concorrentes.
3. **Tipografia hierárquica:** títulos editoriais serifados só nos lugares de destaque; corpo e controles sans legível.
4. **Calor humano discreto:** creme, vinho e rosé suave; objetos reais de café/livros/agenda em fotografia autorizada, sem brilho sintético.
5. **Informação progressiva:** home resumida; detalhes completos no interior dos módulos.
6. **Inclusão:** linguagem para advogados de diferentes gêneros; não reproduzir “para advogadas” da imagem como regra de público.
7. **Funcionalidade real:** cada cartão, botão, progresso ou status representa fonte de dados e ação implementada.

## 2. Design tokens (proposta inicial, não cor oficial homologada)
| Token | Valor de referência | Uso |
|---|---|---|
| `plum-950` | `#321927` | sidebar, texto de destaque, superfície profunda |
| `wine-700` | `#693548` | botão primário, foco ativo |
| `cream-50` | `#FAF7F3` | canvas do produto |
| `sand-100` | `#F3EAE4` | cards de destaque e seções alternadas |
| `blush-200` | `#EBD7CF` | detalhes suaves e status neutros |
| `champagne-500` | `#C39B83` | acento discreto (não cor única de texto) |
| `ink` | `#30232B` | títulos e corpo |
| `muted` | `#655B60` | informações auxiliares |
| `white` | `#FFFFFF` | superfícies de alta legibilidade |

**Fonte sugerida [PENDENTE DE ESCOLHA]:** `Cormorant Garamond` ou `Fraunces` em h1/h2 editorial; `Inter` ou `Manrope` no texto e controles. Não usar fonte serifada em números de pagamento, códigos de ingresso, labels ou tabelas operacionais. Verificar licença antes de incluir fonte no repositório; não distribuir arquivos de fontes sem os direitos necessários.

### Tokens de composição
- Escala de espaçamento: base 4 e 8 px; intervalos frequentes 8/12/16/24/32/48 px.
- `page-content-max`: ideal 1120–1240px, medida final dependente do browser e sidebar.
- `sidebar-width`: referência 220–248px no desktop; não fixar se comprometer notebook pequeno.
- `header-height`: ~64–76px; ícones em baixa quantidade (busca, avisos quando úteis, avatar).
- Cards principais: raio ~12–20px; borda fina ou sombra suave, nunca ambos intensos.
- Conteúdo confortável: parágrafos tipicamente 45–75 caracteres por linha.
- Movimento: microtransições 150–220ms discretas, `prefers-reduced-motion` respeitado.
- Botão principal: vinho sobre superfície clara; secundário outline/link com contraste adequado.

### Variáveis semânticas para frontend
```css
:root {
  --cf-bg: #FAF7F3;
  --cf-surface: #FFFFFF;
  --cf-surface-muted: #F3EAE4;
  --cf-sidebar: #321927;
  --cf-primary: #693548;
  --cf-accent: #C39B83;
  --cf-text: #30232B;
  --cf-text-secondary: #655B60;
  --cf-border: #E5D9D2;
  --cf-focus: #693548;
  --cf-radius-card: 16px;
}
```
As variáveis acima são **sementes de implementação** sujeitas à homologação de Ellen. Avaliar WCAG 2.2 AA para todas as combinações; superfície rosé com texto rosé não passa só porque combina visualmente.

## 3. Navegação e apresentação dos módulos
**Não retirar funcionalidades**: o escopo permanece o PRD Master.

Desktop: barra lateral vinho com símbolo/nome, até seis destinos no primeiro nível: **Início**, **Minha Jornada**, **Cursos**, **Comunidade**, **Café Estratégico** e **Assinatura**. Link **Mais** agrupa **Conexões**, **Ao Vivo**, **Cofre de Materiais**, **Meu Planejamento**, **Ajuda**. Pode-se agrupar por cabeçalhos discretos em vez de “Mais”, caso facilite usabilidade sem adicionar peso.

**Importante:** Conexões P0 não vira subfuncionalidade adiada; fica alcançável pela Comunidade e pela busca/diretório. O Café Estratégico possui página pública independente, acessível sem login; pode haver atalho privado quando relevante. Painel da equipe (`/admin`) com estrutura própria e foco funcional.

Mobile: menu drawer ou navegação inferior contida (máximo quatro destinos + Mais), marca discreta no topo, cards empilhados, CTA principal após texto editorial. Nada de encolher a sidebar do desktop sobre o conteúdo.

## 4. Wireframes funcionais por tela

### 4.1 Home do assinante — `/app`
```text
┌ SIDEBAR (vinho) ─┬ HOME (marfim) ──────────────────────────────────────┐
│ Marca            │ Busca (discreta)                          Perfil   │
│ Início           │ H1: Bem-vindo(a) à Caixa Forte                    │
│ Minha Jornada    │ Linha curta sobre evolução                         │
│ Cursos           │ [Fotografia editorial autorizada]                  │
│ Comunidade       │                                                    │
│ Café Estratégico │ [JORNADA: título, 1 linha, progresso REAL, CTA]    │
│ Assinatura       │                                                    │
│ Mais             │ Cursos em destaque           Ver todos             │
│                  │ [card 1]        [card 2]         [card 3]          │
│                  │                                                    │
│                  │ [próximo encontro] [comunidade/conexões]           │
└──────────────────┴────────────────────────────────────────────────────┘
```
**Restrições de densidade:** na home padrão no máximo **1 hero + 1 jornada + 3 cards de cursos + 2 auxiliares**. O mock pode apresentar mais elementos decorativos que a versão implementada; a função deles não é obrigatória. Sem contador de seguidores, score, ranking, gráficos de faturamento, feed inteiro ou eventos múltiplos na home do assinante. Não mostrar “70%” sem cálculo real. Hero é curto o suficiente para deixar a jornada visível em tamanhos usuais de notebook, sempre sujeito a validação responsiva.

**Variações:**
- Novo membro: apresentar “Comece por aqui” e diagnóstico inicial; progresso não inventado.
- Membro com aula: destacar “Continuar aula” ou “Continuar jornada”, não os dois como CTAs iguais.
- Catálogo vazio: conteúdo futuro informado com data verdadeira ou “Em preparação”, sem capa chamando aula inexistente.
- Evento inexistente: ocultar cartão secundário ou indicar calendário vazio verdadeiro.
- Assinatura irregular: aviso transacional objetivo com link para resolver, sem esconder o problema por estética.

### 4.2 Catálogo de cursos — `/app/cursos`
- Cabeçalho pequeno com título, resumo de 1 linha e busca/filtros discretos.
- Desktop 3 cards por linha quando houver espaço; tablet 2; mobile 1 ou 2 somente se legíveis.
- Capas elegantes e consistentes; título + resumo de 1–2 linhas + estado (disponível/programado).
- Não exibir 40 metadados em cada capa. Detalhes de módulos ficam na página do curso.
- Cursos recomendados separáveis de catálogo total sem carrossel obrigatório.

### 4.3 Curso e player — `/app/cursos/[slug]` e `/app/aulas/[id]`
- Vídeo é elemento principal; sidebar de módulos discreta, recolhível em telas pequenas.
- Exibir título, resumo, conclusão, próximo passo e materiais relacionados com hierarquia clara.
- Estado de conteúdo não liberado explicitamente identificado; sem player falso.
- Foco teclado, legendas quando disponíveis e comportamento seguro de acesso.

### 4.4 Comunidade — `/app/comunidade`
- Cabeçalho simples; tabs **Publicações**, **Grupos** e **Conexões** (ou link para diretório).
- Coluna central de leitura confortável; composer de post; cartões sem peso ornamental.
- Comentários abaixo do post, denúncias discretas, status de moderação sem exposição de denunciante.
- Nunca mostrar mensagem privada no MVP. Mostrar regras de sigilo no contexto certo, sem banner gigantesco permanente.

### 4.5 Conexões — `/app/conexoes`
- Busca por cidade/UF/área; cards de membro enxutos (foto opcional/placeholder não-personalizado, nome profissional, cidade, áreas).
- Diretório sujeito a opt-in; telefone/e-mail escondidos por padrão.
- Perfil completo em tela dedicada; sem falsos botões de “enviar mensagem”.

### 4.6 Minha Jornada e Planejamento — `/app/jornada`, `/app/planejamento`
- Stepper curto: diagnóstico → objetivo 90 dias → ações 30 dias.
- Exibir a etapa atual em destaque, no máximo um formulário longo por vez; permitir salvar e retomar.
- A evolução usa exclusivamente dados do usuário; não oferecer score artificial.

### 4.7 Encontros ao vivo — `/app/ao-vivo`
- Lista limpa dos próximos encontros reais e gravações disponíveis.
- Exibir data, hora, fuso, status, uma ação; sem calendário cheio quando poucos eventos.

### 4.8 Café Estratégico público — `/eventos/[slug]`
- Página de venda com hero elegante, benefícios, local/data confirmados, preço/lotes, CTA de checkout.
- Layout mais comercial que a área privada, porém a mesma paleta e tom premium; prioridade para clareza de preço, vagas e política de compra.
- Após compra: ingresso digital e confirmação, não uma “comunidade” automática.
- Check-in da equipe em `/admin/eventos/[id]/checkin`: **funcional acima do decorativo**, câmera/consulta manual, estado válido/usado/cancelado, feedback grande e inequívoco.

### 4.9 Painel administrativo — `/admin`
- Owner: números reais por evento/assinatura, gestão de planos e conteúdo, moderação.
- Comercial: lista, status, suporte e check-in, sem ações financeiras indevidas.
- Técnico: diagnósticos/infra conforme permissões temporárias.
- Pode usar tabelas e filtros mais densos; preservar contraste, espaço, ordem e acessibilidade. Não aplicar limite dos “3 cards da home” no dashboard operacional.

### 4.10 Minha Assinatura — `/app/assinatura`
- Estado real do contrato, preço contratado, próximo vencimento quando disponível, instruções de gestão, pagamento e cancelamento conforme gateway.
- Não confundir preço de catálogo com preço do contrato em vigor.

## 5. Componentização proposta (sem impor estrutura de diretórios antes de auditoria)
`MemberShell`, `AdminShell`, `PublicShell`, `BrandMark`, `MinimalSidebar`, `MinimalTopbar`, `EditorialHero`, `JourneyFocusCard`, `CourseCard`, `SmallEventCard`, `CommunityGatewayCard`, `FormStep`, `ProgressBar`, `LessonPlayer`, `PostComposer`, `ProfileCard`, `TicketQRPanel`, `StatusPill`, `EmptyState`, `ErrorState`, `Skeleton`, `PaywallNotice`.

Regras:
- Tokens compartilhados; variantes explícitas; nunca hex solto repetido nos componentes.
- Componente de apresentação não implementa autorização por conta própria: validação no servidor/domínio.
- Placeholder não se passa por transação, usuário real ou dados de sucesso.
- Botões sempre têm ação, navegação ou estado disabled com motivo.
- Material protegido por API/storage, não por ocultação visual.
- Menus e card-links com navegação correta por teclado e leitores de tela.

## 6. Fotografia, logo e conteúdos visuais
- **Prioridade:** imagem real de objeto e ambiente com direito de uso; livro, xícara, agenda; compressão e uso responsável de next/image.
- **Fotos pessoais:** inserir somente imagens autorizadas pela proprietária. A mulher representada no mock é gerada artificialmente e **não deve ser apresentada como Ellen**.
- **Logo:** símbolo de fechadura no mock é provisório; usar placeholder de marca tipográfico de boa qualidade se não houver logo final e registrar pendência de aprovação.
- **Capas de cursos:** mesma linguagem de cor/fotografia editorial, imagens distintas por curso, hierarquia de título simples; não exagerar em elementos metálicos.
- Não usar mock gerado como background recortado da UI final; construir os componentes reais.

## 7. QA visual e critérios de aceite
- Capturar screenshot de implementação funcional, desktop **1440 × 900** e mobile **390 × 844**; testar também 320, 375, 768 e 1024px.
- Referência visual aplicada à **densidade/organização**, não como teste pixel-perfect de imagem IA.
- Sem corte horizontal, texto legível a 200% zoom, foco visível, teclado e leitores de tela nos controles principais.
- Estados: carregamento, sem curso, sem perfil, sem evento, sem posts, erro de API, assinatura irregular.
- Ação principal identificável em até 3 segundos numa observação guiada de usabilidade (heurística de revisão, não métrica prometida).
- Sem cabeçalhos gigantes que empurrem toda a utilidade para o final; a dobra varia por resolução.
- Sem conteúdo, números ou fotos fictícios rotulados como reais.
- Aprovação visual formal de Ellen no preview/staging antes do merge/release que altere o shell ou a home.

## 8. Proibições de regressão e política de mudança
1. Não reintroduzir mosaico de dezenas de cards por iniciativa própria.
2. Não mudar para dashboard integralmente escuro.
3. Não inserir ranking, métricas ou gráficos decorativos na home.
4. Não multiplicar CTAs equivalentes na mesma seção.
5. Não trocar paleta ou tipografia sem entrada no Decision Log.
6. Não esconder venda, segurança, erro ou conteúdo necessário apenas para parecer minimalista.
7. Não confundir a área de membros com administração financeira.

**Prioridade em caso de conflito:** segurança/legibilidade e regras de negócio → decisões expressas da cliente → acessibilidade e funcionalidade → tokens e padrões de UI propostos → preferência subjetiva do agente.
