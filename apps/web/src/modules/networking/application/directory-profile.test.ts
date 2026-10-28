import { describe, expect, it } from 'vitest';

import { directoryStatus, saveDirectoryProfile } from './directory-profile';

const POLICY = '7a8b9c0d-1e2f-4a3b-8c4d-5e6f7a8b9c0d';

describe('perfil público do diretório', () => {
  it('grava listas de áreas e links; erro por campo não grava nada', async () => {
    const saved: unknown[] = [];
    const repo = {
      save: async (input: unknown) => {
        saved.push(input);
        return true;
      },
    };
    expect(
      await saveDirectoryProfile(
        {
          displayName: 'Ana',
          city: '',
          state: 'PR',
          areas: 'Família, Sucessões',
          bio: '',
          links: '',
        },
        repo,
      ),
    ).toEqual({ status: 'success', message: 'Perfil público salvo.' });
    expect(saved[0]).toMatchObject({ areas: ['Família', 'Sucessões'], links: [], city: null });

    const refused = await saveDirectoryProfile(
      { displayName: 'Ana', links: 'javascript:alert(1)' },
      repo,
    );
    expect(refused).toMatchObject({ status: 'error', fieldErrors: { links: expect.any(String) } });
    expect(saved).toHaveLength(1);
  });

  it('situação: sem termo publicado fecha; sem perfil pede perfil; aceite ativo = no diretório', () => {
    expect(directoryStatus(null, true)).toEqual({ state: 'closed' });
    const policy = { id: POLICY, title: 'Termo do diretório', consent: null };
    expect(directoryStatus(policy, false)).toEqual({
      state: 'needs_profile',
      policyVersionId: POLICY,
    });
    expect(directoryStatus(policy, true)).toEqual({
      state: 'out',
      policyVersionId: POLICY,
      policyTitle: 'Termo do diretório',
    });
    expect(directoryStatus({ ...policy, consent: { id: 'c1' } }, true)).toEqual({
      state: 'in',
      consentId: 'c1',
      policyTitle: 'Termo do diretório',
    });
  });
});
