import { z } from 'zod';

/**
 * Catálogo do membro (CF-082). Só sai o que já está liberado (`available`) ou programado com data
 * verdadeira (`scheduled`); rascunho nunca. O conteúdo protegido das aulas não passa por aqui.
 */
export const COURSE_AVAILABILITY = {
  available: 'Disponível',
  scheduled: 'Programado',
} as const;
export type CourseAvailability = keyof typeof COURSE_AVAILABILITY;

const availabilitySchema = z.enum(['available', 'scheduled']);

export const catalogCourseSchema = z.object({
  slug: z.string(),
  title: z.string(),
  summary: z.string().nullable(),
  availability: availabilitySchema,
  /** Quando programado: o instante (UTC) em que o curso fica disponível. */
  availableAt: z.string().nullable(),
});
export type CatalogCourse = z.infer<typeof catalogCourseSchema>;

export const catalogSchema = z.object({ courses: z.array(catalogCourseSchema) });
export type Catalog = z.infer<typeof catalogSchema>;

export const catalogLessonSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  kind: z.enum(['video', 'text']),
  durationMinutes: z.number().int().nullable(),
  isFree: z.boolean(),
  /** Concluída por quem está vendo (CF-084). */
  completed: z.boolean(),
});

export const catalogModuleSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  lessons: z.array(catalogLessonSchema),
});

/**
 * Por onde seguir no curso (CF-084): `start` = nenhuma aula começada; `continue` = a aula mexida
 * mais recentemente e não concluída (ou a primeira não concluída). `null` = tudo concluído.
 */
export const courseResumeSchema = z.object({
  lessonId: z.uuid(),
  title: z.string(),
  state: z.enum(['start', 'continue']),
});
export type CourseResume = z.infer<typeof courseResumeSchema>;

/** Página do curso: estrutura visível (módulos e aulas liberados), sem o conteúdo das aulas. */
export const courseDetailSchema = catalogCourseSchema.extend({
  modules: z.array(catalogModuleSchema),
  resume: courseResumeSchema.nullable(),
});
export type CourseDetail = z.infer<typeof courseDetailSchema>;
