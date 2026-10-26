import 'reflect-metadata';

import { meResponseSchema, Role } from '@caixa-forte/contracts';
import { Controller, INestApplication, Put } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import { RequirePermission } from '../src/modules/identity/presentation/authorization';
import { configureApp } from '../src/shared/http/configure-app';

// Rotas de exemplo com as permissões dos critérios de aceite (as reais chegam no CF-041/CF-105).
@Controller('exemplo')
class ExampleAdminController {
  @Put('precos')
  @RequirePermission('prices.manage')
  updatePrices() {
    return { ok: true };
  }

  @Put('financeiro')
  @RequirePermission('finance.read')
  finance() {
    return { ok: true };
  }
}

const USERS: Record<string, { id: string; roles: Role[]; aal?: 'aal1' | 'aal2' }> = {
  'token-owner': {
    id: '00000000-0000-4000-8000-000000000001',
    roles: ['owner', 'member'],
    aal: 'aal2',
  },
  // Mesma owner, mas numa sessão sem o segundo fator (CF-034).
  'token-owner-sem-mfa': {
    id: '00000000-0000-4000-8000-000000000001',
    roles: ['owner', 'member'],
    aal: 'aal1',
  },
  'token-comercial': {
    id: '00000000-0000-4000-8000-000000000002',
    roles: ['commercial', 'member'],
  },
  'token-tecnico': { id: '00000000-0000-4000-8000-000000000003', roles: ['tech', 'member'] },
  'token-membro': { id: '00000000-0000-4000-8000-000000000004', roles: ['member'] },
};

describe('Autorização no servidor (CF-032, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
      controllers: [ExampleAdminController],
    })
      .overrideProvider(ACCESS_TOKEN_VERIFIER)
      .useValue({
        verify: async (token: string) =>
          USERS[token] ? { userId: USERS[token].id, aal: USERS[token].aal ?? 'aal1' } : null,
      })
      .overrideProvider(ROLE_REPOSITORY)
      .useValue({
        rolesOf: async (id: string) => Object.values(USERS).find((u) => u.id === id)?.roles ?? [],
      })
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

  const as = (token?: string) => (req: request.Test) =>
    token ? req.set('Authorization', `Bearer ${token}`) : req;

  it('sem token ou com token inválido: 401', async () => {
    await request(app.getHttpServer()).get('/api/v1/me').expect(401);
    await as('token-falso')(request(app.getHttpServer()).get('/api/v1/me')).expect(401);
  });

  it('/me devolve papéis e permissões do banco, sem PII', async () => {
    const { body } = await as('token-comercial')(
      request(app.getHttpServer()).get('/api/v1/me'),
    ).expect(200);
    expect(meResponseSchema.parse(body)).toEqual({
      userId: USERS['token-comercial']!.id,
      roles: ['commercial', 'member'],
      permissions: ['admin.access', 'tickets.support', 'checkin.perform'],
    });
  });

  it('/me ignora tentativa de pedir outro usuário (IDOR, CF-033)', async () => {
    const outro = USERS['token-owner']!.id;
    const { body } = await as('token-membro')(
      request(app.getHttpServer()).get(`/api/v1/me?userId=${outro}`).set('X-User-Id', outro),
    ).expect(200);
    expect(body.userId).toBe(USERS['token-membro']!.id);
    expect(body.roles).toEqual(['member']);
  });

  it('comercial não edita preços (403)', async () => {
    await as('token-comercial')(request(app.getHttpServer()).put('/api/v1/exemplo/precos')).expect(
      403,
    );
  });

  it('técnico não acessa financeiro por padrão (403)', async () => {
    await as('token-tecnico')(
      request(app.getHttpServer()).put('/api/v1/exemplo/financeiro'),
    ).expect(403);
  });

  it('membro não acessa rota administrativa (403)', async () => {
    await as('token-membro')(request(app.getHttpServer()).put('/api/v1/exemplo/precos')).expect(
      403,
    );
  });

  it('owner sem MFA nesta sessão: 403 mfa_required (CF-034)', async () => {
    const { body } = await as('token-owner-sem-mfa')(
      request(app.getHttpServer()).put('/api/v1/exemplo/precos'),
    ).expect(403);
    expect(body.message).toBe('mfa_required');
  });

  it('/me não exige MFA (só login)', async () => {
    await as('token-owner-sem-mfa')(request(app.getHttpServer()).get('/api/v1/me')).expect(200);
  });

  it('owner edita preços e vê financeiro', async () => {
    await as('token-owner')(request(app.getHttpServer()).put('/api/v1/exemplo/precos')).expect(200);
    await as('token-owner')(request(app.getHttpServer()).put('/api/v1/exemplo/financeiro')).expect(
      200,
    );
  });
});
