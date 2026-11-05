import { describe, expect, it } from 'vitest';

import { supabaseKeyKind } from '../src/supabase-keys.js';

/** JWTs fictícios no formato das chaves legadas: só o payload (base64url) importa aqui. */
const fakeJwt = (payload: string) => `eyJhbGciOiJIUzI1NiJ9.${payload}.assinatura-ficticia`;
const anon = fakeJwt('eyJyb2xlIjoiYW5vbiIsInJlZiI6ImFiYyJ9'); // {"role":"anon","ref":"abc"}
const serviceRole = fakeJwt('eyJyb2xlIjoic2VydmljZV9yb2xlIiwicmVmIjoiYWJjIn0'); // {"role":"service_role","ref":"abc"}
const authenticated = fakeJwt('eyJyb2xlIjoiYXV0aGVudGljYXRlZCJ9'); // {"role":"authenticated"}

describe('supabaseKeyKind', () => {
  it('reconhece as chaves públicas (anon e publishable)', () => {
    expect(supabaseKeyKind(anon)).toBe('public');
    expect(supabaseKeyKind('sb_publishable_ficticia')).toBe('public');
  });

  it('reconhece as chaves secretas (service_role e secret)', () => {
    expect(supabaseKeyKind(serviceRole)).toBe('secret');
    expect(supabaseKeyKind('sb_secret_ficticia')).toBe('secret');
  });

  it('não adivinha formatos desconhecidos', () => {
    expect(supabaseKeyKind('qualquer-coisa')).toBe('unknown');
    expect(supabaseKeyKind('a.b.c')).toBe('unknown');
    expect(supabaseKeyKind(authenticated)).toBe('unknown');
  });
});
