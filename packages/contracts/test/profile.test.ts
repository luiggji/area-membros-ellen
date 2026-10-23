import { describe, expect, it } from 'vitest';

import { profileInputSchema } from '../src/profile.js';

describe('profileInputSchema', () => {
  it('normaliza campos opcionais vazios para null', () => {
    expect(
      profileInputSchema.parse({
        name: ' Ana ',
        city: '  ',
        state: '',
        professional_stage: '',
        bio: '',
      }),
    ).toEqual({ name: 'Ana', city: null, state: null, professional_stage: null, bio: null });
  });

  it('aceita um perfil completo', () => {
    const profile = {
      name: 'Ana Teste',
      city: 'Ourinhos',
      state: 'SP',
      professional_stage: 'solo',
      bio: 'Advocacia de família.',
    };
    expect(profileInputSchema.parse(profile)).toEqual(profile);
  });

  it('recusa UF e estágio fora da lista e textos fora dos limites', () => {
    expect(
      profileInputSchema.safeParse({
        name: 'Ana',
        city: '',
        state: 'XX',
        professional_stage: '',
        bio: '',
      }).success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({
        name: 'Ana',
        city: '',
        state: '',
        professional_stage: 'socio',
        bio: '',
      }).success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({
        name: 'A',
        city: '',
        state: '',
        professional_stage: '',
        bio: '',
      }).success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({
        name: 'Ana',
        city: 'X',
        state: '',
        professional_stage: '',
        bio: '',
      }).success,
    ).toBe(false);
    expect(
      profileInputSchema.safeParse({
        name: 'Ana',
        city: '',
        state: '',
        professional_stage: '',
        bio: 'x'.repeat(501),
      }).success,
    ).toBe(false);
  });
});
