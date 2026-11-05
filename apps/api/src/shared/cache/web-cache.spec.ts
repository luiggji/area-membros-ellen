import { describe, expect, it } from '@jest/globals';

import { HttpWebCache } from './web-cache.module';

// Valor fictício sem cara de chave, para o gitleaks não confundir com segredo real.
const SECRET = 's'.repeat(40);

describe('HttpWebCache', () => {
  it('pede a revalidação ao web com o segredo e as tags', async () => {
    let request: { url: string; init: RequestInit } | undefined;
    const cache = new HttpWebCache('https://web.test/api/revalidate', SECRET, async (url, init) => {
      request = { url, init };
      return new Response('{}');
    });

    await cache.revalidate(['prices', 'events']);

    expect(request?.url).toBe('https://web.test/api/revalidate');
    expect(request?.init.method).toBe('POST');
    expect((request?.init.headers as Record<string, string>).authorization).toBe(
      `Bearer ${SECRET}`,
    );
    expect(JSON.parse(String(request?.init.body))).toEqual({ tags: ['prices', 'events'] });
  });

  it('falha alto quando o web recusa, sem ecoar o segredo', async () => {
    const cache = new HttpWebCache(
      'https://web.test/api/revalidate',
      SECRET,
      async () => new Response('{}', { status: 401 }),
    );
    await expect(cache.revalidate(['prices'])).rejects.toThrow('HTTP 401');
    await expect(cache.revalidate(['prices'])).rejects.not.toThrow(SECRET);
  });
});
