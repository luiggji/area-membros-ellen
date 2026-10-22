import 'reflect-metadata';

import { Controller, Get, INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, it } from '@jest/globals';

import { validateEnv } from '../src/shared/config/env';
import { RequireFeature } from '../src/shared/http/feature-flag.guard';

@RequireFeature('community')
@Controller('exemplo-comunidade')
class CommunityExampleController {
  @Get()
  list() {
    return { ok: true };
  }
}

@Controller('exemplo-eventos')
class EventsExampleController {
  @Get()
  @RequireFeature('events')
  list() {
    return { ok: true };
  }

  @Get('aberto')
  open() {
    return { ok: true };
  }
}

describe('Feature flags na API (CF-158, e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          // Dev liga tudo por padrão; aqui a comunidade é desligada pelo override.
          validate: () => validateEnv({ APP_ENV: 'development', FEATURE_FLAGS: '-community' }),
        }),
      ],
      controllers: [CommunityExampleController, EventsExampleController],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('módulo desligado responde 404, como rota inexistente', async () => {
    await request(app.getHttpServer()).get('/exemplo-comunidade').expect(404);
  });

  it('módulo ligado responde normalmente (flag na rota)', async () => {
    await request(app.getHttpServer()).get('/exemplo-eventos').expect(200, { ok: true });
  });

  it('rota sem flag não é afetada', async () => {
    await request(app.getHttpServer()).get('/exemplo-eventos/aberto').expect(200);
  });
});
