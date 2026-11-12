import { describe, expect, it } from 'vitest';

import type { MembershipResult } from '../infrastructure/community-api';
import {
  MEMBERSHIP_MESSAGES,
  type MembershipApi,
  submitJoin,
  submitLeave,
} from './membership-use-cases';

const GRUPO = '7a6b5c4d-3e2f-4a1b-9c8d-7e6f5a4b3c2d';

function fakeApi(result: MembershipResult = 'ok') {
  const calls: unknown[][] = [];
  const api: MembershipApi = {
    join: async (id) => {
      calls.push(['join', id]);
      return result;
    },
    leave: async (id) => {
      calls.push(['leave', id]);
      return result;
    },
  };
  return { api, calls };
}

describe('entrar e sair de grupo (CF-093)', () => {
  it('confirma a entrada pelo nome do grupo', async () => {
    const { api, calls } = fakeApi();
    const state = await submitJoin({ groupId: GRUPO, groupName: 'Advocacia Solo' }, api);
    expect(state).toEqual({ status: 'success', message: 'Você entrou em Advocacia Solo.' });
    expect(calls).toEqual([['join', GRUPO]]);
  });

  it('confirma a saída pelo nome do grupo', async () => {
    const { api, calls } = fakeApi();
    const state = await submitLeave({ groupId: GRUPO, groupName: 'Advocacia Solo' }, api);
    expect(state).toEqual({ status: 'success', message: 'Você saiu de Advocacia Solo.' });
    expect(calls).toEqual([['leave', GRUPO]]);
  });
});

describe('respostas da API viram mensagem para o membro', () => {
  it('sem assinatura vigente aponta para Minha Assinatura', async () => {
    const { api } = fakeApi('sem_acesso');
    expect(await submitJoin({ groupId: GRUPO, groupName: 'Gestão' }, api)).toEqual({
      status: 'error',
      message: MEMBERSHIP_MESSAGES.semAcesso,
    });
  });

  it('grupo que saiu do ar pede recarregar', async () => {
    const { api } = fakeApi('nao_encontrado');
    expect(await submitJoin({ groupId: GRUPO, groupName: 'Gestão' }, api)).toEqual({
      status: 'error',
      message: MEMBERSHIP_MESSAGES.naoEncontrado,
    });
  });

  it('falha genérica não finge que entrou', async () => {
    const { api } = fakeApi('falhou');
    expect(await submitLeave({ groupId: GRUPO, groupName: 'Gestão' }, api)).toEqual({
      status: 'error',
      message: MEMBERSHIP_MESSAGES.falhou,
    });
  });
});
