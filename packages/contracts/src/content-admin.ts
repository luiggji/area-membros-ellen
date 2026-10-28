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

const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Use letras minúsculas, números e hífen (ex.: gestao-do-escritorio).',
  )
  .max(80, 'Endereço com até 80 caracteres.');

export const createCourseRequestSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  summary: summarySchema,
});
export type CreateCourseRequest = z.infer<typeof createCourseRequestSchema>;

/** O endereço (slug) não muda depois de criado: links já compartilhados continuam valendo. */
export const updateCourseRequestSchema = z
  .object({
    title: titleSchema,
    summary: summarySchema,
    orderIndex: orderSchema,
    /** Trilha do curso (CF-173); `null` = curso avulso. */
    trackId: z.uuid({ error: 'Trilha inválida.' }).nullable(),
    ...publicationShape,
  })
  .superRefine(requireDateWhenScheduled);
export type UpdateCourseRequest = z.infer<typeof updateCourseRequestSchema>;

/** Trilhas (CF-173): agrupam cursos; trilha fora do ar esconde os cursos dela no catálogo. */
export const createTrackRequestSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  summary: summarySchema,
});
export type CreateTrackRequest = z.infer<typeof createTrackRequestSchema>;

export const updateTrackRequestSchema = z
  .object({
    title: titleSchema,
    summary: summarySchema,
    orderIndex: orderSchema,
    ...publicationShape,
  })
  .superRefine(requireDateWhenScheduled);
export type UpdateTrackRequest = z.infer<typeof updateTrackRequestSchema>;

export const createModuleRequestSchema = z.object({ title: titleSchema });
export type CreateModuleRequest = z.infer<typeof createModuleRequestSchema>;

export const updateModuleRequestSchema = z
  .object({ title: titleSchema, orderIndex: orderSchema, ...publicationShape })
  .superRefine(requireDateWhenScheduled);
export type UpdateModuleRequest = z.infer<typeof updateModuleRequestSchema>;

/** Tipos de aula (espelha o check de `lessons.kind`, CF-080). */
export const LESSON_KINDS = { video: 'Vídeo', text: 'Texto' } as const;
export type LessonKind = keyof typeof LESSON_KINDS;

const kindSchema = z.enum(['video', 'text'], { error: 'Escolha o tipo da aula.' });

export const createLessonRequestSchema = z.object({ title: titleSchema, kind: kindSchema });
export type CreateLessonRequest = z.infer<typeof createLessonRequestSchema>;

/** Aula aberta (`isFree`): o conteúdo fica liberado para quem está logado, mesmo sem assinatura. */
export const updateLessonRequestSchema = z
  .object({
    title: titleSchema,
    summary: summarySchema,
    kind: kindSchema,
    durationMinutes: z
      .number({ error: 'Duração em minutos.' })
      .int('Duração em minutos inteiros.')
      .min(1, 'Duração de 1 a 600 minutos.')
      .max(600, 'Duração de 1 a 600 minutos.')
      .nullable(),
    isFree: z.boolean(),
    orderIndex: orderSchema,
    ...publicationShape,
  })
  .superRefine(requireDateWhenScheduled);
export type UpdateLessonRequest = z.infer<typeof updateLessonRequestSchema>;

/**
 * Conteúdo protegido da aula: texto em Markdown e a referência opaca da mídia no provedor
 * (P-007). Nunca um link: o player (CF-083) pede ao provedor uma URL assinada e de vida curta.
 */
export const lessonContentRequestSchema = z.object({
  bodyMd: z.string().trim().max(50_000, 'Texto com até 50.000 caracteres.'),
  mediaRef: z
    .string()
    .trim()
    .max(500, 'Referência com até 500 caracteres.')
    .regex(
      /^[A-Za-z0-9._:-]*$/,
      'Use só o identificador da mídia no provedor (letras, números, ponto, hífen, dois-pontos ou sublinhado), não um link.',
    ),
});
export type LessonContentRequest = z.infer<typeof lessonContentRequestSchema>;

const publicationOut = {
  orderIndex: z.number().int(),
  status: statusSchema,
  publishAt: z.string().nullable(),
};

export const adminLessonSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  summary: z.string().nullable(),
  kind: kindSchema,
  durationMinutes: z.number().int().nullable(),
  isFree: z.boolean(),
  bodyMd: z.string().nullable(),
  mediaRef: z.string().nullable(),
  ...publicationOut,
});
export type AdminLesson = z.infer<typeof adminLessonSchema>;

export const adminModuleSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  lessons: z.array(adminLessonSchema),
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

export const adminTrackSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  ...publicationOut,
});
export type AdminTrack = z.infer<typeof adminTrackSchema>;

export const adminContentSchema = z.object({
  tracks: z.array(adminTrackSchema),
  courses: z.array(adminCourseSchema),
});
export type AdminContent = z.infer<typeof adminContentSchema>;
