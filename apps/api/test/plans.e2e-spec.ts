import 'reflect-metadata';

import { AdminPlan, Role } from '@caixa-forte/contracts';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { PLAN_STORE, PlanStore } from '../src/modules/billing/application/plans';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import { configureApp } from '../src/shared/http/configure-app';

const USERS: Record<string, { id: string; roles: Role[]; aal: 'aal1' | 'aal2' }> = {
  'token-owner': { id: '00000000-0000-4000-8000-000000000031', roles: ['owner'], aal: 'aal2' },
  'token-owner-sem-mfa': {
    id: '00000000-0000-4000-8000-000000000031',
    roles: ['owner'],
    aal: 'aal1',
  },
  'token-comercial': {
    id: '00000000-0000-4000-8000-000000000032',
    roles: ['commercial'],
    aal: 'aal2',
  },
  'token-tecnico': { id: '00000000-0000-4000-8000-000000000033', roles: ['tech'], aal: 'aal2' },
};
const PLAN_ID = '7c1d2e3f-4a5b-4c6d-8e7f-9a0b1c2d3e4f';

// Catálogo em memória: um plano existente; escritas registradas para conferir.
const state = { calls: [] as unknown[][] };
const store: PlanStore = {
  list: async (): Promise<AdminPlan[]> => [],
  create: async (input, actor) => {
    state.calls.push(['create', input, actor]);
    return input.code === 'caixa-forte' ? { status: 'duplicate' } : { status: 'ok', id: PLAN_ID };
  },
  update: async (id, input, actor) => {
    state.calls.push(['update', id, input, actor]);
    return id === PLAN_ID ? { status: 'ok', id } : { status: 'not_found' };
  },
  publishPrice: async (id, input, actor) => {
    state.calls.push(['price', id, input, actor]);
    return id === PLAN_ID ? { status: 'ok', id: 'p-1' } : { status: 'not_found' };
  },
};

describe('Planos e preços (CF-041, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ACCESS_TOKEN_VERIFIER)
      .useValue({
        verify: async (token: string) =>
          USERS[token] ? { userId: USERS[token].id, aal: USERS[token].aal } : null,
      })
      .overrideProvider(ROLE_REPOSITORY)
      .useValue({
        rolesOf: async (id: string) => Object.values(USERS).find((u) => u.id === id)?.roles ?? [],
      })
      .overrideProvider(PLAN_STORE)
      .useValue(store)
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app, {
      corsOrigins: ['http://localhost:3000'],
      trustProxy: 0,
      docsEnabled: false,
    });
    await app.init();
  });

  beforeEach(() => {
    state.calls = [];
  });

  afterAll(async () => {
    await app.close();
  });

  const send = (method: 'post' | 'patch', path: string, token: string, body: object) =>
    request(app.getHttpServer())
      [method](`/api/v1/admin/planos${path}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  const owner = USERS['token-owner']!.id;

  it('owner cria plano com código normalizado; código repetido: 409', async () => {
    await send('post', '', 'token-owner', {
      code: ' Mentoria ',
      name: 'Mentoria',
      description: '',
    }).expect(201, { id: PLAN_ID });
    expect(state.calls[0]).toEqual([
      'create',
      { code: 'mentoria', name: 'Mentoria', description: '' },
      owner,
    ]);
    const dup = await send('post', '', 'token-owner', {
      code: 'caixa-forte',
      name: 'Outro',
      description: '',
    }).expect(409);
    expect(dup.body.message).toBe('plan_code_taken');
  });

  it('owner publica preço novo; plano inexistente: 404; valor inválido: 400', async () => {
    await send('post', `/${PLAN_ID}/precos`, 'token-owner', {
      interval: 'month',
      amountCents: 9900,
    }).expect(201, { id: 'p-1' });
    expect(state.calls[0]).toEqual([
      'price',
      PLAN_ID,
      { interval: 'month', amountCents: 9900 },
      owner,
    ]);
    await send('post', '/5f0e8c3a-2b1d-4c6e-9a7f-0d1e2f3a4b5c/precos', 'token-owner', {
      interval: 'year',
      amountCents: 79000,
    }).expect(404);
    const bad = await send('post', `/${PLAN_ID}/precos`, 'token-owner', {
      interval: 'month',
      amountCents: 89.9,
    }).expect(400);
    expect(bad.body.fields.amountCents).toBeDefined();
  });

  it('owner edita e desativa; o código não entra na edição', async () => {
    await send('patch', `/${PLAN_ID}`, 'token-owner', {
      name: 'Caixa Forte',
      description: 'x',
      active: false,
      code: 'outro',
    }).expect(200);
    expect(state.calls[0]).toEqual([
      'update',
      PLAN_ID,
      { name: 'Caixa Forte', description: 'x', active: false },
      owner,
    ]);
  });

  it('comercial e técnico: 403; owner sem MFA: 403 mfa_required; nada é gravado', async () => {
    const body = { interval: 'month', amountCents: 9900 };
    await send('post', `/${PLAN_ID}/precos`, 'token-comercial', body).expect(403);
    await send('post', `/${PLAN_ID}/precos`, 'token-tecnico', body).expect(403);
    const semMfa = await send('post', `/${PLAN_ID}/precos`, 'token-owner-sem-mfa', body).expect(
      403,
    );
    expect(semMfa.body.message).toBe('mfa_required');
    await request(app.getHttpServer()).get('/api/v1/admin/planos').expect(401);
    expect(state.calls).toEqual([]);
  });
});
