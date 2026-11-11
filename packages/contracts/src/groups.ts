import { z } from 'zod';

/**
 * Estados de um grupo temático (CF-092). `draft` nunca foi ao ar; `hidden` saiu do ar depois de
 * publicado — a distinção importa para a trilha de auditoria e para o que Ellen vê na lista.
 * Só `published` é visível para membros.
 */
export const GROUP_STATUSES = {
  draft: 'Rascunho',
  published: 'Publicado',
  hidden: 'Oculto',
} as const;
export type GroupStatus = keyof typeof GROUP_STATUSES;

export const groupStatusSchema = z.enum(
  Object.keys(GROUP_STATUSES) as [GroupStatus, ...GroupStatus[]],
  { error: 'Escolha rascunho, publicado ou oculto.' },
);

const nameSchema = z
  .string()
  .trim()
  .min(2, 'Nome com pelo menos 2 caracteres.')
  .max(80, 'Nome com até 80 caracteres.');

const descriptionSchema = z.string().trim().max(500, 'Descrição com até 500 caracteres.');

/** Espelha o check do banco, que é a autoridade. Não muda depois de criado: vira a URL do grupo. */
const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'Identificador com pelo menos 2 caracteres.')
  .max(60, 'Identificador com até 60 caracteres.')
  .regex(
    /^[a-z0-9]+(-[a-z0-9]+)*$/,
    'Use letras minúsculas, números e hífen (ex.: advocacia-solo).',
  );

/** Grupo nasce em rascunho: criar não publica. */
export const createGroupRequestSchema = z.object({
  slug: slugSchema,
  name: nameSchema,
  description: descriptionSchema,
});
export type CreateGroupRequest = z.infer<typeof createGroupRequestSchema>;

/** O identificador não muda depois de criado: é a referência estável do grupo. */
export const updateGroupRequestSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  status: groupStatusSchema,
});
export type UpdateGroupRequest = z.infer<typeof updateGroupRequestSchema>;

export const adminGroupSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: groupStatusSchema,
  createdAt: z.string(),
});
export type AdminGroup = z.infer<typeof adminGroupSchema>;

export const adminGroupListSchema = z.object({ groups: z.array(adminGroupSchema) });
export type AdminGroupList = z.infer<typeof adminGroupListSchema>;
