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

/** O que se sabe antes do envio: nome, tipo declarado e tamanho. */
export interface DeclaredFile {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

/** Depois do envio: o tamanho real e os primeiros bytes (bastam 16 para a assinatura). */
export interface UploadCandidate extends DeclaredFile {
  head: Uint8Array;
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

/** Antes do envio: tamanho, tipo da lista e extensão do mesmo tipo. */
export function checkDeclared(rules: BucketRules, file: DeclaredFile): UploadCheck {
  if (file.sizeBytes <= 0) return { ok: false, reason: 'empty' };
  if (file.sizeBytes > rules.maxBytes) return { ok: false, reason: 'too_large' };
  const extensions = rules.types[file.mimeType];
  if (!extensions) return { ok: false, reason: 'type_not_allowed' };
  const extension = extensionOf(file.fileName);
  if (!extensions.includes(extension)) return { ok: false, reason: 'extension_mismatch' };
  return { ok: true, extension };
}

/** Depois do envio: tudo o que vale antes e, além disso, os primeiros bytes do formato. */
export function checkUpload(rules: BucketRules, file: UploadCandidate): UploadCheck {
  const declared = checkDeclared(rules, file);
  if (!declared.ok) return declared;
  const format = FORMAT_OF_EXTENSION[declared.extension];
  if (!format || !startsWith(file.head, SIGNATURES[format]!)) {
    return { ok: false, reason: 'content_mismatch' };
  }
  return declared;
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
const UNSAFE_IN_NAME = new Set(['/', '\\', '"', '<', '>', ':', '|', '?', '*']);
const isUnsafeChar = (char: string) => {
  const code = char.charCodeAt(0);
  return code < 0x20 || code === 0x7f || UNSAFE_IN_NAME.has(char);
};

export function downloadName(fileName: string, extension: string): string {
  const base = [...fileName.replace(/\.[a-z0-9]+$/i, '')]
    .map((char) => (isUnsafeChar(char) ? ' ' : char))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return `${base || 'arquivo'}.${extension}`;
}
