import { afterEach, describe, expect, it, vi } from 'vitest';

import { featureFlags, featureFlagsStatus, isFeatureEnabled } from './feature-flags';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('feature flags do web', () => {
  it('segue o ambiente e o override, como na API', () => {
    expect(isFeatureEnabled('community', { APP_ENV: 'development' })).toBe(true);
    expect(isFeatureEnabled('community', { APP_ENV: 'staging' })).toBe(false);
    expect(
      isFeatureEnabled('community', { APP_ENV: 'production', FEATURE_FLAGS: 'community' }),
    ).toBe(true);
  });

  it('sem APP_ENV segue o NODE_ENV: liga em `next dev` (como a API), desliga no build', () => {
    expect(isFeatureEnabled('community', { NODE_ENV: 'development' })).toBe(true);
    expect(Object.values(featureFlags({ NODE_ENV: 'production' })).some(Boolean)).toBe(false);
    expect(Object.values(featureFlags({})).some(Boolean)).toBe(false);
  });

  it('APP_ENV inválido nunca liga módulo não lançado', () => {
    expect(
      Object.values(featureFlags({ APP_ENV: 'qualquer', NODE_ENV: 'development' })).some(Boolean),
    ).toBe(false);
  });

  it('recusa rodar no browser', () => {
    vi.stubGlobal('window', {});
    expect(() => featureFlags({ APP_ENV: 'development' })).toThrow(
      /só podem ser lidas no servidor/,
    );
  });

  it('o status mostra erro de configuração em vez de lançar', () => {
    const status = featureFlagsStatus({ APP_ENV: 'staging', FEATURE_FLAGS: 'comunity' });
    expect(status).toMatchObject({ ok: false });
    expect(status.ok ? '' : status.error).toMatch(/flag desconhecida "comunity"/);
  });
});
