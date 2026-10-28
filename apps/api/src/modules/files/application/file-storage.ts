import { DOWNLOAD_URL_TTL_SECONDS, MATERIALS_BUCKET } from '@caixa-forte/contracts';

import { checkUpload, downloadName, storageKey, UploadCandidate } from '../domain/upload-policy';

/** Armazenamento de arquivos privados (CF-162). Nada aqui gera URL pública. */
export interface FileStorage {
  put(key: string, bytes: Uint8Array, mimeType: string): Promise<void>;
  /** Link assinado que expira em `ttlSeconds`; `downloadAs` vira o nome do arquivo baixado. */
  signedUrl(key: string, ttlSeconds: number, downloadAs: string): Promise<string>;
  remove(key: string): Promise<void>;
}
export const FILE_STORAGE = Symbol('FILE_STORAGE');

export type StoredFile = { key: string; extension: string; sizeBytes: number; mimeType: string };
export type StoreRejection = Exclude<ReturnType<typeof checkUpload>, { ok: true }>['reason'];

/**
 * Guarda um material depois de passar na regra de upload. A chave vem de `newId` (gerado no
 * servidor); o nome enviado só serve para conferir a extensão.
 */
export async function storeMaterial(
  storage: FileStorage,
  file: UploadCandidate,
  newId: () => string,
): Promise<StoredFile | { rejected: StoreRejection }> {
  const check = checkUpload(MATERIALS_BUCKET, file);
  if (!check.ok) return { rejected: check.reason };
  const key = storageKey(newId(), check.extension);
  await storage.put(key, file.bytes, file.mimeType);
  return { key, extension: check.extension, sizeBytes: file.bytes.length, mimeType: file.mimeType };
}

/** Link de download de curta duração (60 s), com o nome original saneado. */
export async function materialDownload(
  storage: FileStorage,
  file: { key: string; fileName: string; extension: string },
  now: Date,
): Promise<{ url: string; expiresAt: string }> {
  const url = await storage.signedUrl(
    file.key,
    DOWNLOAD_URL_TTL_SECONDS,
    downloadName(file.fileName, file.extension),
  );
  return {
    url,
    expiresAt: new Date(now.getTime() + DOWNLOAD_URL_TTL_SECONDS * 1000).toISOString(),
  };
}
