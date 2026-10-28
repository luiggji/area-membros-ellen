import { MATERIALS_BUCKET } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { FileStorage } from '../application/file-storage';

/**
 * Bucket privado de materiais no Supabase Storage, com a chave de serviço (só no servidor). O
 * bucket também barra tipo e tamanho por conta própria (provisionado por `pnpm storage:setup`).
 */
export class SupabaseFileStorage implements FileStorage {
  constructor(
    private readonly client: SupabaseAdmin,
    private readonly bucket: string = MATERIALS_BUCKET.id,
  ) {}

  async put(key: string, bytes: Uint8Array, mimeType: string): Promise<void> {
    const { error } = await this.client.storage
      .from(this.bucket)
      .upload(key, bytes, { contentType: mimeType, upsert: false, cacheControl: 'no-store' });
    // Só o nome do erro: a mensagem pode trazer o caminho.
    if (error) throw new Error(`storage: falha ao gravar (${error.name})`);
  }

  async signedUrl(key: string, ttlSeconds: number, downloadAs: string): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(key, ttlSeconds, { download: downloadAs });
    if (error || !data) throw new Error(`storage: falha ao assinar (${error?.name ?? 'vazio'})`);
    return data.signedUrl;
  }

  async remove(key: string): Promise<void> {
    const { error } = await this.client.storage.from(this.bucket).remove([key]);
    if (error) throw new Error(`storage: falha ao remover (${error.name})`);
  }
}

/** Dev sem Supabase: nenhuma operação finge sucesso. */
export class UnconfiguredFileStorage implements FileStorage {
  private fail(): never {
    throw new Error('Supabase não configurado: arquivos privados indisponíveis');
  }

  async put(): Promise<void> {
    this.fail();
  }

  async signedUrl(): Promise<string> {
    this.fail();
  }

  async remove(): Promise<void> {
    this.fail();
  }
}
