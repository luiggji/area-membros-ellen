import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import type { IncomingMessage, ServerResponse } from 'node:http';

const express = jest.fn();
const fakeApp = {
  get: jest.fn(() => ({ get: jest.fn() })),
  init: jest.fn(async () => undefined),
  getHttpAdapter: () => ({ getInstance: () => express }),
};
const create = jest.fn<() => Promise<typeof fakeApp>>();

jest.mock('@nestjs/core', () => ({ NestFactory: { create } }));
jest.mock('@nestjs/platform-express', () => ({ ExpressAdapter: class {} }));
jest.mock('./app.module', () => ({ AppModule: class {} }));
jest.mock('./shared/http/configure-app', () => ({
  configureApp: jest.fn(),
  httpOptionsFrom: jest.fn(() => ({ corsOrigins: [], trustProxy: 1, docsEnabled: false })),
}));

const req = {} as IncomingMessage;
const res = {} as ServerResponse;

describe('entrada serverless da API', () => {
  beforeEach(() => {
    jest.resetModules();
    create.mockReset();
    express.mockReset();
  });

  it('sobe o Nest uma vez e reaproveita nas próximas requisições', async () => {
    create.mockResolvedValue(fakeApp);
    const { handler } = await import('./serverless.js');
    await handler(req, res);
    await handler(req, res);
    expect(create).toHaveBeenCalledTimes(1);
    expect(fakeApp.init).toHaveBeenCalled();
    expect(express).toHaveBeenCalledTimes(2);
    expect(express).toHaveBeenCalledWith(req, res);
  });

  it('se a inicialização falhar, a próxima requisição tenta de novo', async () => {
    create.mockRejectedValueOnce(new Error('env inválido')).mockResolvedValue(fakeApp);
    const { handler } = await import('./serverless.js');
    await expect(handler(req, res)).rejects.toThrow('env inválido');
    await handler(req, res);
    expect(create).toHaveBeenCalledTimes(2);
    expect(express).toHaveBeenCalledTimes(1);
  });
});
