import { z } from 'zod';

/**
 * Vídeo da aula no player (CF-083):
 * - `ready`: caminho assinado na API (`/midia/<token>`), de vida curta, emitido só para quem tem
 *   acesso; a API redireciona para a URL temporária do provedor.
 * - `pending`: a aula tem vídeo, mas o provedor ainda não está configurado (P-007).
 * `null` quando a aula não tem vídeo ou quando quem vê não tem acesso.
 */
export const lessonVideoSchema = z.discriminatedUnion('state', [
  z.object({ state: z.literal('ready'), path: z.string(), expiresAt: z.string() }),
  z.object({ state: z.literal('pending') }),
]);
export type LessonVideo = z.infer<typeof lessonVideoSchema>;

export const LESSON_ACCESS = {
  granted: 'Liberada',
  subscription_required: 'Para assinantes',
} as const;
export type LessonAccess = keyof typeof LESSON_ACCESS;

/** Aula no player. Sem acesso, só os dados públicos da aula: nada de texto nem vídeo. */
export const lessonViewSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  summary: z.string().nullable(),
  kind: z.enum(['video', 'text']),
  durationMinutes: z.number().int().nullable(),
  isFree: z.boolean(),
  course: z.object({ slug: z.string(), title: z.string() }),
  moduleTitle: z.string(),
  access: z.enum(['granted', 'subscription_required']),
  bodyMd: z.string().nullable(),
  video: lessonVideoSchema.nullable(),
});
export type LessonView = z.infer<typeof lessonViewSchema>;
