import { createHmac, timingSafeEqual } from 'node:crypto';

import { MediaClaims, MediaTokens } from '../application/player';

const encode = (value: Buffer | string) => Buffer.from(value).toString('base64url');

/**
 * Token de mídia `<dados>.<assinatura>` (HMAC-SHA256, base64url): referência da mídia, quem pediu
 * e a validade. Adulterado → `invalid`; vencido → `expired`. Não carrega PII além do id interno.
 */
export class HmacMediaTokens implements MediaTokens {
  constructor(private readonly secret: Buffer) {}

  private sign(data: string): Buffer {
    return createHmac('sha256', this.secret).update(data).digest();
  }

  issue(claims: MediaClaims, expiresAt: Date): string {
    const data = encode(
      JSON.stringify({ r: claims.mediaRef, u: claims.viewerId, e: expiresAt.getTime() }),
    );
    return `${data}.${encode(this.sign(data))}`;
  }

  verify(token: string, now: Date): MediaClaims | 'expired' | 'invalid' {
    const [data, signature, ...rest] = token.split('.');
    if (!data || !signature || rest.length > 0) return 'invalid';
    const given = Buffer.from(signature, 'base64url');
    const expected = this.sign(data);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) return 'invalid';
    try {
      const { r, u, e } = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as {
        r?: unknown;
        u?: unknown;
        e?: unknown;
      };
      if (typeof r !== 'string' || typeof u !== 'string' || typeof e !== 'number') return 'invalid';
      return e <= now.getTime() ? 'expired' : { mediaRef: r, viewerId: u };
    } catch {
      return 'invalid';
    }
  }
}
