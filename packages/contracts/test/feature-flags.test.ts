import { describe, expect, it } from 'vitest';

import {
  featureFlagKeys,
  InvalidFeatureFlagsError,
  resolveFeatureFlags,
} from '../src/feature-flags.js';

describe('resolveFeatureFlags', () => {
  it('liga tudo em dev e desliga tudo em staging e produção por padrão', () => {
    expect(Object.values(resolveFeatureFlags('development')).every(Boolean)).toBe(true);
    expect(Object.values(resolveFeatureFlags('staging')).some(Boolean)).toBe(false);
    expect(Object.values(resolveFeatureFlags('production')).some(Boolean)).toBe(false);
  });

  it('liga flags específicas pelo override, sem tocar nas outras', () => {
    const state = resolveFeatureFlags('staging', 'community, events');
    expect(state.community).toBe(true);
    expect(state.events).toBe(true);
    expect(state.planning).toBe(false);
  });

  it('desliga com prefixo "-" (ex.: esconder um módulo em dev)', () => {
    const state = resolveFeatureFlags('development', '-planning');
    expect(state.planning).toBe(false);
    expect(state.community).toBe(true);
  });

  it('ignora espaços e vírgulas sobrando', () => {
    expect(resolveFeatureFlags('production', ' ,checkout, ').checkout).toBe(true);
  });

  it('recusa flag desconhecida, listando as válidas', () => {
    expect(() => resolveFeatureFlags('production', 'comunity')).toThrow(InvalidFeatureFlagsError);
    expect(() => resolveFeatureFlags('production', 'comunity')).toThrow(/learning/);
  });

  it('não aceita nomes herdados do Object (ex.: toString)', () => {
    expect(() => resolveFeatureFlags('production', 'toString')).toThrow(InvalidFeatureFlagsError);
  });

  it('o estado resolvido cobre exatamente o catálogo', () => {
    expect(Object.keys(resolveFeatureFlags('production')).sort()).toEqual(
      [...featureFlagKeys].sort(),
    );
  });
});
