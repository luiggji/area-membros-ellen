import type { MembershipResult } from '../infrastructure/community-api';

/** Resultado de participar ou sair, já em texto para quem está olhando (CF-093). */
export type MembershipState =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | { status: 'success'; message: string };

export const MEMBERSHIP_MESSAGES = {
  semAcesso: 'A comunidade é para quem tem assinatura vigente. Confira a sua em Minha Assinatura.',
  naoEncontrado: 'Este grupo saiu do ar. Recarregue a página.',
  falhou: 'Não foi possível salvar agora. Tente de novo.',
} as const;

export interface MembershipApi {
  join(groupId: string): Promise<MembershipResult>;
  leave(groupId: string): Promise<MembershipResult>;
}

function fromApi(result: MembershipResult, success: string): MembershipState {
  if (result === 'ok') return { status: 'success', message: success };
  if (result === 'sem_acesso') return { status: 'error', message: MEMBERSHIP_MESSAGES.semAcesso };
  if (result === 'nao_encontrado') {
    return { status: 'error', message: MEMBERSHIP_MESSAGES.naoEncontrado };
  }
  return { status: 'error', message: MEMBERSHIP_MESSAGES.falhou };
}

const text = (value: unknown) => (typeof value === 'string' ? value : '');

/** O nome do grupo vem do formulário só para a confirmação; quem decide é o servidor. */
export async function submitJoin(
  input: Record<string, unknown>,
  api: MembershipApi,
): Promise<MembershipState> {
  const nome = text(input.groupName);
  return fromApi(await api.join(text(input.groupId)), `Você entrou em ${nome}.`);
}

export async function submitLeave(
  input: Record<string, unknown>,
  api: MembershipApi,
): Promise<MembershipState> {
  const nome = text(input.groupName);
  return fromApi(await api.leave(text(input.groupId)), `Você saiu de ${nome}.`);
}
