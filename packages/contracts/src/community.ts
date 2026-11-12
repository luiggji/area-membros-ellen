import { z } from 'zod';

/**
 * Comunidade do membro (CF-093): grupos publicados, participação e feed de publicações.
 * Quem administra os grupos é o owner (CF-092, `groups.ts`); aqui é a visão de quem participa.
 * Publicar e comentar chegam no CF-094 — por enquanto o feed é só leitura.
 */

/** Um grupo como o membro vê: sem rascunho, sem oculto, com a própria participação. */
export const memberGroupSchema = z.object({
  id: z.uuid(),
  slug: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  /** Quantas pessoas participam. Número real do banco, nunca estimado. */
  memberCount: z.number().int().min(0),
  /** Se quem pediu participa deste grupo. */
  joined: z.boolean(),
});
export type MemberGroup = z.infer<typeof memberGroupSchema>;

export const memberGroupListSchema = z.object({ groups: z.array(memberGroupSchema) });
export type MemberGroupList = z.infer<typeof memberGroupListSchema>;

/** Uma publicação do feed. O autor aparece pelo nome de exibição, nunca por e-mail (LGPD). */
export const feedPostSchema = z.object({
  id: z.uuid(),
  body: z.string(),
  createdAt: z.string(),
  authorName: z.string(),
  group: z.object({ slug: z.string(), name: z.string() }),
});
export type FeedPost = z.infer<typeof feedPostSchema>;

/**
 * Feed: publicações dos grupos em que a pessoa entrou, mais recentes primeiro.
 * `joinedAnyGroup` separa "não entrou em nenhum grupo" de "entrou, mas ninguém publicou" —
 * são estados vazios diferentes e a tela diz coisas diferentes em cada um.
 */
export const feedSchema = z.object({
  posts: z.array(feedPostSchema),
  joinedAnyGroup: z.boolean(),
});
export type Feed = z.infer<typeof feedSchema>;
