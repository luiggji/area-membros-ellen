import { z } from 'zod';

/**
 * Tags de cache das páginas públicas (CF-163). A API pede a revalidação ao web quando o dado muda
 * (preço: CF-041; evento/lote: CF-060/061; catálogo: CF-080), via `POST /api/revalidate`.
 */
export const CACHE_TAGS = {
  /** Planos e price_versions vendáveis: mudança vale já no próximo acesso. */
  prices: 'Preços e planos (landing, comparador)',
  /** Edições do Café, lotes e vagas: mudança vale já no próximo acesso. */
  events: 'Café Estratégico: edições, lotes e vagas',
  /** Catálogo público de cursos e trilhas: pode servir a versão anterior enquanto atualiza. */
  courses: 'Catálogo público de cursos e trilhas',
} as const;

export type CacheTag = keyof typeof CACHE_TAGS;

export const cacheTagSchema = z.enum(Object.keys(CACHE_TAGS) as [CacheTag, ...CacheTag[]]);

/** Corpo de `POST /api/revalidate` (web), chamado só pela API com o segredo compartilhado. */
export const revalidateRequestSchema = z.object({
  tags: z.array(cacheTagSchema).min(1).max(Object.keys(CACHE_TAGS).length),
});

export type RevalidateRequest = z.infer<typeof revalidateRequestSchema>;
