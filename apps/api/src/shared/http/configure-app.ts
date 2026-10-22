import { INestApplication } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';

import { setupOpenApi } from './openapi';

export const API_PREFIX = 'api/v1';

export interface HttpOptions {
  corsOrigins: string[];
  /** Proxies confiáveis na frente da API, para `req.ip` (e o rate limit) usar o IP real. */
  trustProxy: number;
  /** Swagger UI em /api/v1/docs e JSON em /api/v1/openapi.json (CF-151). */
  docsEnabled: boolean;
}

/** Configuração HTTP comum ao boot real e aos testes e2e. */
export function configureApp(
  app: INestApplication,
  { corsOrigins, trustProxy, docsEnabled }: HttpOptions,
): void {
  app.setGlobalPrefix(API_PREFIX);
  (app as NestExpressApplication).set('trust proxy', trustProxy);
  // CSP padrão do helmet (default-src 'self'): basta para o JSON e para a Swagger UI, que serve
  // os scripts como arquivo. HSTS, nosniff e frameguard incluídos.
  app.use(helmet());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    // O web lê o restante da cota para exibir no /status.
    exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  });
  if (docsEnabled) setupOpenApi(app);
  app.enableShutdownHooks();
}
