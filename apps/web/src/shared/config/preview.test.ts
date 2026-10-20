import { describe, expect, it } from 'vitest';

import { isPreviewEnabled } from './preview';

describe('isPreviewEnabled', () => {
  it('liga em desenvolvimento local', () => {
    expect(isPreviewEnabled({ NODE_ENV: 'development' })).toBe(true);
  });

  it('fica desligado em produção sem opt-in explícito', () => {
    expect(isPreviewEnabled({ NODE_ENV: 'production' })).toBe(false);
  });

  it('liga em staging só com ENABLE_PREVIEW_ROUTES=true', () => {
    expect(isPreviewEnabled({ NODE_ENV: 'production', ENABLE_PREVIEW_ROUTES: 'true' })).toBe(true);
  });

  it('ENABLE_PREVIEW_ROUTES=false desliga até em desenvolvimento', () => {
    expect(isPreviewEnabled({ NODE_ENV: 'development', ENABLE_PREVIEW_ROUTES: 'false' })).toBe(
      false,
    );
  });
});
