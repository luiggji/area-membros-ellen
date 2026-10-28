import 'reflect-metadata';

import { Role } from '@caixa-forte/contracts';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import {
  CONTENT_ADMIN_STORE,
  ContentAdminStore,
} from '../src/modules/learning/application/content-admin';
import { configureApp } from '../src/shared/http/configure-app';

const USERS: Record<string, { id: string; roles: Role[]; aal: 'aal1' | 'aal2' }> = {
  'token-owner': { id: '00000000-0000-4000-8000-000000000041', roles: ['owner'], aal: 'aal2' },
  'token-owner-sem-mfa': {
    id: '00000000-0000-4000-8000-000000000041',
    roles: ['owner'],
    aal: 'aal1',
  },
  'token-comercial': {
    id: '00000000-0000-4000-8000-000000000042',
    roles: ['commercial'],
    aal: 'aal2',
  },
  'token-membro': { id: '00000000-0000-4000-8000-000000000043', roles: ['member'], aal: 'aal2' },
};
const COURSE = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const MODULE = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

const state = { calls: [] as unknown[][] };
const store: ContentAdminStore = {
  tree: async () => ({ courses: [] }),
  createCourse: async (input) => {
    state.calls.push(['createCourse', input]);
    return input.slug === 'ja-existe' ? { status: 'duplicate' } : { status: 'ok', id: COURSE };
  },
  updateCourse: async (id, input) => {
    state.calls.push(['updateCourse', id, input]);
    return id === COURSE ? { status: 'ok', id } : { status: 'not_found' };
  },
  createModule: async (courseId, input) => {
    state.calls.push(['createModule', courseId, input]);
    return courseId === COURSE ? { status: 'ok', id: MODULE } : { status: 'not_found' };
  },
  updateModule: async (id, input) => {
    state.calls.push(['updateModule', id, input]);
    return id === MODULE ? { status: 'ok', id } : { status: 'not_found' };
  },
};

describe('Editor de conteúdo: cursos e módulos (CF-081, e2e)', () => {
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
      .overrideProvider(CONTENT_ADMIN_STORE)
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
      [method](`/api/v1/admin/conteudo${path}`)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  it('owner cria curso (endereço normalizado); endereço repetido: 409', async () => {
    await send('post', '/cursos', 'token-owner', {
      title: 'Gestão do escritório',
      slug: 'Gestao-Do-Escritorio',
      summary: '',
    }).expect(201, { id: COURSE });
    expect(state.calls[0]).toEqual([
      'createCourse',
      { title: 'Gestão do escritório', slug: 'gestao-do-escritorio', summary: '' },
    ]);
    const dup = await send('post', '/cursos', 'token-owner', {
      title: 'Outro',
      slug: 'ja-existe',
      summary: '',
    }).expect(409);
    expect(dup.body.message).toBe('course_slug_taken');
  });

  it('owner agenda curso com data; agendado sem data: 400; curso inexistente: 404', async () => {
    const body = {
      title: 'Gestão',
      summary: '',
      orderIndex: 1,
      status: 'scheduled',
      publishAt: '2026-11-03T12:00:00.000Z',
    };
    await send('patch', `/cursos/${COURSE}`, 'token-owner', body).expect(200, { id: COURSE });
    const semData = await send('patch', `/cursos/${COURSE}`, 'token-owner', {
      ...body,
      publishAt: null,
    }).expect(400);
    expect(semData.body.fields.publishAt).toBe('Agendado precisa de data.');
    await send('patch', `/cursos/${MODULE}`, 'token-owner', body).expect(404);
  });

  it('owner cria e publica módulo; módulo em curso inexistente: 404', async () => {
    await send('post', `/cursos/${COURSE}/modulos`, 'token-owner', { title: 'Módulo 1' }).expect(
      201,
      { id: MODULE },
    );
    await send('patch', `/modulos/${MODULE}`, 'token-owner', {
      title: 'Módulo 1',
      orderIndex: 0,
      status: 'published',
      publishAt: null,
    }).expect(200);
    await send('post', `/cursos/${MODULE}/modulos`, 'token-owner', { title: 'X1' }).expect(404);
  });

  it('comercial e membro: 403; owner sem MFA: 403 mfa_required; sem token: 401; nada gravado', async () => {
    const body = { title: 'Curso', slug: 'curso', summary: '' };
    await send('post', '/cursos', 'token-comercial', body).expect(403);
    await send('post', '/cursos', 'token-membro', body).expect(403);
    const semMfa = await send('post', '/cursos', 'token-owner-sem-mfa', body).expect(403);
    expect(semMfa.body.message).toBe('mfa_required');
    await request(app.getHttpServer()).get('/api/v1/admin/conteudo').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/admin/conteudo')
      .set('Authorization', 'Bearer token-comercial')
      .expect(403);
    expect(state.calls).toEqual([]);
  });
});
