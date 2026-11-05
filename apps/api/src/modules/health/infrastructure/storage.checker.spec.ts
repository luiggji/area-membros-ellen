import { describe, expect, it } from '@jest/globals';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { StorageChecker } from './storage.checker';

const clientWith = (result: { data: unknown; error: unknown }) =>
  ({ storage: { getBucket: async () => result } }) as unknown as SupabaseAdmin;

describe('check do storage privado', () => {
  it('saudável só com o bucket existente e privado', async () => {
    expect(
      await new StorageChecker(clientWith({ data: { public: false }, error: null })).check(),
    ).toEqual({
      name: 'storage',
      healthy: true,
    });
    expect(
      (await new StorageChecker(clientWith({ data: { public: true }, error: null })).check())
        .healthy,
    ).toBe(false);
    expect(
      (
        await new StorageChecker(
          clientWith({ data: null, error: { name: 'StorageApiError' } }),
        ).check()
      ).healthy,
    ).toBe(false);
  });
});
