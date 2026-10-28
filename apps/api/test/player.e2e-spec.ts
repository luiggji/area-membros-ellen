import 'reflect-metadata';

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

import { AppModule } from '../src/app.module';
import { ACCESS_TOKEN_VERIFIER, ROLE_REPOSITORY } from '../src/modules/identity/application/ports';
import {
  LESSON_READER,
  LessonRecord,
  MEDIA_TOKENS,
  VIDEO_PROVIDER,
} from '../src/modules/learning/application/player';
import { HmacMediaTokens } from '../src/modules/learning/infrastructure/hmac-media-tokens';
import { ACCESS_READER } from '../src/modules/membership/application/ports';
import { configureApp } from '../src/shared/http/configure-app';

const SUBSCRIBER = '00000000-0000-4000-8000-000000000061';
const VISITOR = '00000000-0000-4000-8000-000000000062';
const PAID = '4d5e6f7a-8b9c-4d0e-8f1a-2b3c4d5e6f7a';
const OPEN = '5e6f7a8b-9c0d-4e1f-8a2b-3c4d5e6f7a8b';
const published = { status: 'published', publishAt: null };
const lesson = (id: string, isFree: boolean): LessonRecord => ({
  ...published,
  id,
  title: isFree ? 'Aula aberta' : 'Aula paga',
  summary: null,
  kind: 'video',
  durationMinutes: 10,
  isFree,
  bodyMd: '# Texto protegido',
  mediaRef: 'video-1',
  module: { ...published, title: 'Módulo 1' },
  course: { ...published, slug: 'gestao', title: 'Gestão' },
  track: null,
});

const tokens = new HmacMediaTokens(Buffer.alloc(32, 9));
const provider = {
  configured: true,
  playbackUrl: async (ref: string) => `https://provedor.test/${ref}?assinatura=curta`,
};

describe('Player com paywall e vídeo assinado (CF-083, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ACCESS_TOKEN_VERIFIER)
      .useValue({
        verify: async (token: string) =>
          token === 'token-assinante'
            ? { userId: SUBSCRIBER, aal: 'aal1' }
            : token === 'token-visitante'
              ? { userId: VISITOR, aal: 'aal1' }
              : null,
      })
      .overrideProvider(ROLE_REPOSITORY)
      .useValue({ rolesOf: async () => ['member'] })
      .overrideProvider(ACCESS_READER)
      .useValue({
        accessOf: async (userId: string) =>
          userId === SUBSCRIBER
            ? { source: 'subscription', subscriptionStatus: 'active', validUntil: null }
            : null,
      })
      .overrideProvider(LESSON_READER)
      .useValue({
        lesson: async (id: string) =>
          id === PAID ? lesson(PAID, false) : id === OPEN ? lesson(OPEN, true) : null,
      })
      .overrideProvider(VIDEO_PROVIDER)
      .useValue(provider)
      .overrideProvider(MEDIA_TOKENS)
      .useValue(tokens)
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
    provider.configured = true;
  });

  afterAll(async () => {
    await app.close();
  });

  const get = (path: string, token?: string) => {
    const req = request(app.getHttpServer()).get(`/api/v1${path}`);
    return token ? req.set('Authorization', `Bearer ${token}`) : req;
  };

  it('assinante recebe texto e link assinado; o link redireciona ao provedor, sem cache', async () => {
    const { body } = await get(`/aulas/${PAID}`, 'token-assinante').expect(200);
    expect(body).toMatchObject({ access: 'granted', bodyMd: '# Texto protegido' });
    expect(body.video.state).toBe('ready');
    const media = await get(body.video.path).expect(302);
    expect(media.headers.location).toBe('https://provedor.test/video-1?assinatura=curta');
    expect(media.headers['cache-control']).toBe('no-store');
  });

  it('membro sem acesso: só dados públicos da aula, nenhum link; aula aberta libera', async () => {
    const { body } = await get(`/aulas/${PAID}`, 'token-visitante').expect(200);
    expect(body).toMatchObject({ access: 'subscription_required', bodyMd: null, video: null });
    const open = await get(`/aulas/${OPEN}`, 'token-visitante').expect(200);
    expect(open.body).toMatchObject({ access: 'granted', video: { state: 'ready' } });
  });

  it('link vencido: 410; adulterado ou inventado: 401', async () => {
    const expired = tokens.issue(
      { mediaRef: 'video-1', viewerId: SUBSCRIBER },
      new Date(Date.now() - 1000),
    );
    expect((await get(`/midia/${expired}`).expect(410)).body.message).toBe('media_token_expired');
    const valid = tokens.issue(
      { mediaRef: 'video-1', viewerId: SUBSCRIBER },
      new Date(Date.now() + 60_000),
    );
    const [, signature] = valid.split('.');
    const forged = Buffer.from(
      JSON.stringify({ r: 'outro-video', u: VISITOR, e: Date.now() + 60_000 }),
    ).toString('base64url');
    await get(`/midia/${forged}.${signature}`).expect(401);
    await get('/midia/qualquer-coisa').expect(401);
  });

  it('provedor ainda não configurado: vídeo pendente e link responde 503', async () => {
    provider.configured = false;
    const { body } = await get(`/aulas/${PAID}`, 'token-assinante').expect(200);
    expect(body.video).toEqual({ state: 'pending' });
    const valid = tokens.issue(
      { mediaRef: 'video-1', viewerId: SUBSCRIBER },
      new Date(Date.now() + 60_000),
    );
    await get(`/midia/${valid}`).expect(503);
  });

  it('sem sessão: 401; id inválido: 400; aula fora do ar ou inexistente: 404', async () => {
    await get(`/aulas/${PAID}`).expect(401);
    await get('/aulas/nao-e-uuid', 'token-assinante').expect(400);
    await get('/aulas/6f7a8b9c-0d1e-4f2a-8b3c-4d5e6f7a8b9c', 'token-assinante').expect(404);
  });
});
