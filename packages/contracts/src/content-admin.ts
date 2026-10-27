import { z } from 'zod';

/** Estados de publicação do conteúdo (espelha o check das tabelas do CF-080). */
export const CONTENT_STATUSES = {
  draft: 'Rascunho',
  scheduled: 'Agendado',
  published: 'Publicado',
} as const;
export type ContentStatus = keyof typeof CONTENT_STATUSES;

const statusSchema = z.enum(['draft', 'scheduled', 'published'], {
  error: 'Escolha o estado.',
});
const titleSchema = z
  .string()
  .trim()
  .min(2, 'Título com pelo menos 2 caracteres.')
  .max(120, 'Título com até 120 caracteres.');
const summarySchema = z.string().trim().max(600, 'Resumo com até 600 caracteres.');
const orderSchema = z
  .number({ error: 'Informe a ordem.' })
  .int('Informe a ordem.')
  .min(0, 'A ordem começa em 0.');

/** Publicação: agendado exige data; a data é um instante com fuso (o web envia em UTC). */
const publicationShape = {
  status: statusSchema,
  publishAt: z.iso.datetime({ offset: true, error: 'Data inválida.' }).nullable(),
};
function requireDateWhenScheduled<T extends { status: ContentStatus; publishAt: string | null }>(
  value: T,
  ctx: z.RefinementCtx,
) {
  if (value.status === 'scheduled' && !value.publishAt) {
    ctx.addIssue({ code: 'custom', path: ['publishAt'], message: 'Agendado precisa de data.' });
  }
}

export const createCourseRequestSchema = z.object({
  title: titleSchema,
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      'Use letras minúsculas, números e hífen (ex.: gestao-do-escritorio).',
    )
    .max(80, 'Endereço com até 80 caracteres.'),
  summary: summarySchema,
});
export type CreateCourseRequest = z.infer<typeof createCourseRequestSchema>;

/** O endereço (slug) não muda depois de criado: links já compartilhados continuam valendo. */
export const updateCourseRequestSchema = z
  .object({
    title: titleSchema,
    summary: summarySchema,
    orderIndex: orderSchema,
    ...publicationShape,
  })
  .superRefine(requireDateWhenScheduled);
export type UpdateCourseRequest = z.infer<typeof updateCourseRequestSchema>;

export const createModuleRequestSchema = z.object({ title: titleSchema });
export type CreateModuleRequest = z.infer<typeof createModuleRequestSchema>;

export const updateModuleRequestSchema = z
  .object({ title: titleSchema, orderIndex: orderSchema, ...publicationShape })
  .superRefine(requireDateWhenScheduled);
export type UpdateModuleRequest = z.infer<typeof updateModuleRequestSchema>;

const publicationOut = {
  orderIndex: z.number().int(),
  status: statusSchema,
  publishAt: z.string().nullable(),
};

export const adminModuleSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  lessonCount: z.number().int(),
  ...publicationOut,
});

export const adminCourseSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  trackId: z.uuid().nullable(),
  modules: z.array(adminModuleSchema),
  ...publicationOut,
});
export type AdminCourse = z.infer<typeof adminCourseSchema>;

export const adminContentSchema = z.object({ courses: z.array(adminCourseSchema) });
export type AdminContent = z.infer<typeof adminContentSchema>;
