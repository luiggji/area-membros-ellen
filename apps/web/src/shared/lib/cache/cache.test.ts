import { describe, expect, it } from 'vitest';

import { PUBLIC_REVALIDATE_SECONDS, publicFetch, revalidateProfile } from './policy';
import { handleRevalidate } from './revalidate-handler';

// Valor fictício sem cara de chave, para o gitleaks não confundir com segredo real.
const SECRET = 's'.repeat(40);

function post(body: unknown, token?: string) {
  return new Request('http://web/api/revalidate', {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function recorder() {
  const calls: [string, unknown][] = [];
  return { calls, revalidate: (tag: string, profile: unknown) => calls.push([tag, profile]) };
}

describe('política de cache', () => {
  it('preço e evento valem já no próximo acesso; catálogo atualiza em segundo plano', () => {
    expect(revalidateProfile('prices')).toEqual({ expire: 0 });
    expect(revalidateProfile('events')).toEqual({ expire: 0 });
    expect(revalidateProfile('courses')).toBe('max');
  });

  it('publicFetch marca o dado com as tags e a rede de segurança', async () => {
    let init: unknown;
    await publicFetch('http://api/planos', ['prices'], async (_url, options) => {
      init = options;
      return new Response('[]');
    });
    expect(init).toEqual({ next: { tags: ['prices'], revalidate: PUBLIC_REVALIDATE_SECONDS } });
  });
});

describe('POST /api/revalidate', () => {
  it('revalida as tags pedidas, sem repetir, com o perfil de cada uma', async () => {
    const { calls, revalidate } = recorder();
    const response = await handleRevalidate(
      post({ tags: ['prices', 'courses', 'prices'] }, SECRET),
      {
        secret: SECRET,
        revalidate,
      },
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ revalidated: ['prices', 'courses'] });
    expect(calls).toEqual([
      ['prices', { expire: 0 }],
      ['courses', 'max'],
    ]);
  });

  it('sem segredo configurado, o endpoint fica desligado (503)', async () => {
    const response = await handleRevalidate(post({ tags: ['prices'] }, SECRET), {
      secret: undefined,
      revalidate: () => undefined,
    });
    expect(response.status).toBe(503);
  });

  it('segredo ausente ou errado responde 401 e não revalida nada', async () => {
    for (const token of [undefined, 'errado']) {
      const { calls, revalidate } = recorder();
      const response = await handleRevalidate(post({ tags: ['prices'] }, token), {
        secret: SECRET,
        revalidate,
      });
      expect(response.status).toBe(401);
      expect(calls).toHaveLength(0);
    }
  });

  it('corpo inválido ou tag desconhecida responde 400', async () => {
    for (const body of ['não é json', { tags: [] }, { tags: ['users'] }]) {
      const response = await handleRevalidate(post(body, SECRET), {
        secret: SECRET,
        revalidate: () => undefined,
      });
      expect(response.status).toBe(400);
    }
  });
});
