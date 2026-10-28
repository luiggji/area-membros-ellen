import { DOWNLOAD_URL_TTL_SECONDS, MATERIALS_BUCKET } from '@caixa-forte/contracts';

import {
  checkDeclared,
  checkUpload,
  DeclaredFile,
  downloadName,
  extensionOf,
  storageKey,
} from '../domain/upload-policy';

/** O que o Storage sabe de um arquivo enviado: tamanho, tipo gravado e os primeiros bytes. */
export interface StoredObject {
  sizeBytes: number;
  mimeType: string;
  head: Uint8Array;
}

/**
 * Armazenamento de arquivos privados (CF-162). Nada aqui gera URL pública: o envio é por link de
 * uso único e o download por link assinado de curta duração.
 */
export interface FileStorage {
  /** Link para o navegador enviar o arquivo direto ao bucket (sem passar pelo web nem pela API). */
  uploadUrl(key: string): Promise<string>;
  /** `null` = nada foi enviado com essa chave. */
  inspect(key: string): Promise<StoredObject | null>;
  /** Link assinado que expira em `ttlSeconds`; `downloadAs` vira o nome do arquivo baixado. */
  signedUrl(key: string, ttlSeconds: number, downloadAs: string): Promise<string>;
  remove(key: string): Promise<void>;
}
export const FILE_STORAGE = Symbol('FILE_STORAGE');

export type UploadRejection = Exclude<ReturnType<typeof checkUpload>, { ok: true }>['reason'];

/**
 * 1º passo do envio: confere nome, tipo e tamanho declarados e reserva uma chave gerada no servidor
 * (`newId`), com o link de envio. O nome enviado só serve para conferir a extensão.
 */
export async function prepareMaterialUpload(
  storage: FileStorage,
  file: DeclaredFile,
  newId: () => string,
): Promise<{ key: string; uploadUrl: string } | { rejected: UploadRejection }> {
  const check = checkDeclared(MATERIALS_BUCKET, file);
  if (!check.ok) return { rejected: check.reason };
  const key = storageKey(newId(), check.extension);
  return { key, uploadUrl: await storage.uploadUrl(key) };
}

/**
 * 2º passo: confere o que chegou de verdade ao bucket (tamanho, tipo gravado e assinatura do
 * formato). Recusado → o arquivo é apagado. `missing` = nada foi enviado com essa chave.
 */
export async function confirmMaterialUpload(
  storage: FileStorage,
  key: string,
  fileName: string,
): Promise<
  | { ok: true; sizeBytes: number; mimeType: string }
  | { rejected: UploadRejection | 'missing' | 'key_mismatch' }
> {
  if (extensionOf(key) !== extensionOf(fileName)) return { rejected: 'key_mismatch' };
  const stored = await storage.inspect(key);
  if (!stored) return { rejected: 'missing' };
  const check = checkUpload(MATERIALS_BUCKET, { fileName, ...stored });
  if (!check.ok) {
    await storage.remove(key);
    return { rejected: check.reason };
  }
  return { ok: true, sizeBytes: stored.sizeBytes, mimeType: stored.mimeType };
}

/** Link de download de curta duração (60 s), com o nome original saneado. */
export async function materialDownload(
  storage: FileStorage,
  file: { key: string; fileName: string },
  now: Date,
): Promise<{ url: string; expiresAt: string }> {
  const url = await storage.signedUrl(
    file.key,
    DOWNLOAD_URL_TTL_SECONDS,
    downloadName(file.fileName, extensionOf(file.key)),
  );
  return {
    url,
    expiresAt: new Date(now.getTime() + DOWNLOAD_URL_TTL_SECONDS * 1000).toISOString(),
  };
}
