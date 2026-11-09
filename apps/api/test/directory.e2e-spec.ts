import 'reflect-metadata';

import { DirectoryMember, Role } from '@caixa-forte/contracts';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import {
  DIRECTORY_SEARCH,
  DirectoryFilters,
  DirectorySearch,
} from '../src/modules/community/application/directory-search';
import { DIRECTORY_SEARCHES_PER_MINUTE } from '../src/modules/community/presentation/directory.controller';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import { ACCESS_READER } from '../src/modules/membership/application/ports';
import { configureApp } from '../src/shared/http/configure-app';

const USERS: Record<string, { id: string; roles: Role[] }> = {
  'token-assinante': { id: '00000000-0000-4000-8000-000000000081', roles: ['member'] },
  'token-visitante': { id: '00000000-0000-4000-8000-000000000082', roles: ['member'] },
  'token-comercial': { id: '00000000-0000-4000-8000-000000000083', roles: ['commercial'] },
};

const ana: DirectoryMember = {
  id: '00000000-0000-4000-8000-000000000091',
  displayName: 'Ana Fictícia',
  city: 'Curitiba',
  state: 'PR',
  areas: ['Família'],
  bio: null,
  links: ['https://exemplo.test/ana'],
};

const calls: { filters: DirectoryFilters; limit: number; offset: number }[] = [];
const directory: DirectorySearch = {
  search: async (filters, limit, offset) => {
    calls.push({ filters, limit, offset });
    return [ana];
  },
};

describe('Busca no diretório (CF-091, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ACCESS_TOKEN_VERIFIER)
      .useValue({
        verify: async (token: string) =>
          USERS[token] ? { userId: USERS[token].id, aal: 'aal1' } : null,
      })
      .overrideProvider(ROLE_REPOSITORY)
      .useValue({
        rolesOf: async (id: string) => Object.values(USERS).find((u) => u.id === id)?.roles ?? [],
      })
      .overrideProvider(ACCESS_READER)
      .useValue({
        accessOf: async (userId: string) =>
          userId === USERS['token-assinante']!.id
            ? { source: 'subscription', subscriptionStatus: 'active', validUntil: null }
            : null,
      })
      .overrideProvider(DIRECTORY_SEARCH)
      .useValue(directory)
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
    calls.length = 0;
  });

  afterAll(async () => {
    await app.close();
  });

  const search = (query: string, token?: string) => {
    const req = request(app.getHttpServer()).get(`/api/v1/diretorio${query}`);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('assinante busca com filtros e página; o card só tem o perfil público', async () => {
    const { body } = await search(
      '?uf=PR&cidade=Curitiba&area=Família&pagina=2',
      'token-assinante',
    ).expect(200);
    expect(calls[0]).toEqual({
      filters: { state: 'PR', city: 'Curitiba', area: 'Família' },
      limit: 13,
      offset: 12,
    });
    expect(body).toEqual({ members: [ana], page: 2, hasMore: false });
    expect(Object.keys(body.members[0]).sort()).toEqual(
      ['areas', 'bio', 'city', 'displayName', 'id', 'links', 'state'].sort(),
    );
  });

  it('sem sessão 401; sem assinatura 403 (inclusive equipe sem acesso pago)', async () => {
    await search('').expect(401);
    const denied = await search('', 'token-visitante').expect(403);
    expect(denied.body.message).toBe('subscription_required');
    await search('', 'token-comercial').expect(403);
    expect(calls).toHaveLength(0);
  });

  it('filtro inválido 400 sem ecoar o valor; página além do limite também', async () => {
    const { body } = await search('?uf=XX&cidade=C', 'token-assinante').expect(400);
    expect(Object.keys(body.fields).sort()).toEqual(['cidade', 'uf']);
    expect(JSON.stringify(body)).not.toContain('XX');
    await search('?pagina=51', 'token-assinante').expect(400);
    expect(calls).toHaveLength(0);
  });

  it(`rate limit próprio: ${DIRECTORY_SEARCHES_PER_MINUTE} buscas por minuto, depois 429`, async () => {
    // Os testes acima já gastaram parte da cota desta rota; completa até o limite.
    let status = 200;
    for (let i = 0; i <= DIRECTORY_SEARCHES_PER_MINUTE && status !== 429; i += 1) {
      status = (await search('', 'token-assinante')).status;
    }
    expect(status).toBe(429);
  });
});
