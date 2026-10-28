/**
 * Arquivos privados no Storage (CF-162). Fonte única do bucket de materiais: o script de
 * provisionamento (`pnpm storage:setup`), a validação de upload da API e o `accept` dos formulários
 * leem daqui. Bucket sempre privado; download só por link assinado de curta duração.
 */
export const MATERIALS_BUCKET = {
  id: 'materiais',
  maxBytes: 25 * 1024 * 1024,
  /** Tipo → extensões aceitas. */
  types: {
    'application/pdf': ['pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx'],
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['xlsx'],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['pptx'],
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
  },
} as const;

export type MaterialMimeType = keyof typeof MATERIALS_BUCKET.types;

/** Validade do link de download: curta, só o tempo de começar a baixar. */
export const DOWNLOAD_URL_TTL_SECONDS = 60;
