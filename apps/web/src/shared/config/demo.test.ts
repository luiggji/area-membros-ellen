import { describe, expect, it } from 'vitest';

import { isDemoEnabled } from './demo';

describe('modo demonstração', () => {
  it('liga só com DEMO_MODE=true em development ou staging', () => {
    expect(isDemoEnabled({ DEMO_MODE: 'true', APP_ENV: 'staging' })).toBe(true);
    expect(isDemoEnabled({ DEMO_MODE: 'true', APP_ENV: 'development' })).toBe(true);
    expect(isDemoEnabled({ APP_ENV: 'staging' })).toBe(false);
    expect(isDemoEnabled({ DEMO_MODE: '1', APP_ENV: 'staging' })).toBe(false);
  });

  it('nunca em produção, nem com APP_ENV ausente ou inválido', () => {
    expect(isDemoEnabled({ DEMO_MODE: 'true', APP_ENV: 'production' })).toBe(false);
    expect(isDemoEnabled({ DEMO_MODE: 'true' })).toBe(false);
    expect(isDemoEnabled({ DEMO_MODE: 'true', APP_ENV: 'prod' })).toBe(false);
  });
});
