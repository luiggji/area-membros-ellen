import { describe, expect, it } from '@jest/globals';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { SupabaseFileStorage } from './supabase-file-storage';

const bucket = {
  info: async () => ({ data: { size: 1_000_000, contentType: 'application/pdf' }, error: null }),
  createSignedUrl: async () => ({
    data: { signedUrl: 'https://storage.test/assinado' },
    error: null,
  }),
};
const client = { storage: { from: () => bucket } } as unknown as SupabaseAdmin;

describe('Storage privado: conferência do arquivo enviado', () => {
  it('pede só o começo do arquivo e fica com 16 bytes, mesmo se vier o arquivo inteiro', async () => {
    const whole = new Uint8Array(1_000_000);
    whole.set([0x25, 0x50, 0x44, 0x46, 0x2d]);
    const requests: (RequestInit | undefined)[] = [];
    const fetchFn = (async (_url: string, init?: RequestInit) => {
      requests.push(init);
      return new Response(whole, { status: 200 });
    }) as unknown as typeof fetch;

    const stored = await new SupabaseFileStorage(client, 'materiais', fetchFn).inspect('id.pdf');
    expect(requests[0]?.headers).toEqual({ Range: 'bytes=0-15' });
    expect(stored?.head.length).toBe(16);
    expect([...stored!.head.subarray(0, 5)]).toEqual([0x25, 0x50, 0x44, 0x46, 0x2d]);
    expect(stored).toMatchObject({ sizeBytes: 1_000_000, mimeType: 'application/pdf' });
  });
});
