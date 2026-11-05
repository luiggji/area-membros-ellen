import { describe, expect, it } from 'vitest';

import { staticPrivateRoutes } from './check-private-dynamic.mjs';

describe('staticPrivateRoutes', () => {
  it('aponta rotas de /app e /admin pré-renderizadas', () => {
    const manifest = {
      routes: { '/': {}, '/app': {}, '/admin/planos': {}, '/apple-icon.png': {} },
    };
    expect(staticPrivateRoutes(manifest)).toEqual(['/app', '/admin/planos']);
  });

  it('passa quando só há rotas públicas estáticas', () => {
    expect(staticPrivateRoutes({ routes: { '/': {}, '/icon.png': {} } })).toEqual([]);
    expect(staticPrivateRoutes({})).toEqual([]);
  });
});
