import 'reflect-metadata';

import type { IncomingMessage, ServerResponse } from 'node:http';

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Env } from './shared/config/env';
import { configureApp, httpOptionsFrom } from './shared/http/configure-app';

type RequestListener = (req: IncomingMessage, res: ServerResponse) => void;

let listener: Promise<RequestListener> | undefined;

/** Sobe o Nest uma vez por instância da função e reaproveita nas próximas requisições. */
async function createListener(): Promise<RequestListener> {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  configureApp(app, httpOptionsFrom(app.get<ConfigService<Env, true>>(ConfigService)));
  await app.init();
  return app.getHttpAdapter().getInstance() as RequestListener;
}

/**
 * Entrada da API como função na Vercel (P-014): `api/index.js` carrega este arquivo do `dist/`
 * compilado pelo `tsc`, que preserva o `emitDecoratorMetadata` da injeção de dependências.
 * Se a inicialização falhar, a próxima requisição tenta de novo em vez de ficar presa no erro.
 */
export async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  listener ??= createListener().catch((error: unknown) => {
    listener = undefined;
    throw error;
  });
  (await listener)(req, res);
}
