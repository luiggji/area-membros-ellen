import { describe, expect, it } from '@jest/globals';

import { HmacMediaTokens } from './hmac-media-tokens';

const tokens = new HmacMediaTokens(Buffer.alloc(32, 7));
const now = new Date('2026-10-28T12:00:00.000Z');
const later = new Date('2026-10-28T12:30:00.000Z');
const claims = { mediaRef: 'video-1', viewerId: 'membro-1' };

describe('token de mídia assinado', () => {
  it('válido até a validade; depois, vencido', () => {
    const token = tokens.issue(claims, later);
    expect(tokens.verify(token, now)).toEqual(claims);
    expect(tokens.verify(token, later)).toBe('expired');
  });

  it('adulterado, de outro segredo ou malformado: inválido', () => {
    const token = tokens.issue(claims, later);
    const [data, signature] = token.split('.');
    const forged = Buffer.from(
      JSON.stringify({ r: 'outro-video', u: 'membro-1', e: later.getTime() }),
    ).toString('base64url');
    expect(tokens.verify(`${forged}.${signature}`, now)).toBe('invalid');
    expect(new HmacMediaTokens(Buffer.alloc(32, 8)).verify(token, now)).toBe('invalid');
    expect(tokens.verify(`${data}`, now)).toBe('invalid');
    expect(tokens.verify(`${data}.${signature}.x`, now)).toBe('invalid');
    expect(tokens.verify('...', now)).toBe('invalid');
  });
});
