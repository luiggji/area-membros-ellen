import { MATERIALS_BUCKET } from '@caixa-forte/contracts';

import { SupabaseAdmin } from '../../../shared/supabase/supabase.module';
import { FileStorage, StoredObject } from '../application/file-storage';

/** Bytes lidos do começo do arquivo para conferir o formato (as assinaturas têm até 8). */
const HEAD_BYTES = 16;

/**
 * Bucket privado de materiais no Supabase Storage, com a chave de serviço (só no servidor). O
 * bucket também barra tipo e tamanho por conta própria (provisionado por `pnpm storage:setup`).
 * Erros saem só com o nome: a mensagem pode trazer o caminho.
 */
export class SupabaseFileStorage implements FileStorage {
  constructor(
    private readonly client: SupabaseAdmin,
    private readonly bucket: string = MATERIALS_BUCKET.id,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}

  private get files() {
    return this.client.storage.from(this.bucket);
  }

  async uploadUrl(key: string): Promise<string> {
    // Sem upsert: a chave é nova, e um link vazado não sobrescreve arquivo existente.
    const { data, error } = await this.files.createSignedUploadUrl(key);
    if (error || !data)
      throw new Error(`storage: falha ao criar envio (${error?.name ?? 'vazio'})`);
    return data.signedUrl;
  }

  async inspect(key: string): Promise<StoredObject | null> {
    const { data: info, error } = await this.files.info(key);
    if (error || !info) return null;
    // Só o começo do arquivo, por um link assinado curto: não carrega 25 MB na memória da API.
    const head = await this.fetchFn(await this.signedUrl(key, 30, 'verificacao'), {
      headers: { Range: `bytes=0-${HEAD_BYTES - 1}` },
    });
    if (!head.ok) throw new Error(`storage: falha ao ler o arquivo (HTTP ${head.status})`);
    const bytes = new Uint8Array(await head.arrayBuffer()).subarray(0, HEAD_BYTES);
    return { sizeBytes: info.size ?? 0, mimeType: info.contentType ?? '', head: bytes };
  }

  async signedUrl(key: string, ttlSeconds: number, downloadAs: string): Promise<string> {
    const { data, error } = await this.files.createSignedUrl(key, ttlSeconds, {
      download: downloadAs,
    });
    if (error || !data) throw new Error(`storage: falha ao assinar (${error?.name ?? 'vazio'})`);
    return data.signedUrl;
  }

  async remove(key: string): Promise<void> {
    const { error } = await this.files.remove([key]);
    if (error) throw new Error(`storage: falha ao remover (${error.name})`);
  }
}

/** Dev sem Supabase: nenhuma operação finge sucesso. */
export class UnconfiguredFileStorage implements FileStorage {
  private fail(): never {
    throw new Error('Supabase não configurado: arquivos privados indisponíveis');
  }

  async uploadUrl(): Promise<string> {
    this.fail();
  }

  async inspect(): Promise<StoredObject | null> {
    this.fail();
  }

  async signedUrl(): Promise<string> {
    this.fail();
  }

  async remove(): Promise<void> {
    this.fail();
  }
}
