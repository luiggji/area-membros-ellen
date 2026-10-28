import 'reflect-metadata';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import { CATALOG_READER, CatalogReader } from '../src/modules/learning/application/catalog';
import { configureApp } from '../src/shared/http/configure-app';

const MEMBER = '00000000-0000-4000-8000-000000000051';
const DAY = 86_400_000;
const future = new Date(Date.now() + 7 * DAY).toISOString();
const created = '2026-10-01T00:00:00.000Z';

const row = (slug: string, status: string, publishAt: string | null, orderIndex: number) => ({
  slug,
  title: `Curso ${slug}`,
  summary: null,
  track: null,
  status,
  publishAt,
  orderIndex,
  createdAt: created,
});
const rows = [
  row('gestao', 'published', null, 0),
  row('em-breve', 'scheduled', future, 1),
  row('rascunho', 'draft', null, 2),
];
const reader: CatalogReader = {
  courses: async () => rows,
  course: async (slug) => {
    const course = rows.find((r) => r.slug === slug);
    return course ? { ...course, modules: [] } : null;
  },
};

describe('Catálogo do membro (CF-082, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ACCESS_TOKEN_VERIFIER)
      .useValue({
        verify: async (token: string) =>
          token === 'token-membro' ? { userId: MEMBER, aal: 'aal1' } : null,
      })
      .overrideProvider(ROLE_REPOSITORY)
      .useValue({ rolesOf: async () => ['member'] })
      .overrideProvider(CATALOG_READER)
      .useValue(reader)
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

  const get = (path: string, token?: string) => {
    const req = request(app.getHttpServer()).get(`/api/v1${path}`);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('membro logado vê disponível e programado (com data); rascunho não aparece', async () => {
    const { body } = await get('/cursos', 'token-membro').expect(200);
    expect(body.courses).toEqual([
      {
        slug: 'gestao',
        title: 'Curso gestao',
        summary: null,
        availability: 'available',
        availableAt: null,
      },
      {
        slug: 'em-breve',
        title: 'Curso em-breve',
        summary: null,
        availability: 'scheduled',
        availableAt: future,
      },
    ]);
  });

  it('página do curso: disponível 200; rascunho, inexistente e endereço inválido: 404', async () => {
    await get('/cursos/gestao', 'token-membro').expect(200);
    await get('/cursos/rascunho', 'token-membro').expect(404);
    await get('/cursos/nao-existe', 'token-membro').expect(404);
    await get('/cursos/..%2Fadmin', 'token-membro').expect(404);
  });

  it('sem sessão: 401', async () => {
    await get('/cursos').expect(401);
    await get('/cursos/gestao').expect(401);
  });
});
