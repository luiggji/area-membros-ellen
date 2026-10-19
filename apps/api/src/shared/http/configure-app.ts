import { INestApplication } from '@nestjs/common';
import helmet from 'helmet';

export const API_PREFIX = 'api/v1';

/** Configuração HTTP comum ao boot real e aos testes e2e. */
export function configureApp(app: INestApplication, corsOrigins: string[]): void {
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.enableCors({ origin: corsOrigins, credentials: true });
  app.enableShutdownHooks();
}
