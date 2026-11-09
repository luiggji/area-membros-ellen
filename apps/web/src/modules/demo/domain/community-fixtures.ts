/**
 * Conteúdo FICTÍCIO das telas de comunidade, eventos e conta da demonstração (CF-175/CF-177). Pessoas,
 * posts, datas, preços e cobranças são exemplos para Ellen avaliar a composição; nenhum é real
 * e o app exibe a faixa de demonstração e o selo "Exemplo".
 */

export interface ExampleMember {
  id: string;
  name: string;
  city: string;
  state: string;
  areas: readonly string[];
  bio: string;
}

export const exampleMembers: readonly ExampleMember[] = [
  {
    id: 'ana',
    name: 'Ana Fictícia',
    city: 'Curitiba',
    state: 'PR',
    areas: ['Família', 'Sucessões'],
    bio: 'Advocacia de família com foco em mediação e acordos.',
  },
  {
    id: 'bruno',
    name: 'Bruno Exemplo',
    city: 'Porto Alegre',
    state: 'RS',
    areas: ['Trabalhista'],
    bio: 'Atendo empresas de pequeno porte em consultoria trabalhista.',
  },
  {
    id: 'carla',
    name: 'Carla Teste',
    city: 'Belo Horizonte',
    state: 'MG',
    areas: ['Imobiliário', 'Contratos'],
    bio: 'Contratos imobiliários e regularização de imóveis.',
  },
  {
    id: 'diego',
    name: 'Diego Modelo',
    city: 'Curitiba',
    state: 'PR',
    areas: ['Previdenciário'],
    bio: 'Planejamento previdenciário para autônomos.',
  },
];

export function findMember(id: string): ExampleMember | undefined {
  return exampleMembers.find((member) => member.id === id);
}

/** Filtro do diretório: cidade, UF e área, como a busca real (CF-091). */
export function searchMembers(query: { cidade?: string; uf?: string; area?: string }) {
  const norm = (value: string) =>
    value
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .trim();
  return exampleMembers.filter(
    (member) =>
      (!query.cidade || norm(member.city).includes(norm(query.cidade))) &&
      (!query.uf || member.state === query.uf) &&
      (!query.area || member.areas.some((area) => norm(area).includes(norm(query.area!)))),
  );
}

export const exampleGroups = [
  { slug: 'primeiros-anos', name: 'Primeiros anos de advocacia', members: 42, joined: true },
  { slug: 'familia', name: 'Direito de Família', members: 31, joined: true },
  { slug: 'gestao', name: 'Gestão do escritório', members: 27, joined: false },
] as const;

export interface ExamplePost {
  id: string;
  author: string;
  group: string;
  when: string;
  body: string;
  comments: readonly { author: string; when: string; body: string }[];
}

export const examplePosts: readonly ExamplePost[] = [
  {
    id: 'p1',
    author: 'Ana Fictícia',
    group: 'Direito de Família',
    when: 'há 2 horas',
    body: 'Alguém tem um roteiro de primeira reunião para casos de guarda compartilhada? Quero organizar melhor as perguntas iniciais.',
    comments: [
      {
        author: 'Carla Teste',
        when: 'há 1 hora',
        body: 'Uso o checklist do Cofre como base e acrescento perguntas sobre a rotina das crianças.',
      },
    ],
  },
  {
    id: 'p2',
    author: 'Bruno Exemplo',
    group: 'Gestão do escritório',
    when: 'ontem',
    body: 'Comecei a bloquear duas manhãs por semana só para prazos. Mudou minha semana. Como vocês organizam a agenda?',
    comments: [],
  },
];

export const exampleLiveSessions = [
  {
    title: 'Mentoria coletiva: precificação de honorários',
    date: 'qui., 20/11',
    time: '19h às 20h30',
    status: 'Inscrição aberta',
  },
  {
    title: 'Perguntas e respostas do mês',
    date: 'ter., 02/12',
    time: '12h às 13h',
    status: 'Programado',
  },
] as const;

export const exampleRecordings = [
  { title: 'Como montar seu primeiro plano de 90 dias', date: '28/10', minutes: 74 },
  { title: 'Atendimento inicial que gera confiança', date: '14/10', minutes: 61 },
] as const;

export const exampleEvent = {
  title: 'Café Estratégico',
  edition: 'Edição Curitiba',
  date: 'sábado, 06/12',
  time: '9h às 12h',
  venue: 'Espaço de eventos no Centro (exemplo)',
  city: 'Curitiba / PR',
  benefits: [
    'Uma manhã de conversa estratégica sobre carreira e escritório',
    'Mesa com colegas da sua região',
    'Material de trabalho para levar',
  ],
  lots: [
    { name: '1º lote', price: 'R$ 197', state: 'Esgotado' },
    { name: '2º lote', price: 'R$ 247', state: 'Disponível', seats: 'Restam 18 vagas' },
    { name: '3º lote', price: 'R$ 297', state: 'Em breve' },
  ],
} as const;

export const exampleTicket = {
  holder: 'Membro de exemplo',
  code: 'CF-EXEMPLO',
  status: 'Confirmado',
} as const;

export const exampleSubscription = {
  plan: 'Caixa Forte Mensal',
  status: 'Ativa',
  price: 'R$ 97/mês',
  since: '05/08',
  nextCharge: '05/12',
  method: 'Cartão final 0000',
  history: [
    { date: '05/11', amount: 'R$ 97,00', status: 'Pago' },
    { date: '05/10', amount: 'R$ 97,00', status: 'Pago' },
    { date: '05/09', amount: 'R$ 97,00', status: 'Pago' },
  ],
} as const;

export const exampleFaq = [
  {
    question: 'Como cancelo minha assinatura?',
    answer:
      'Em Assinatura, use "Gerenciar assinatura". O acesso continua até o fim do período já pago.',
  },
  {
    question: 'Comprar ingresso do Café me torna assinante?',
    answer: 'Não. O ingresso vale para o encontro; a assinatura da Caixa Forte é separada.',
  },
  {
    question: 'Quem vê meu perfil no diretório?',
    answer:
      'Só outros assinantes, e só se você aceitar o termo do diretório. E-mail e telefone nunca aparecem.',
  },
  {
    question: 'Posso falar de casos de clientes na comunidade?',
    answer:
      'Não com dados que identifiquem pessoas. Fale da situação em termos gerais, sem nomes, números de processo ou documentos.',
  },
] as const;
