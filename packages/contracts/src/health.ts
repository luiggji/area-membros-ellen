import { z } from 'zod';

/** Resposta do endpoint `GET /api/v1/health` — sem PII nem segredos. */
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  service: z.string(),
  version: z.string(),
  timestamp: z.iso.datetime(),
  /** Dependências checadas (ex.: `audit_log`, CF-161). Só nome e estado, sem detalhe interno. */
  checks: z.array(z.object({ name: z.string(), healthy: z.boolean() })),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
