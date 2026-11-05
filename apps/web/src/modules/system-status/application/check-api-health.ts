import { type HealthResponse, healthResponseSchema } from '@caixa-forte/contracts';

/** Resultado do health da API como a tela `/status` precisa exibir — inclusive as falhas. */
/** Cota de requisições informada pela API nos headers X-RateLimit-* (CF-152). */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
}

export type ApiHealth =
  | {
      state: 'ok' | 'degraded';
      latencyMs: number;
      report: HealthResponse;
      rateLimit?: RateLimitInfo;
    }
  | { state: 'invalid'; latencyMs: number; detail: string }
  | { state: 'down'; detail: string };

export type FetchLike = (url: string, init: RequestInit) => Promise<Response>;

export const HEALTH_TIMEOUT_MS = 3000;

export async function checkApiHealth(
  apiBaseUrl: string,
  fetchFn: FetchLike = fetch,
  now: () => number = performance.now.bind(performance),
): Promise<ApiHealth> {
  const startedAt = now();
  let response: Response;
  try {
    response = await fetchFn(`${apiBaseUrl.replace(/\/$/, '')}/health`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'TimeoutError';
    return {
      state: 'down',
      detail: timedOut ? `Sem resposta em ${HEALTH_TIMEOUT_MS / 1000}s` : 'API inacessível',
    };
  }
  const latencyMs = Math.round(now() - startedAt);

  if (!response.ok) return { state: 'invalid', latencyMs, detail: `HTTP ${response.status}` };

  const parsed = healthResponseSchema.safeParse(await response.json().catch(() => null));
  if (!parsed.success) {
    return { state: 'invalid', latencyMs, detail: 'Resposta fora do contrato HealthResponse' };
  }
  const rateLimit = readRateLimit(response.headers);
  return {
    state: parsed.data.status,
    latencyMs,
    report: parsed.data,
    ...(rateLimit && { rateLimit }),
  };
}

function readRateLimit(headers: Headers): RateLimitInfo | undefined {
  const limit = Number(headers.get('x-ratelimit-limit'));
  const remaining = Number(headers.get('x-ratelimit-remaining'));
  if (!headers.has('x-ratelimit-limit') || !Number.isFinite(limit) || !Number.isFinite(remaining)) {
    return undefined;
  }
  return { limit, remaining };
}
