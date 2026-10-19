import 'reflect-metadata';

import { healthResponseSchema } from '@caixa-forte/contracts';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/shared/http/configure-app';

describe('GET /api/v1/health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, ['http://localhost:3000']);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 200 com contrato válido e headers de segurança', async () => {
    const response = await request(app.getHttpServer()).get('/api/v1/health').expect(200);

    expect(healthResponseSchema.parse(response.body).status).toBe('ok');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('não expõe rotas fora do prefixo versionado', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });
});
