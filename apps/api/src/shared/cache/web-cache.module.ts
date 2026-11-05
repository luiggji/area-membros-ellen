import { CacheTag } from '@caixa-forte/contracts';
import { Global, Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Env } from '../config/env';

/**
 * Porta para avisar o web que um dado público mudou (CF-163): preço (CF-041), evento/lote
 * (CF-060/061), catálogo (CF-080). Chamar depois de persistir a mudança.
 */
export interface WebCache {
  revalidate(tags: CacheTag[]): Promise<void>;
}

export const WEB_CACHE = Symbol('WEB_CACHE');

type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export class HttpWebCache implements WebCache {
  constructor(
    private readonly url: string,
    private readonly secret: string,
    private readonly fetchFn: FetchLike = fetch,
  ) {}

  async revalidate(tags: CacheTag[]): Promise<void> {
    const response = await this.fetchFn(this.url, {
      method: 'POST',
      headers: { authorization: `Bearer ${this.secret}`, 'content-type': 'application/json' },
      body: JSON.stringify({ tags }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`revalidação do web falhou: HTTP ${response.status}`);
  }
}

/** Dev sem web configurado: só avisa. As páginas ainda expiram pela rede de segurança (1h). */
export class UnconfiguredWebCache implements WebCache {
  private readonly logger = new Logger('WebCache');

  async revalidate(tags: CacheTag[]): Promise<void> {
    this.logger.warn(`revalidação não configurada; ignorando: ${tags.join(', ')}`);
  }
}

@Global()
@Module({
  providers: [
    {
      provide: WEB_CACHE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): WebCache => {
        const url = config.get('WEB_REVALIDATE_URL', { infer: true });
        const secret = config.get('REVALIDATE_SECRET', { infer: true });
        return url && secret ? new HttpWebCache(url, secret) : new UnconfiguredWebCache();
      },
    },
  ],
  exports: [WEB_CACHE],
})
export class WebCacheModule {}
