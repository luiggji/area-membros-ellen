import { describe, expect, it } from 'vitest';

import {
  acceptPolicy,
  PROFILE_MESSAGES,
  type ProfileRepository,
  revokeConsent,
  updateProfile,
} from './profile-use-cases';

function fakeRepo(ok = true) {
  const calls: Record<string, unknown[]> = {};
  const repo: ProfileRepository = {
    save: async (input) => ((calls.save ??= []).push(input), ok),
    accept: async (id) => ((calls.accept ??= []).push(id), ok),
    revoke: async (id) => ((calls.revoke ??= []).push(id), ok),
  };
  return { repo, calls };
}

const ID = '5f0e8c3a-2b1d-4c6e-9a7f-0d1e2f3a4b5c';

describe('perfil', () => {
  it('valida, normaliza e grava', async () => {
    const { repo, calls } = fakeRepo();
    const result = await updateProfile(
      { name: ' Ana ', city: 'Ourinhos', state: 'SP', professional_stage: 'solo', bio: '' },
      repo,
    );
    expect(result).toEqual({ status: 'success', message: PROFILE_MESSAGES.saved });
    expect(calls.save?.[0]).toEqual({
      name: 'Ana',
      city: 'Ourinhos',
      state: 'SP',
      professional_stage: 'solo',
      bio: null,
    });
  });

  it('não grava dado inválido e devolve erro por campo com os valores digitados', async () => {
    const { repo, calls } = fakeRepo();
    const result = await updateProfile({ name: 'A', state: 'XX' }, repo);
    expect(result).toMatchObject({
      status: 'error',
      fieldErrors: { name: 'Informe seu nome.', state: 'Escolha uma UF da lista.' },
      values: { name: 'A', state: 'XX' },
    });
    expect(calls.save).toBeUndefined();
  });

  it('ignora campos que não são do formulário (ex.: directory_opt_in, id)', async () => {
    const { repo, calls } = fakeRepo();
    await updateProfile({ name: 'Ana', id: 'outra-pessoa', directory_opt_in: 'true' }, repo);
    expect(Object.keys(calls.save?.[0] as object).sort()).toEqual([
      'bio',
      'city',
      'name',
      'professional_stage',
      'state',
    ]);
  });

  it('falha ao gravar vira mensagem genérica', async () => {
    const result = await updateProfile({ name: 'Ana' }, fakeRepo(false).repo);
    expect(result).toMatchObject({ status: 'error', message: PROFILE_MESSAGES.saveFailed });
  });
});

describe('consentimentos', () => {
  it('aceita e revoga pelo id da versão / do aceite', async () => {
    const { repo, calls } = fakeRepo();
    expect(await acceptPolicy(ID, repo)).toMatchObject({ status: 'success' });
    expect(await revokeConsent(ID, repo)).toMatchObject({ status: 'success' });
    expect(calls.accept).toEqual([ID]);
    expect(calls.revoke).toEqual([ID]);
  });

  it('recusa id malformado sem ir ao banco', async () => {
    const { repo, calls } = fakeRepo();
    expect(await acceptPolicy('1 or 1=1', repo)).toMatchObject({ status: 'error' });
    expect(await revokeConsent(undefined, repo)).toMatchObject({ status: 'error' });
    expect(calls.accept).toBeUndefined();
    expect(calls.revoke).toBeUndefined();
  });

  it('banco recusando (rascunho, outra pessoa) vira mensagem genérica', async () => {
    expect(await acceptPolicy(ID, fakeRepo(false).repo)).toEqual({
      status: 'error',
      message: PROFILE_MESSAGES.consentFailed,
    });
  });
});
