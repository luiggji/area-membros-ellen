import 'reflect-metadata';

import { AccessGrant, Role } from '@caixa-forte/contracts';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import { GRANT_STORE, GrantStore } from '../src/modules/membership/application/access-grants';
import { configureApp } from '../src/shared/http/configure-app';

const USERS: Record<string, { id: string; roles: Role[]; aal: 'aal1' | 'aal2' }> = {
  'token-owner': { id: '00000000-0000-4000-8000-000000000021', roles: ['owner'], aal: 'aal2' },
  'token-owner-sem-mfa': {
    id: '00000000-0000-4000-8000-000000000021',
    roles: ['owner'],
    aal: 'aal1',
  },
  'token-comercial': {
    id: '00000000-0000-4000-8000-000000000022',
    roles: ['commercial'],
    aal: 'aal2',
  },
  'token-membro': { id: '00000000-0000-4000-8000-000000000023', roles: ['member'], aal: 'aal2' },
};
const GRANT_ID = '5f0e8c3a-2b1d-4c6e-9a7f-0d1e2f3a4b5c';

// Banco em memória: uma conta conhecida e as concessões criadas no teste.
const state = { created: [] as unknown[], revoked: new Set<string>() };
const store: GrantStore = {
  userIdByEmail: async (email) =>
    email === 'membro@teste.local' ? '00000000-0000-4000-8000-000000000023' : null,
  create: async (input) => {
    state.created.push(input);
    return GRANT_ID;
  },
  revoke: async (id) => {
    if (id !== GRANT_ID || state.revoked.has(id)) return false;
    state.revoked.add(id);
    return true;
  },
  list: async (): Promise<AccessGrant[]> => [],
};

describe('Concessões manuais (CF-048, e2e)', () => {
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
      .overrideProvider(GRANT_STORE)
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
    state.created = [];
    state.revoked.clear();
  });

  afterAll(async () => {
    await app.close();
  });

  const post = (path: string, token: string, body?: object) =>
    request(app.getHttpServer())
      .post(`/api/v1/admin/acessos${path}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body ?? {});
  const valid = { email: 'Membro@Teste.Local', validUntil: '2099-12-31', reason: 'cortesia' };

  it('owner com MFA concede: grava quem concedeu e validade no fim do dia em Brasília', async () => {
    await post('', 'token-owner', valid).expect(201, { id: GRANT_ID });
    expect(state.created).toEqual([
      {
        userId: '00000000-0000-4000-8000-000000000023',
        reason: 'cortesia',
        validTo: '2100-01-01T02:59:59.999Z',
        grantedBy: USERS['token-owner']!.id,
      },
    ]);
  });

  it('comercial e membro: 403; owner sem MFA: 403 mfa_required', async () => {
    await post('', 'token-comercial', valid).expect(403);
    await post('', 'token-membro', valid).expect(403);
    const { body } = await post('', 'token-owner-sem-mfa', valid).expect(403);
    expect(body.message).toBe('mfa_required');
    expect(state.created).toEqual([]);
  });

  it('sem motivo, data passada ou e-mail sem conta: nada é criado', async () => {
    const semMotivo = await post('', 'token-owner', { ...valid, reason: ' ' }).expect(400);
    expect(semMotivo.body.fields.reason).toBeDefined();
    const passada = await post('', 'token-owner', { ...valid, validUntil: '2020-01-01' }).expect(
      400,
    );
    expect(passada.body.fields.validUntil).toBe('A validade precisa ser uma data futura.');
    const desconhecido = await post('', 'token-owner', {
      ...valid,
      email: 'ninguem@teste.local',
    }).expect(404);
    expect(desconhecido.body.message).toBe('member_not_found');
    expect(state.created).toEqual([]);
  });

  it('revoga uma vez; a segunda responde 404; id malformado é 400', async () => {
    await post(`/${GRANT_ID}/revogar`, 'token-owner').expect(200, { revoked: true });
    await post(`/${GRANT_ID}/revogar`, 'token-owner').expect(404);
    await post('/nao-e-uuid/revogar', 'token-owner').expect(400);
    await post(`/${GRANT_ID}/revogar`, 'token-comercial').expect(403);
  });

  it('lista só para quem tem a permissão', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/acessos')
      .set('Authorization', 'Bearer token-owner')
      .expect(200, { grants: [] });
    await request(app.getHttpServer())
      .get('/api/v1/admin/acessos')
      .set('Authorization', 'Bearer token-membro')
      .expect(403);
  });
});
