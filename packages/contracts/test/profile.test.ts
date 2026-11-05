import { describe, expect, it } from 'vitest';

import {
  onboardingGoalSchema,
  onboardingLocationSchema,
  onboardingStageSchema,
  profileInputSchema,
} from '../src/profile.js';

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

describe('etapas do onboarding', () => {
  it('exige cada etapa preenchida, com mensagem em português', () => {
    const stage = onboardingStageSchema.safeParse({ professional_stage: '' });
    expect(stage.success ? '' : stage.error.issues[0]?.message).toBe('Escolha uma opção.');
    const goal = onboardingGoalSchema.safeParse({ main_goal: 'enriquecer' });
    expect(goal.success ? '' : goal.error.issues[0]?.message).toBe('Escolha um objetivo.');
    expect(onboardingLocationSchema.safeParse({ city: '', state: 'SP' }).success).toBe(false);
  });

  it('aceita etapas válidas', () => {
    expect(onboardingStageSchema.parse({ professional_stage: 'equipe' })).toEqual({
      professional_stage: 'equipe',
    });
    expect(onboardingLocationSchema.parse({ city: ' Ourinhos ', state: 'SP' })).toEqual({
      city: 'Ourinhos',
      state: 'SP',
    });
    expect(onboardingGoalSchema.parse({ main_goal: 'planejar' })).toEqual({
      main_goal: 'planejar',
    });
  });
});
