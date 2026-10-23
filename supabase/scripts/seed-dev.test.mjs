// node --test supabase/scripts/seed-dev.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { PERSONAS, SEED_DOMAIN, seedRoles, seedTarget, seedUsers } from './seed-dev.mjs';

const jwt = (payload) =>
  ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join(
    '.',
  );

const env = {
  APP_ENV: 'development',
  SUPABASE_URL: 'https://abcdefghijklmnopqrst.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'sb_secret_ficticia',
  SEED_USER_PASSWORD: 'SenhaDeTeste123',
};

test('aceita dev e staging com chave secreta e senha forte', () => {
  assert.equal(seedTarget(env).url, env.SUPABASE_URL);
  assert.equal(seedTarget({ ...env, APP_ENV: 'staging' }).password, env.SEED_USER_PASSWORD);
  assert.ok(seedTarget({ ...env, SUPABASE_SERVICE_ROLE_KEY: jwt({ role: 'service_role' }) }));
});

test('recusa produção, por APP_ENV ou pelo ref do projeto', () => {
  assert.throws(() => seedTarget({ ...env, APP_ENV: 'production' }), /só roda em/);
  assert.throws(
    () => seedTarget({ ...env, SUPABASE_PRODUCTION_REF: 'abcdefghijklmnopqrst' }),
    /projeto de produção/,
  );
});

test('recusa configuração incompleta ou chave pública no lugar da secreta', () => {
  assert.throws(() => seedTarget({ ...env, SUPABASE_URL: '' }), /preencha/);
  assert.throws(
    () => seedTarget({ ...env, SUPABASE_SERVICE_ROLE_KEY: jwt({ role: 'anon' }) }),
    /não é a chave secreta/,
  );
  assert.throws(() => seedTarget({ ...env, SEED_USER_PASSWORD: 'curta' }), /SEED_USER_PASSWORD/);
  assert.throws(
    () => seedTarget({ ...env, SEED_USER_PASSWORD: 'semdigitoAQUI' }),
    /SEED_USER_PASSWORD/,
  );
});

test('mensagens de erro não ecoam valores das variáveis', () => {
  try {
    seedTarget({ ...env, SUPABASE_SERVICE_ROLE_KEY: 'sb_publishable_valor-que-nao-pode-vazar' });
    assert.fail('deveria recusar');
  } catch (error) {
    assert.doesNotMatch(error.message, /valor-que-nao-pode-vazar/);
  }
});

test('todas as personas são fictícias, no domínio de teste', () => {
  for (const { email } of PERSONAS) assert.ok(email.endsWith(`@${SEED_DOMAIN}`), email);
});

test('cria as personas com e-mail confirmado e trata e-mail existente como sucesso', async () => {
  const calls = [];
  const fakeFetch = async (url, init) => {
    const body = JSON.parse(init.body);
    calls.push({ url, body, headers: init.headers });
    return body.email === PERSONAS[0].email
      ? new Response(JSON.stringify({ error_code: 'email_exists' }), { status: 422 })
      : new Response('{}', { status: 200 });
  };
  const results = await seedUsers(seedTarget(env), fakeFetch);

  assert.equal(calls.length, PERSONAS.length);
  assert.equal(calls[0].url, `${env.SUPABASE_URL}/auth/v1/admin/users`);
  assert.equal(calls[1].body.email_confirm, true);
  assert.equal(calls[1].body.app_metadata.seed_persona, PERSONAS[1].persona);
  assert.equal(calls[0].headers.authorization, undefined, 'sb_secret_ não vai no Bearer');
  assert.deepEqual(
    results.map((r) => r.status),
    ['já existia', ...PERSONAS.slice(1).map(() => 'criado')],
  );
});

test('usa Bearer quando a chave secreta é JWT (formato legado)', async () => {
  let headers;
  const key = jwt({ role: 'service_role' });
  await seedUsers(seedTarget({ ...env, SUPABASE_SERVICE_ROLE_KEY: key }), async (_url, init) => {
    headers = init.headers;
    return new Response('{}');
  });
  assert.equal(headers.authorization, `Bearer ${key}`);
});

test('falha com o status quando o Auth recusa por outro motivo', async () => {
  await assert.rejects(
    seedUsers(
      seedTarget(env),
      async () => new Response(JSON.stringify({ error_code: 'not_admin' }), { status: 403 }),
    ),
    /HTTP 403 not_admin/,
  );
});

test('semeia só os papéis da equipe (member vem do cadastro), com upsert idempotente', async () => {
  const calls = [];
  const users = PERSONAS.map(({ email }, index) => ({ email, id: `id-${index}` }));
  const fakeFetch = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.includes('/auth/v1/admin/users')) return new Response(JSON.stringify({ users }));
    return new Response(null, { status: 201 });
  };
  const results = await seedRoles(seedTarget(env), fakeFetch);

  assert.deepEqual(
    results.map(({ email, role }) => [email, role]),
    [
      [`owner@${SEED_DOMAIN}`, 'owner'],
      [`comercial@${SEED_DOMAIN}`, 'commercial'],
      [`tecnico@${SEED_DOMAIN}`, 'tech'],
    ],
  );
  const inserts = calls.filter(({ url }) => url.endsWith('/rest/v1/user_roles'));
  assert.equal(inserts.length, 3);
  assert.match(inserts[0].init.headers.prefer, /ignore-duplicates/);
  assert.deepEqual(JSON.parse(inserts[0].init.body), { user_id: 'id-0', role: 'owner' });
});

test('papel sem a tabela user_roles aponta para a migration', async () => {
  const users = PERSONAS.map(({ email }, index) => ({ email, id: `id-${index}` }));
  await assert.rejects(
    seedRoles(seedTarget(env), async (url) =>
      url.includes('/auth/v1/')
        ? new Response(JSON.stringify({ users }))
        : new Response(JSON.stringify({ code: 'PGRST205' }), { status: 404 }),
    ),
    /aplique a migration user_roles/,
  );
});

test('pessoa de teste ausente falha com orientação, sem conceder nada', async () => {
  let inserts = 0;
  await assert.rejects(
    seedRoles(seedTarget(env), async (url) => {
      if (url.includes('/rest/v1/')) inserts += 1;
      return new Response(JSON.stringify({ users: [] }));
    }),
    /rode o seed de usuários/,
  );
  assert.equal(inserts, 0);
});
