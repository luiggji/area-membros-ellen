import { describe, expect, it } from 'vitest';

import { nextOnboardingStep, resolveOnboardingStep } from '../domain/onboarding';
import { type OnboardingPatch, saveOnboardingStep } from './onboarding-use-cases';

const empty = {
  professional_stage: null,
  city: null,
  state: null,
  main_goal: null,
  onboarding_completed_at: null,
};
const DONE = '2026-10-23T00:00:00Z';

describe('retomada do onboarding', () => {
  it('retoma na primeira etapa pendente', () => {
    expect(nextOnboardingStep(null)).toBe('carreira');
    expect(nextOnboardingStep(empty)).toBe('carreira');
    expect(nextOnboardingStep({ ...empty, professional_stage: 'solo' })).toBe('local');
    expect(nextOnboardingStep({ ...empty, professional_stage: 'solo', city: 'Ourinhos' })).toBe(
      'local',
    );
    expect(
      nextOnboardingStep({ ...empty, professional_stage: 'solo', city: 'Ourinhos', state: 'SP' }),
    ).toBe('objetivo');
    expect(nextOnboardingStep({ ...empty, onboarding_completed_at: DONE })).toBeNull();
  });

  it('?etapa= volta para etapa já alcançada, mas não pula adiante', () => {
    const atLocal = { ...empty, professional_stage: 'solo' };
    expect(resolveOnboardingStep('carreira', atLocal)).toBe('carreira');
    expect(resolveOnboardingStep('objetivo', atLocal)).toBe('local');
    expect(resolveOnboardingStep('inventada', atLocal)).toBe('local');
  });

  it('concluído: permite revisar qualquer etapa; sem pedido, não há etapa a mostrar', () => {
    const done = { ...empty, onboarding_completed_at: DONE };
    expect(resolveOnboardingStep('objetivo', done)).toBe('objetivo');
    expect(resolveOnboardingStep(undefined, done)).toBeNull();
  });
});

function fakeRepo(ok = true) {
  const patches: OnboardingPatch[] = [];
  const repo = {
    saveOnboarding: async (patch: OnboardingPatch) => {
      patches.push(patch);
      return ok;
    },
  };
  return { patches, repo };
}

describe('gravação das etapas', () => {
  it('cada etapa grava só os próprios campos e segue para a próxima', async () => {
    const { repo, patches } = fakeRepo();
    expect(
      await saveOnboardingStep({ step: 'carreira', professional_stage: 'iniciante' }, repo),
    ).toEqual({ status: 'redirect', to: '/app/jornada?etapa=local' });
    expect(
      await saveOnboardingStep({ step: 'local', city: 'Ourinhos', state: 'SP' }, repo),
    ).toEqual({ status: 'redirect', to: '/app/jornada?etapa=objetivo' });
    expect(patches).toEqual([
      { professional_stage: 'iniciante' },
      { city: 'Ourinhos', state: 'SP' },
    ]);
  });

  it('a última etapa conclui o onboarding e volta ao início', async () => {
    const { repo, patches } = fakeRepo();
    const result = await saveOnboardingStep(
      { step: 'objetivo', main_goal: 'conectar' },
      repo,
      () => new Date('2026-10-23T12:00:00Z'),
    );
    expect(result).toEqual({ status: 'redirect', to: '/app' });
    expect(patches).toEqual([
      { main_goal: 'conectar', onboarding_completed_at: '2026-10-23T12:00:00.000Z' },
    ]);
  });

  it('nunca grava opt-in do diretório nem outros campos enviados', async () => {
    const { repo, patches } = fakeRepo();
    await saveOnboardingStep(
      { step: 'carreira', professional_stage: 'solo', directory_opt_in: 'true', id: 'outra' },
      repo,
    );
    expect(patches).toEqual([{ professional_stage: 'solo' }]);
  });

  it('etapa inválida ou dado inválido não grava nada', async () => {
    const { repo, patches } = fakeRepo();
    expect(await saveOnboardingStep({ step: 'pular' }, repo)).toMatchObject({ status: 'error' });
    expect(await saveOnboardingStep({ step: 'local', city: '', state: 'XX' }, repo)).toMatchObject({
      status: 'error',
      fieldErrors: { city: 'Informe sua cidade.', state: 'Escolha uma UF da lista.' },
    });
    expect(patches).toEqual([]);
  });
});
