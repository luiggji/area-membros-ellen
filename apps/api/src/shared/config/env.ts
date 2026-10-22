import { appEnvSchema, checkEnvironmentIsolation } from '@caixa-forte/contracts';
import { z } from 'zod';

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    /** Ambiente lógico (CF-012): decide qual banco, storage e gateway são aceitos. */
    APP_ENV: appEnvSchema.default('development'),
    API_PORT: z.coerce.number().int().positive().default(4000),
    API_CORS_ORIGINS: z
      .string()
      .default('http://localhost:3000')
      .transform((value) => value.split(',').map((origin) => origin.trim())),
    /** Requisições por minuto por IP em toda a API (CF-152). Rotas sensíveis podem ser mais estritas. */
    API_RATE_LIMIT_PER_MINUTE: z.coerce.number().int().positive().default(120),
    /**
     * Quantos proxies confiáveis ficam na frente da API (Express `trust proxy`), para o rate limit
     * usar o IP real do cliente. 0 em dev; o host da API (CF-015) define o valor.
     */
    API_TRUST_PROXY: z.coerce.number().int().min(0).default(0),
    /** Swagger UI e openapi.json (CF-151). Sem valor: ligado fora de produção, desligado nela. */
    API_DOCS_ENABLED: z.stringbool().optional(),
    // Supabase: opcionais em dev até a hospedagem ser escolhida (P-014); obrigatórios fora dele.
    SUPABASE_URL: optionalText.pipe(z.url().optional()),
    /** Segredo: só na API, nunca em variável NEXT_PUBLIC_*. */
    SUPABASE_SERVICE_ROLE_KEY: optionalText,
    /** Ref público do projeto de produção, para barrar staging/dev apontando para ele. */
    SUPABASE_PRODUCTION_REF: optionalText,
  })
  .superRefine((env, ctx) => {
    const isolation = checkEnvironmentIsolation({
      appEnv: env.APP_ENV,
      supabaseUrl: env.SUPABASE_URL,
      productionProjectRef: env.SUPABASE_PRODUCTION_REF,
    });
    if (isolation.status === 'violation') {
      ctx.addIssue({ code: 'custom', path: ['SUPABASE_URL'], message: isolation.reason });
    }
    if (env.SUPABASE_URL && !env.SUPABASE_SERVICE_ROLE_KEY && env.APP_ENV !== 'development') {
      ctx.addIssue({
        code: 'custom',
        path: ['SUPABASE_SERVICE_ROLE_KEY'],
        message: `${env.APP_ENV} exige a chave de serviço do próprio projeto`,
      });
    }
  })
  .transform((env) => ({
    ...env,
    API_DOCS_ENABLED: env.API_DOCS_ENABLED ?? env.APP_ENV !== 'production',
  }));

export type Env = z.infer<typeof envSchema>;

/** Valida as variáveis de ambiente no boot: falha cedo em vez de rodar mal configurado. */
export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    throw new Error(`Variáveis de ambiente inválidas:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}
