import { allMemberNav, type NavItem } from './member-nav';

/**
 * Estado vazio verdadeiro de cada destino do menu cuja tela ainda não existe (CF-171). É o mesmo
 * estado que a tela real mostra quando não há conteúdo: nada inventado, nenhuma Issue citada para
 * o membro. Quando a tela real entra, o slug sai daqui e ganha rota própria.
 */
export interface MemberSectionState {
  title: string;
  description: string;
}

export const memberSectionStates: Readonly<Record<string, MemberSectionState>> = {
  comunidade: {
    title: 'A comunidade ainda não abriu',
    description:
      'Os grupos temáticos aparecem aqui quando forem criados. A comunidade não tem mensagens privadas.',
  },
  conexoes: {
    title: 'O diretório de membros ainda não abriu',
    description:
      'Aparecer nele será sempre uma escolha sua, e o seu contato fica oculto por padrão.',
  },
  'ao-vivo': {
    title: 'Nenhum encontro ao vivo agendado',
    description: 'Os próximos encontros aparecem aqui com data, horário e como participar.',
  },
  cofre: {
    title: 'Ainda não há materiais publicados',
    description: 'Modelos e materiais de apoio aparecem aqui assim que forem publicados.',
  },
  planejamento: {
    title: 'Seu planejamento ainda não começou',
    description: 'O objetivo de 90 dias e as tarefas do mês ficam aqui, visíveis só para você.',
  },
  ajuda: {
    title: 'A central de ajuda está em preparação',
    description: 'Perguntas frequentes e o canal de atendimento aparecem aqui.',
  },
};

export function findMemberSection(slug: string): (NavItem & MemberSectionState) | null {
  const item = allMemberNav.find((nav) => nav.slug === slug);
  const state = memberSectionStates[slug];
  return item && state ? { ...item, ...state } : null;
}
