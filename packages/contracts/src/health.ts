import { z } from 'zod';

/** Resposta do endpoint `GET /api/v1/health` — sem PII nem segredos. */
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  service: z.string(),
  version: z.string(),
  timestamp: z.iso.datetime(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
