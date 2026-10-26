import { describe, expect, it } from '@jest/globals';

import { assuranceLevelOf } from './supabase-identity';

/** Token fictício: só o payload importa (a assinatura já foi validada pelo Auth antes). */
const token = (payload: object) =>
  ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join(
    '.',
  );

describe('assuranceLevelOf (CF-034)', () => {
  it('reconhece sessão com segundo fator verificado', () => {
    expect(assuranceLevelOf(token({ sub: 'x', aal: 'aal2' }))).toBe('aal2');
  });

  it('qualquer outra coisa conta como aal1 (nunca eleva por engano)', () => {
    expect(assuranceLevelOf(token({ sub: 'x', aal: 'aal1' }))).toBe('aal1');
    expect(assuranceLevelOf(token({ sub: 'x' }))).toBe('aal1');
    expect(assuranceLevelOf(token({ sub: 'x', aal: 'AAL2' }))).toBe('aal1');
    expect(assuranceLevelOf('nao-e-jwt')).toBe('aal1');
    expect(assuranceLevelOf('a.%%%.c')).toBe('aal1');
  });
});
