import 'reflect-metadata';

import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import { ACCESS_READER, MemberAccess } from '../src/modules/membership/application/ports';
import { RequireAccess } from '../src/modules/membership/presentation/access';
import { configureApp } from '../src/shared/http/configure-app';

// Rota de exemplo com paywall (as reais chegam com aulas e materiais, CF-083/CF-085).
@Controller('exemplo')
class ExamplePaidController {
  @Get('aula')
  @RequireAccess()
  lesson() {
    return { ok: true };
  }
}

const USERS: Record<string, { id: string; access: MemberAccess | null; roles: string[] }> = {
  'token-assinante': {
    id: '00000000-0000-4000-8000-000000000011',
    access: { source: 'subscription', subscriptionStatus: 'active', validUntil: null },
    roles: ['member'],
  },
  'token-cortesia': {
    id: '00000000-0000-4000-8000-000000000012',
    access: { source: 'manual', subscriptionStatus: null, validUntil: '2026-12-31T00:00:00Z' },
    roles: ['member'],
  },
  'token-sem-acesso': {
    id: '00000000-0000-4000-8000-000000000013',
    access: null,
    roles: ['member'],
  },
  // Papel de equipe não dá acesso a conteúdo pago (PRD CF-02).
  'token-owner-sem-assinatura': {
    id: '00000000-0000-4000-8000-000000000014',
    access: null,
    roles: ['owner', 'member'],
  },
};

const byId = (id: string) => Object.values(USERS).find((user) => user.id === id);

describe('Paywall no servidor (CF-046, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ExamplePaidController],
    })
      .overrideProvider(ACCESS_TOKEN_VERIFIER)
      .useValue({
        verify: async (token: string) =>
          USERS[token] ? { userId: USERS[token].id, aal: 'aal2' } : null,
      })
      .overrideProvider(ROLE_REPOSITORY)
      .useValue({ rolesOf: async (id: string) => byId(id)?.roles ?? [] })
      .overrideProvider(ACCESS_READER)
      .useValue({ accessOf: async (id: string) => byId(id)?.access ?? null })
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app, {
      corsOrigins: ['http://localhost:3000'],
      trustProxy: 0,
      docsEnabled: false,
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (token?: string) => {
    const req = request(app.getHttpServer()).get('/api/v1/exemplo/aula');
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('sem login: 401 (antes de consultar acesso)', async () => {
    await get().expect(401);
    await get('token-falso').expect(401);
  });

  it('assinatura ativa ou concessão vigente: libera', async () => {
    await get('token-assinante').expect(200);
    await get('token-cortesia').expect(200);
  });

  it('sem acesso vigente: 403 subscription_required', async () => {
    const { body } = await get('token-sem-acesso').expect(403);
    expect(body.message).toBe('subscription_required');
  });

  it('owner sem assinatura também não passa pelo paywall', async () => {
    const { body } = await get('token-owner-sem-assinatura').expect(403);
    expect(body.message).toBe('subscription_required');
  });
});
