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
const LESSON = '3c4d5e6f-7a8b-4c9d-8e1f-2a3b4c5d6e7f';

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
  createLesson: async (moduleId, input) => {
    state.calls.push(['createLesson', moduleId, input]);
    return moduleId === MODULE ? { status: 'ok', id: LESSON } : { status: 'not_found' };
  },
  updateLesson: async (id, input) => {
    state.calls.push(['updateLesson', id, input]);
    return id === LESSON ? { status: 'ok', id } : { status: 'not_found' };
  },
  saveLessonContent: async (id, input) => {
    state.calls.push(['saveLessonContent', id, input]);
    return id === LESSON ? { status: 'ok', id } : { status: 'not_found' };
  },
};

describe('Editor de conteúdo: cursos, módulos e aulas (CF-081/CF-172, e2e)', () => {
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

  const send = (method: 'post' | 'patch' | 'put', path: string, token: string, body: object) =>
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

  it('owner cria aula, agenda com data e grava o conteúdo; módulo/aula inexistente: 404', async () => {
    await send('post', `/modulos/${MODULE}/aulas`, 'token-owner', {
      title: 'Aula 1',
      kind: 'video',
    }).expect(201, { id: LESSON });
    const lesson = {
      title: 'Aula 1',
      summary: '',
      kind: 'text',
      durationMinutes: 15,
      isFree: true,
      orderIndex: 2,
      status: 'scheduled',
      publishAt: '2026-11-03T12:00:00.000Z',
    };
    await send('patch', `/aulas/${LESSON}`, 'token-owner', lesson).expect(200, { id: LESSON });
    await send('put', `/aulas/${LESSON}/conteudo`, 'token-owner', {
      bodyMd: ' # Introdução ',
      mediaRef: 'abc123',
    }).expect(200, { id: LESSON });
    expect(state.calls.at(-1)).toEqual([
      'saveLessonContent',
      LESSON,
      { bodyMd: '# Introdução', mediaRef: 'abc123' },
    ]);
    await send('post', `/modulos/${COURSE}/aulas`, 'token-owner', {
      title: 'Aula 2',
      kind: 'video',
    }).expect(404);
    await send('patch', `/aulas/${MODULE}`, 'token-owner', lesson).expect(404);
    await send('put', `/aulas/${MODULE}/conteudo`, 'token-owner', {
      bodyMd: '',
      mediaRef: '',
    }).expect(404);
  });

  it('aula agendada sem data e mídia como link: 400, nada gravado', async () => {
    const semData = await send('patch', `/aulas/${LESSON}`, 'token-owner', {
      title: 'Aula 1',
      summary: '',
      kind: 'video',
      durationMinutes: null,
      isFree: false,
      orderIndex: 0,
      status: 'scheduled',
      publishAt: null,
    }).expect(400);
    expect(semData.body.fields.publishAt).toBe('Agendado precisa de data.');
    const link = await send('put', `/aulas/${LESSON}/conteudo`, 'token-owner', {
      bodyMd: '',
      mediaRef: 'https://video.exemplo/abc',
    }).expect(400);
    expect(link.body.fields.mediaRef).toBeDefined();
    expect(state.calls).toEqual([]);
  });

  it('conteúdo da aula: comercial e membro 403; owner sem MFA 403 mfa_required; nada gravado', async () => {
    const body = { bodyMd: 'Texto', mediaRef: '' };
    await send('put', `/aulas/${LESSON}/conteudo`, 'token-comercial', body).expect(403);
    await send('put', `/aulas/${LESSON}/conteudo`, 'token-membro', body).expect(403);
    const semMfa = await send(
      'put',
      `/aulas/${LESSON}/conteudo`,
      'token-owner-sem-mfa',
      body,
    ).expect(403);
    expect(semMfa.body.message).toBe('mfa_required');
    await send('post', `/modulos/${MODULE}/aulas`, 'token-membro', {
      title: 'Aula',
      kind: 'video',
    }).expect(403);
    expect(state.calls).toEqual([]);
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
