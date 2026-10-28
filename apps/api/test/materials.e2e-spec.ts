import 'reflect-metadata';

import { Role } from '@caixa-forte/contracts';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { FILE_STORAGE, FileStorage } from '../src/modules/files/application/file-storage';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import {
  MATERIAL_STORE,
  MaterialRow,
  MaterialStore,
} from '../src/modules/materials/application/materials';
import { ACCESS_READER } from '../src/modules/membership/application/ports';
import { configureApp } from '../src/shared/http/configure-app';

const USERS: Record<string, { id: string; roles: Role[]; aal: 'aal1' | 'aal2' }> = {
  'token-owner': { id: '00000000-0000-4000-8000-000000000071', roles: ['owner'], aal: 'aal2' },
  'token-owner-sem-mfa': {
    id: '00000000-0000-4000-8000-000000000071',
    roles: ['owner'],
    aal: 'aal1',
  },
  'token-comercial': {
    id: '00000000-0000-4000-8000-000000000072',
    roles: ['commercial'],
    aal: 'aal2',
  },
  'token-assinante': { id: '00000000-0000-4000-8000-000000000073', roles: ['member'], aal: 'aal1' },
  'token-visitante': { id: '00000000-0000-4000-8000-000000000074', roles: ['member'], aal: 'aal1' },
};
const ID = '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e';
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const material: MaterialRow = {
  id: ID,
  title: 'Modelo de contrato',
  description: null,
  subject: 'Contratos',
  version: '1',
  license: null,
  revisedOn: null,
  course: null,
  storageKey: `${ID}.pdf`,
  fileName: 'Modelo.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 5,
  status: 'published',
  publishedAt: '2026-10-21T12:00:00.000Z',
};

const state = { head: PDF, removed: [] as string[], created: [] as unknown[] };
const store: MaterialStore = {
  list: async () => [material],
  create: async (input) => {
    state.created.push(input);
    return { id: ID };
  },
  setStatus: async (id) => id === ID,
  softDelete: async (id) => (id === ID ? { storageKey: material.storageKey, title: 't' } : null),
};
const storage: FileStorage = {
  uploadUrl: async (key) => `https://storage.test/envio/${key}`,
  inspect: async () => ({
    sizeBytes: state.head.length,
    mimeType: 'application/pdf',
    head: state.head,
  }),
  signedUrl: async () => 'https://storage.test/assinado',
  remove: async (key) => {
    state.removed.push(key);
  },
};

describe('Cofre de materiais (CF-085, e2e)', () => {
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
      .overrideProvider(ACCESS_READER)
      .useValue({
        accessOf: async (userId: string) =>
          userId === USERS['token-assinante']!.id
            ? { source: 'subscription', subscriptionStatus: 'active', validUntil: null }
            : null,
      })
      .overrideProvider(MATERIAL_STORE)
      .useValue(store)
      .overrideProvider(FILE_STORAGE)
      .useValue(storage)
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
    state.head = PDF;
    state.removed = [];
    state.created = [];
  });

  afterAll(async () => {
    await app.close();
  });

  const call = (method: 'get' | 'post' | 'patch' | 'delete', path: string, token?: string) => {
    const req = request(app.getHttpServer())[method](`/api/v1${path}`);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('assinante vê os materiais e recebe link de 60 s; nada de chave do arquivo na lista', async () => {
    const { body } = await call('get', '/materiais', 'token-assinante').expect(200);
    expect(body.canDownload).toBe(true);
    expect(body.materials[0]).toMatchObject({ title: 'Modelo de contrato', kind: 'PDF' });
    expect(JSON.stringify(body)).not.toContain(material.storageKey);
    const link = await call('post', `/materiais/${ID}/download`, 'token-assinante').expect(200);
    expect(link.body.url).toBe('https://storage.test/assinado');
  });

  it('sem assinatura: vê a lista, não baixa (403); sem sessão: 401; inexistente: 404', async () => {
    const { body } = await call('get', '/materiais', 'token-visitante').expect(200);
    expect(body.canDownload).toBe(false);
    const denied = await call('post', `/materiais/${ID}/download`, 'token-visitante').expect(403);
    expect(denied.body.message).toBe('subscription_required');
    await call('get', '/materiais').expect(401);
    await call('post', `/materiais/${ID}/download`).expect(401);
    await call(
      'post',
      '/materiais/6f7a8b9c-0d1e-4f2a-8b3c-4d5e6f7a8b9c/download',
      'token-assinante',
    ).expect(404);
  });

  it('owner envia em dois passos: link de uso único e conferência do arquivo enviado', async () => {
    const prepared = await call('post', '/admin/materiais/envios', 'token-owner')
      .send({ fileName: 'Modelo.pdf', mimeType: 'application/pdf', sizeBytes: 5 })
      .expect(200);
    expect(prepared.body.key).toMatch(/^[0-9a-f-]{36}\.pdf$/);
    expect(prepared.body.uploadUrl).toContain(prepared.body.key);

    await call('post', '/admin/materiais', 'token-owner')
      .send({
        key: prepared.body.key,
        fileName: 'Modelo.pdf',
        title: 'Modelo de contrato',
        description: '',
        subject: 'Contratos',
        version: '1',
        license: '',
        revisedOn: '2026-10-20',
        courseId: null,
      })
      .expect(201, { id: ID });
    expect(state.created[0]).toMatchObject({ sizeBytes: 5, revisedOn: '2026-10-20' });
  });

  it('envio recusado: tipo fora da lista antes; conteúdo falso depois (arquivo apagado)', async () => {
    const html = await call('post', '/admin/materiais/envios', 'token-owner')
      .send({ fileName: 'a.html', mimeType: 'text/html', sizeBytes: 5 })
      .expect(400);
    expect(html.body.fields.mimeType).toBeDefined();

    state.head = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
    const fake = await call('post', '/admin/materiais', 'token-owner')
      .send({
        key: `${ID}.pdf`,
        fileName: 'virus.pdf',
        title: 'Falso',
        description: '',
        subject: 'X1',
        version: '1',
        license: '',
        revisedOn: null,
        courseId: null,
      })
      .expect(400);
    expect(fake.body.message).toBe('upload_content_mismatch');
    expect(state.removed).toEqual([`${ID}.pdf`]);
    expect(state.created).toEqual([]);
  });

  it('owner publica e exclui (arquivo sai do bucket); inexistente: 404', async () => {
    await call('patch', `/admin/materiais/${ID}`, 'token-owner')
      .send({ status: 'published' })
      .expect(200);
    await call('delete', `/admin/materiais/${ID}`, 'token-owner').expect(200);
    expect(state.removed).toEqual([`${ID}.pdf`]);
    await call(
      'delete',
      '/admin/materiais/6f7a8b9c-0d1e-4f2a-8b3c-4d5e6f7a8b9c',
      'token-owner',
    ).expect(404);
  });

  it('comercial e assinante: 403; owner sem MFA: 403 mfa_required; nada gravado', async () => {
    const body = { fileName: 'a.pdf', mimeType: 'application/pdf', sizeBytes: 5 };
    await call('post', '/admin/materiais/envios', 'token-comercial').send(body).expect(403);
    await call('post', '/admin/materiais/envios', 'token-assinante').send(body).expect(403);
    const noMfa = await call('post', '/admin/materiais/envios', 'token-owner-sem-mfa')
      .send(body)
      .expect(403);
    expect(noMfa.body.message).toBe('mfa_required');
    await call('delete', `/admin/materiais/${ID}`, 'token-assinante').expect(403);
    expect(state.removed).toEqual([]);
  });
});
