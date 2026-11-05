# CAIXA FORTE — DESIGN SYSTEM & ART DIRECTION V2.0

## Território de marca
Educação jurídica continuada, estratégia de carreira, comunidade e conexão entre advogados. Personalidade: **elegância serena, clareza, proximidade e autonomia**. Não utilizar símbolos genéricos de advocacia em excesso (balanças, martelos) nem imitar dashboards financeiros.

## Visual aprovado
Um ambiente editorial claro com sidebar vinho/ameixa profunda, **um único destaque prioritário no topo**, jornada principal e poucos cartões de cursos. A interface não deve se parecer com CRM operacional. O mock aprovado em `10_REFERENCES/approved_minimalist_dashboard.png` governa a hierarquia, não seus textos fictícios.

## Densidade e composição
- Desktop: sidebar 232px (colapsável quando necessário), canvas creme, topbar discreta, content width max 1180px.
- Home: até **1 hero**, **1 card de jornada**, **3 cursos** e **2 blocos auxiliares**. Informações completas ficam nas páginas internas.
- Grid: 12 colunas responsivas; alinhamento consistente; respiro vertical de 24–40px; cartões 16px de raio.
- Mobile: drawer ou até 4 destinos no nav inferior + Mais; evitar encolher desktop.
- Um CTA primário por seção; o secundário utiliza link discreto.
- Fundo editorial de objetos de estudo apenas quando agrega contexto; não colocar fotos inventadas de pessoas.

## Tipografia
- Headings display: `Playfair Display` (fallback Georgia), com moderação; uso em hero, curso e campanhas.
- UI: `Inter` (fallback system-ui); todas as ações, tabelas, textos densos e formulários.
- Escala de referência: hero 44/52 desktop e 32/38 mobile; h2 32/40; h3 24/32; corpo 16/25; meta 14/20; caption 12/18.
- Sentenças em português brasileiro; evitar longos títulos em CAIXA ALTA.

## Cores e contrastes
Fonte de verdade: `04_DESIGN_TOKENS/tokens.semantic.json`. Fundo cream, superfícies white, sidebar plum950, ações wine700, bordas suaves. Accents gold/champagne decorativos; verificar WCAG AA antes de usar em textos e controles.

## Componentes
| Elemento | Regras | Estados |
|---|---|---|
| Button primary | Vinho, 44px mínimo, texto legível, sem sombras fortes | default, hover, focus, disabled, loading |
| Button secondary | outline sutil com cor de texto acessível | mesmos estados |
| Card curso | Capa 16:9 ou 3:2, título 1 linha quando viável, resumo até 2 linhas, status verdadeiro | disponível, programado, indisponível |
| Card jornada | Um próximo passo, progresso real só se houver dados | novo, em progresso, completo, erro |
| Tab | Texto e underline/indicador, sem badges decorativos | ativo, hover, focus |
| Search | Altura 44px, label programático, botão claro | vazio, busca, resultados, erro |
| Perfil | Nome + cidade/UF/atuação opt-in, sem contato exposto por padrão | visível, reservado |
| Post | Uma coluna de leitura, autor, data, corpo, ações relevantes | novo, publicado, moderado, excluído |
| Form | Label visível, helper text discreto, validação por campo | idle, invalid, success, loading |
| Badge | Uso restrito a status reais, não decorar título | programado, confirmado, ativo |
| Toast | Feedback curto, aria-live adequado | sucesso, atenção, erro |
| Dialog | Cabeçalho, ação explícita, foco preso e retorno | aberto, enviando, erro |

## Usabilidade e acessibilidade
- Meta WCAG 2.2 AA, contraste, teclado, foco, aria labels, zoom até 200%, reduced-motion.
- Estados empty/loading/error/success em todos os recursos assíncronos.
- Todos os gráficos do admin com título, fonte de dados e alternativa textual.
- Progresso nunca hardcoded; membros e eventos nunca falsos em produção.
- Acesso a arquivos com autorização no servidor, não por link público escondido.

## Anti-patterns
Sem neon, gradiente dramático em todos os cards, glassmorphism intenso, dezenas de mini-ícones, percentuais decorativos, ranking fictício, popups invasivos, motion pesado, layout SaaS administrativo na home do assinante, CSS arbitrário divergente de tokens.

## Responsividade
- 320–599px: uma coluna, menu drawer ou bottom nav, padding 16–20px.
- 600–959px: tablet, 2 cards e sidebar recolhida.
- 960px+: sidebar e 3 cards de curso, hero editorial, jornada destacada.
- Validação também em 375, 390, 768, 1024, 1366 e 1440px.

## Linguagem
A comunidade atende advogados de todos os gêneros; títulos, mensagens e rótulos inclusivos. Não transplantar a referência AI que dizia apenas “advogadas”. Não prometer retorno financeiro garantido em copy.
