/**
 * Regra de upload de arquivos privados (CF-162): o tipo declarado precisa estar na lista do bucket,
 * a extensão do nome precisa ser do mesmo tipo, os primeiros bytes precisam ser os desse formato
 * (não basta renomear um executável para .pdf) e o tamanho tem limite. Puro: recebe a lista e o
 * limite como dados.
 */
export interface BucketRules {
  maxBytes: number;
  types: Readonly<Record<string, readonly string[]>>;
}

export interface UploadCandidate {
  fileName: string;
  mimeType: string;
  bytes: Uint8Array;
}

export type UploadCheck =
  | { ok: true; extension: string }
  | {
      ok: false;
      reason:
        'empty' | 'too_large' | 'type_not_allowed' | 'extension_mismatch' | 'content_mismatch';
    };

const startsWith = (bytes: Uint8Array, signature: number[]) =>
  signature.every((byte, index) => bytes[index] === byte);

/** Assinatura dos formatos aceitos. Office moderno (docx/xlsx/pptx) é um ZIP. */
const SIGNATURES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46, 0x2d], // %PDF-
  zip: [0x50, 0x4b, 0x03, 0x04], // PK..
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  jpeg: [0xff, 0xd8, 0xff],
};

const FORMAT_OF_EXTENSION: Record<string, keyof typeof SIGNATURES> = {
  pdf: 'pdf',
  docx: 'zip',
  xlsx: 'zip',
  pptx: 'zip',
  png: 'png',
  jpg: 'jpeg',
  jpeg: 'jpeg',
};

export function extensionOf(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match?.[1]?.toLowerCase() ?? '';
}

export function checkUpload(rules: BucketRules, file: UploadCandidate): UploadCheck {
  if (file.bytes.length === 0) return { ok: false, reason: 'empty' };
  if (file.bytes.length > rules.maxBytes) return { ok: false, reason: 'too_large' };
  const extensions = rules.types[file.mimeType];
  if (!extensions) return { ok: false, reason: 'type_not_allowed' };
  const extension = extensionOf(file.fileName);
  if (!extensions.includes(extension)) return { ok: false, reason: 'extension_mismatch' };
  const format = FORMAT_OF_EXTENSION[extension];
  if (!format || !startsWith(file.bytes, SIGNATURES[format]!)) {
    return { ok: false, reason: 'content_mismatch' };
  }
  return { ok: true, extension };
}

/**
 * Chave do objeto no bucket, gerada no servidor: id aleatório + extensão validada. O nome enviado
 * nunca entra no caminho (sem path traversal, sem dado pessoal no nome do objeto).
 */
export function storageKey(id: string, extension: string): string {
  return `${id}.${extension}`;
}

/**
 * Nome sugerido no download: o nome original sem caracteres de controle, barras e aspas, com no
 * máximo 120 caracteres, preservando a extensão validada.
 */
export function downloadName(fileName: string, extension: string): string {
  const base = fileName
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[\u0000-\u001f\u007f/\\"<>:|?*]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return `${base || 'arquivo'}.${extension}`;
}
