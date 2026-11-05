// node --test supabase/scripts/storage-setup.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { bucketBody, setupBucket, storageTarget } from './storage-setup.mjs';

const env = {
  APP_ENV: 'development',
  SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_ficticia',
};
const spec = { id: 'materiais', maxBytes: 1024, types: { 'application/pdf': ['pdf'] } };
const target = storageTarget(env);

function fakeFetch(responses) {
  const calls = [];
  const fn = async (url, init = {}) => {
    calls.push([init.method ?? 'GET', url.replace(env.SUPABASE_URL, '')]);
    const { status, body } = responses.shift();
    return { ok: status < 300, status, json: async () => body };
  };
  return { fn, calls };
}

test('bucket sempre privado, com limite e tipos da especificação', () => {
  assert.deepEqual(bucketBody(spec), {
    id: 'materiais',
    name: 'materiais',
    public: false,
    file_size_limit: 1024,
    allowed_mime_types: ['application/pdf'],
  });
});

test('recusa produção, ambiente desconhecido e chave que não é a secreta', () => {
  assert.throws(() => storageTarget({ ...env, APP_ENV: 'production' }), /só roda em/);
  assert.throws(
    () => storageTarget({ ...env, SUPABASE_PRODUCTION_REF: 'abcdefghijklmnopqrst' }),
    /produção/,
  );
  assert.throws(
    () => storageTarget({ ...env, SUPABASE_SERVICE_ROLE_KEY: 'sb_publishable_x' }),
    /secreta/,
  );
});

test('cria o bucket e confere que ficou privado', async () => {
  const { fn, calls } = fakeFetch([
    { status: 200, body: {} },
    {
      status: 200,
      body: { public: false, file_size_limit: 1024, allowed_mime_types: ['application/pdf'] },
    },
  ]);
  const result = await setupBucket(target, spec, fn);
  assert.equal(result.status, 'criado');
  assert.deepEqual(calls, [
    ['POST', '/storage/v1/bucket'],
    ['GET', '/storage/v1/bucket/materiais'],
  ]);
});

test('já existe: reaplica a configuração (idempotente)', async () => {
  const { fn, calls } = fakeFetch([
    { status: 400, body: { error: 'Duplicate' } },
    { status: 200, body: {} },
    { status: 200, body: { public: false, file_size_limit: 1024, allowed_mime_types: [] } },
  ]);
  assert.equal((await setupBucket(target, spec, fn)).status, 'atualizado');
  assert.deepEqual(calls[1], ['PUT', '/storage/v1/bucket/materiais']);
});

test('falha alto se o bucket continuar público', async () => {
  const { fn } = fakeFetch([
    { status: 200, body: {} },
    { status: 200, body: { public: true } },
  ]);
  await assert.rejects(setupBucket(target, spec, fn), /não está privado/);
});
