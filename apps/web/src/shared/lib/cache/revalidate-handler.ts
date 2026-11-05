import { createHash, timingSafeEqual } from 'node:crypto';

import { type CacheTag, revalidateRequestSchema } from '@caixa-forte/contracts';

import { revalidateProfile } from './policy';

export interface RevalidateDeps {
  /** `REVALIDATE_SECRET` (server-only), o mesmo configurado na API. */
  secret: string | undefined;
  revalidate: (tag: CacheTag, profile: ReturnType<typeof revalidateProfile>) => void;
}

/** Comparação em tempo constante (o hash iguala os tamanhos antes do timingSafeEqual). */
function sameSecret(received: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(received), digest(expected));
}

const json = (body: unknown, status: number) => Response.json(body, { status });

/**
 * `POST /api/revalidate` (CF-163): a API avisa que preço, evento ou catálogo mudou. Sem segredo
 * configurado, o endpoint fica desligado (503); segredo errado responde 401 sem detalhes.
 */
export async function handleRevalidate(request: Request, deps: RevalidateDeps): Promise<Response> {
  if (!deps.secret) return json({ error: 'revalidação não configurada' }, 503);

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (!token || !sameSecret(token, deps.secret)) return json({ error: 'não autorizado' }, 401);

  const parsed = revalidateRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return json({ error: 'corpo inválido' }, 400);

  const tags = [...new Set(parsed.data.tags)];
  for (const tag of tags) deps.revalidate(tag, revalidateProfile(tag));
  return json({ revalidated: tags }, 200);
}
