import { describe, expect, it } from 'vitest';

import { isPrototypeEnabled } from './prototype';

describe('isPrototypeEnabled', () => {
  it('liga em desenvolvimento local', () => {
    expect(isPrototypeEnabled({ NODE_ENV: 'development' })).toBe(true);
  });

  it('fica desligado em produção sem opt-in explícito', () => {
    expect(isPrototypeEnabled({ NODE_ENV: 'production' })).toBe(false);
  });

  it('liga em staging só com ENABLE_PROTOTYPE=true', () => {
    expect(isPrototypeEnabled({ NODE_ENV: 'production', ENABLE_PROTOTYPE: 'true' })).toBe(true);
  });

  it('ENABLE_PROTOTYPE=false desliga até em desenvolvimento', () => {
    expect(isPrototypeEnabled({ NODE_ENV: 'development', ENABLE_PROTOTYPE: 'false' })).toBe(false);
  });
});
