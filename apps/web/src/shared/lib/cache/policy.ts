import type { CacheTag } from '@caixa-forte/contracts';

/**
 * Política de cache do web (CF-163, modelo clássico do Next; Cache Components fica de fora porque
 * o PPR quebra a CSP com nonce da área privada e os status 404/500 — decisão de 22/10/2026):
 * - público (landing, planos, eventos, catálogo): cacheável, com a tag do dado e revalidação
 *   pela API quando ele muda; `PUBLIC_REVALIDATE_SECONDS` é só a rede de segurança;
 * - privado (/app, /admin): sempre por requisição (`await connection()`) e `private, no-store`
 *   no proxy, para nenhuma CDN guardar página de membro.
 */
export const PUBLIC_REVALIDATE_SECONDS = 3600;

/**
 * Quanto tempo a versão anterior pode ser servida depois da revalidação: preço e evento (lote,
 * vagas) valem já no próximo acesso; o catálogo de cursos pode atualizar em segundo plano.
 */
export function revalidateProfile(tag: CacheTag): 'max' | { expire: number } {
  return tag === 'courses' ? 'max' : { expire: 0 };
}

type FetchLike = (url: string, init: RequestInit & { next?: unknown }) => Promise<Response>;

/** Busca dado público cacheável e marcado com as tags que a API revalida. */
export function publicFetch(url: string, tags: CacheTag[], fetchFn: FetchLike = fetch) {
  return fetchFn(url, { next: { tags, revalidate: PUBLIC_REVALIDATE_SECONDS } });
}
