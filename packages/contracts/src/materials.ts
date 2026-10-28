import { z } from 'zod';

import { MATERIALS_BUCKET } from './storage.js';

/** Tipo do material para quem vê, a partir do tipo do arquivo (CF-085). */
export const MATERIAL_KINDS: Record<keyof typeof MATERIALS_BUCKET.types, string> = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Documento',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Planilha',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'Apresentação',
  'image/png': 'Imagem',
  'image/jpeg': 'Imagem',
};

const mimeTypes = Object.keys(MATERIALS_BUCKET.types) as [string, ...string[]];
const mimeSchema = z.enum(mimeTypes, { error: 'Tipo de arquivo não aceito.' });
const dateOnly = z.iso.date({ error: 'Data inválida.' });

/** Metadados que a owner preenche (PRD CF-06: assunto, versão, licença, revisão, curso). */
const metadataShape = {
  title: z
    .string()
    .trim()
    .min(2, 'Título com pelo menos 2 caracteres.')
    .max(160, 'Título com até 160 caracteres.'),
  description: z.string().trim().max(600, 'Descrição com até 600 caracteres.'),
  subject: z
    .string()
    .trim()
    .min(2, 'Assunto com pelo menos 2 caracteres.')
    .max(60, 'Assunto com até 60 caracteres.'),
  version: z.string().trim().min(1, 'Informe a versão.').max(20, 'Versão com até 20 caracteres.'),
  license: z.string().trim().max(120, 'Licença com até 120 caracteres.'),
  revisedOn: dateOnly.nullable(),
  courseId: z.uuid({ error: 'Curso inválido.' }).nullable(),
};

/** 1º passo do envio: a API valida nome, tipo e tamanho e devolve um link de envio de uso único. */
export const prepareMaterialUploadRequestSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, 'Escolha um arquivo.')
    .max(160, 'Nome do arquivo muito longo.'),
  mimeType: mimeSchema,
  sizeBytes: z
    .number()
    .int()
    .min(1, 'O arquivo está vazio.')
    .max(MATERIALS_BUCKET.maxBytes, 'Arquivo acima de 25 MB.'),
});
export type PrepareMaterialUploadRequest = z.infer<typeof prepareMaterialUploadRequestSchema>;

export const prepareMaterialUploadResponseSchema = z.object({
  key: z.string(),
  uploadUrl: z.url(),
});
export type PrepareMaterialUploadResponse = z.infer<typeof prepareMaterialUploadResponseSchema>;

/** 2º passo: depois do envio, a API confere o arquivo no bucket e cria o material (rascunho). */
export const createMaterialRequestSchema = z.object({
  key: z.string().regex(/^[0-9a-f-]{36}\.[a-z]{3,4}$/, 'Envio inválido. Tente de novo.'),
  fileName: prepareMaterialUploadRequestSchema.shape.fileName,
  ...metadataShape,
});
export type CreateMaterialRequest = z.infer<typeof createMaterialRequestSchema>;

export const updateMaterialStatusRequestSchema = z.object({
  status: z.enum(['draft', 'published'], { error: 'Escolha o estado.' }),
});
export type UpdateMaterialStatusRequest = z.infer<typeof updateMaterialStatusRequestSchema>;

const materialOut = {
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  subject: z.string(),
  kind: z.string(),
  extension: z.string(),
  sizeBytes: z.number().int(),
  version: z.string(),
  license: z.string().nullable(),
  revisedOn: z.string().nullable(),
  course: z.object({ slug: z.string(), title: z.string() }).nullable(),
};

/** Cofre do membro: só publicados; `canDownload` = acesso pago vigente (CF-046). */
export const memberMaterialsSchema = z.object({
  canDownload: z.boolean(),
  materials: z.array(z.object({ ...materialOut, publishedAt: z.string() })),
});
export type MemberMaterials = z.infer<typeof memberMaterialsSchema>;

export const adminMaterialSchema = z.object({
  ...materialOut,
  fileName: z.string(),
  status: z.enum(['draft', 'published']),
  publishedAt: z.string().nullable(),
});
export type AdminMaterial = z.infer<typeof adminMaterialSchema>;
export const adminMaterialsSchema = z.object({ materials: z.array(adminMaterialSchema) });

export const materialDownloadSchema = z.object({ url: z.url(), expiresAt: z.string() });
export type MaterialDownload = z.infer<typeof materialDownloadSchema>;
