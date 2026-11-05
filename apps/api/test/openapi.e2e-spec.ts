import 'reflect-metadata';

import { healthResponseSchema } from '@caixa-forte/contracts';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { z } from 'zod';

import { AppModule } from '../src/app.module';
import { configureApp } from '../src/shared/http/configure-app';

async function createApp(docsEnabled: boolean): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication();
  configureApp(app, { corsOrigins: ['http://localhost:3000'], trustProxy: 0, docsEnabled });
  await app.init();
  return app;
}

describe('OpenAPI da API (CF-151, e2e)', () => {
  describe('ligado (dev/staging)', () => {
    let app: INestApplication;
    beforeAll(async () => {
      app = await createApp(true);
    });
    afterAll(async () => {
      await app.close();
    });

    it('serve o documento com as rotas do código e o schema do contrato zod', async () => {
      const { body } = await request(app.getHttpServer()).get('/api/v1/openapi.json').expect(200);

      expect(body.openapi).toBe('3.0.0');
      const ok = body.paths['/api/v1/health'].get.responses['200'];
      expect(ok.content['application/json'].schema).toEqual(
        z.toJSONSchema(healthResponseSchema, { target: 'openapi-3.0' }),
      );
      expect(body.paths['/api/v1/health'].get.responses['429']).toBeDefined();
    });

    it('não expõe segredos nem valores de ambiente', async () => {
      const { text } = await request(app.getHttpServer()).get('/api/v1/openapi.json');
      expect(text).not.toMatch(/service_role|sb_secret_|SUPABASE_|password|eyJ[\w-]{10,}/i);
    });

    it('serve a Swagger UI em /api/v1/docs', async () => {
      const response = await request(app.getHttpServer()).get('/api/v1/docs').expect(200);
      expect(response.text).toContain('swagger-ui');
    });
  });

  describe('desligado (padrão em produção)', () => {
    let app: INestApplication;
    beforeAll(async () => {
      app = await createApp(false);
    });
    afterAll(async () => {
      await app.close();
    });

    it('não serve documento nem UI', async () => {
      await request(app.getHttpServer()).get('/api/v1/openapi.json').expect(404);
      await request(app.getHttpServer()).get('/api/v1/docs').expect(404);
    });
  });
});
