import { describe, expect, it } from 'vitest';

import { buildCsp, createNonce, isPrivatePath } from './csp';

const directive = (csp: string, name: string) =>
  csp.split('; ').find((part) => part.startsWith(`${name} `)) ?? '';

const base = {
  isDev: false,
  apiUrl: 'https://api.exemplo.test/api/v1',
  supabaseUrl: 'https://abcdefghijklmnopqrst.supabase.co',
};

describe('isPrivatePath', () => {
  it('reconhece /app e /admin com subrotas', () => {
    for (const path of ['/app', '/app/cursos', '/admin', '/admin/planos']) {
      expect(isPrivatePath(path), path).toBe(true);
    }
  });

  it('não confunde rotas públicas parecidas', () => {
    for (const path of ['/', '/apple-icon.png', '/application', '/administracao', '/design']) {
      expect(isPrivatePath(path), path).toBe(false);
    }
  });
});

describe('buildCsp', () => {
  it('área privada: nonce + strict-dynamic, sem unsafe-inline nos scripts', () => {
    const script = directive(buildCsp({ ...base, nonce: 'abc123' }), 'script-src');
    expect(script).toBe("script-src 'self' 'nonce-abc123' 'strict-dynamic'");
  });

  it('páginas públicas: política estática, sem nonce', () => {
    const script = directive(buildCsp(base), 'script-src');
    expect(script).toBe("script-src 'self' 'unsafe-inline'");
  });

  it('libera a API e o Supabase (REST e Realtime) no connect-src, só pela origem', () => {
    expect(directive(buildCsp(base), 'connect-src')).toBe(
      "connect-src 'self' https://api.exemplo.test https://abcdefghijklmnopqrst.supabase.co wss://abcdefghijklmnopqrst.supabase.co",
    );
  });

  it('sem Supabase configurado, connect-src fica só com a app e a API', () => {
    const csp = buildCsp({ ...base, supabaseUrl: undefined });
    expect(directive(csp, 'connect-src')).toBe("connect-src 'self' https://api.exemplo.test");
  });

  it('unsafe-eval só em dev; upgrade-insecure-requests só fora de dev', () => {
    expect(buildCsp({ ...base, isDev: true })).toContain("'unsafe-eval'");
    expect(buildCsp({ ...base, isDev: true })).not.toContain('upgrade-insecure-requests');
    expect(buildCsp(base)).not.toContain("'unsafe-eval'");
    expect(buildCsp(base)).toContain('upgrade-insecure-requests');
  });

  it('mantém as proteções de enquadramento, objetos e formulários', () => {
    const csp = buildCsp(base);
    for (const part of ["frame-ancestors 'none'", "object-src 'none'", "form-action 'self'"]) {
      expect(csp).toContain(part);
    }
  });
});

describe('createNonce', () => {
  it('gera valores diferentes a cada chamada', () => {
    expect(createNonce()).not.toBe(createNonce());
  });
});
