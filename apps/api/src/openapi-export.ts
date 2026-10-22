import 'reflect-metadata';

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './shared/http/configure-app';
import { buildOpenApiDocument } from './shared/http/openapi';

/** Artefato versionado da API (CF-151); o CI falha se ficar diferente do código. */
export const OPENAPI_ARTIFACT = path.resolve(__dirname, '../../../docs/api/openapi.json');

/** Gera o documento sem abrir porta. Uso: pnpm openapi:export (na raiz). */
async function main(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: false });
  configureApp(app, { corsOrigins: [], trustProxy: 0, docsEnabled: false });
  await app.init();
  const document = buildOpenApiDocument(app);
  await app.close();

  mkdirSync(path.dirname(OPENAPI_ARTIFACT), { recursive: true });
  writeFileSync(OPENAPI_ARTIFACT, `${JSON.stringify(document, null, 2)}\n`);
  // logger: false silencia também o Logger estático do Nest.
  const routes = Object.keys(document.paths).length;
  process.stdout.write(`docs/api/openapi.json gerado (${routes} rotas)\n`);
}

void main();
