import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { Env } from './shared/config/env';
import { API_PREFIX, configureApp } from './shared/http/configure-app';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);
  configureApp(app, config.get('API_CORS_ORIGINS', { infer: true }));

  const port = config.get('API_PORT', { infer: true });
  await app.listen(port);
  Logger.log(`API ouvindo em http://localhost:${port}/${API_PREFIX}`, 'Bootstrap');
}

void bootstrap();
