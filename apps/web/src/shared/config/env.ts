import { z } from 'zod';

/**
 * Variáveis PÚBLICAS (expostas ao browser). Segredos (service_role, gateway) nunca entram aqui:
 * ficam só na API ou em código server-only.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.url().default('http://localhost:4000/api/v1'),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function parsePublicEnv(source: Record<string, string | undefined>): PublicEnv {
  const result = publicEnvSchema.safeParse(source);
  if (!result.success) {
    throw new Error(`Variáveis públicas inválidas:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

// Referência explícita a cada variável: o Next só embute no bundle as que aparecem literalmente.
export const publicEnv = parsePublicEnv({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
