import 'reflect-metadata';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { configureApp } from '../src/shared/http/configure-app';

// O ConfigModule valida o env ao carregar o AppModule: o limite precisa existir antes do import.
const LIMIT = 3;
process.env.API_RATE_LIMIT_PER_MINUTE = String(LIMIT);

describe('Segurança HTTP da API (CF-152, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const { AppModule } = await import('../src/app.module.js');
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app, {
      corsOrigins: ['http://localhost:3000'],
      trustProxy: 1,
      docsEnabled: false,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.API_RATE_LIMIT_PER_MINUTE;
  });

  it('envia os headers de segurança do helmet', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('X-Forwarded-For', '203.0.113.1');

    expect(response.headers['strict-transport-security']).toMatch(/max-age=/);
    expect(response.headers['content-security-policy']).toContain("default-src 'self'");
    expect(response.headers['x-frame-options']).toBe('SAMEORIGIN');
    expect(response.headers['x-powered-by']).toBeUndefined();
  });

  it('expõe os headers de rate limit ao web via CORS', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('Origin', 'http://localhost:3000')
      .set('X-Forwarded-For', '203.0.113.2');

    expect(response.headers['x-ratelimit-limit']).toBe(String(LIMIT));
    expect(response.headers['access-control-expose-headers']).toContain('X-RateLimit-Remaining');
  });

  it('responde 429 ao passar do limite, contando por IP', async () => {
    const server = app.getHttpServer();
    const ip = '203.0.113.3';
    for (let i = 0; i < LIMIT; i++) {
      await request(server).get('/api/v1/health').set('X-Forwarded-For', ip).expect(200);
    }
    const blocked = await request(server).get('/api/v1/health').set('X-Forwarded-For', ip);
    expect(blocked.status).toBe(429);
    expect(blocked.headers['retry-after']).toBeDefined();

    // Outro cliente (IP real diferente, via trust proxy) não é afetado.
    await request(server).get('/api/v1/health').set('X-Forwarded-For', '203.0.113.4').expect(200);
  });
});
