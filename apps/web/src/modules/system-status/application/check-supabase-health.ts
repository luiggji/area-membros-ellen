import type { SupabasePublicConfig } from '@/shared/lib/supabase/config';

import type { FetchLike } from './check-api-health';

/** Conexão com o Supabase do ambiente (CF-156), como a tela `/status` precisa exibir. */
export type SupabaseHealth =
  | { state: 'ok'; latencyMs: number; authVersion?: string }
  | { state: 'invalid'; latencyMs: number; detail: string }
  | { state: 'down'; detail: string };

export const SUPABASE_HEALTH_TIMEOUT_MS = 3000;

/** Consulta o health do Auth com a chave pública: prova URL e chave válidas sem ler dados. */
export async function checkSupabaseHealth(
  { url, publicKey }: SupabasePublicConfig,
  fetchFn: FetchLike = fetch,
  now: () => number = performance.now.bind(performance),
): Promise<SupabaseHealth> {
  const startedAt = now();
  let response: Response;
  try {
    response = await fetchFn(`${url.replace(/\/$/, '')}/auth/v1/health`, {
      cache: 'no-store',
      headers: { apikey: publicKey },
      signal: AbortSignal.timeout(SUPABASE_HEALTH_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    return {
      state: 'down',
      detail: timedOut
        ? `Sem resposta em ${SUPABASE_HEALTH_TIMEOUT_MS / 1000}s`
        : 'Supabase inacessível',
    };
  }
  const latencyMs = Math.round(now() - startedAt);

  if (response.status === 401 || response.status === 403) {
    return { state: 'invalid', latencyMs, detail: 'chave pública recusada pelo projeto' };
  }
  if (!response.ok) return { state: 'invalid', latencyMs, detail: `HTTP ${response.status}` };

  const body = (await response.json().catch(() => null)) as { version?: unknown } | null;
  return {
    state: 'ok',
    latencyMs,
    ...(typeof body?.version === 'string' && { authVersion: body.version }),
  };
}
