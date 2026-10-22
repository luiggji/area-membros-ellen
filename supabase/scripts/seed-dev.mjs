#!/usr/bin/env node
// Usuários FICTÍCIOS de teste no Supabase de dev/staging (CF-154), via API de Admin do Auth.
// Uso: pnpm seed:dev   (lê apps/api/.env; precisa de SEED_USER_PASSWORD). Idempotente.
//
// `app_metadata.seed_persona` só identifica a pessoa de teste: NÃO é autorização. Os papéis reais
// ficam em `user_roles` (CF-032), que semeia o papel de cada e-mail abaixo quando a tabela existir.
import { fileURLToPath } from 'node:url';

export const SEED_DOMAIN = 'teste.local';

export const PERSONAS = [
  { persona: 'owner', email: `owner@${SEED_DOMAIN}`, name: 'Pessoa de teste (owner)' },
  { persona: 'commercial', email: `comercial@${SEED_DOMAIN}`, name: 'Pessoa de teste (comercial)' },
  { persona: 'tech', email: `tecnico@${SEED_DOMAIN}`, name: 'Pessoa de teste (técnica)' },
  { persona: 'member', email: `membro@${SEED_DOMAIN}`, name: 'Pessoa de teste (membro)' },
  {
    persona: 'visitor',
    email: `visitante@${SEED_DOMAIN}`,
    name: 'Pessoa de teste (sem assinatura)',
  },
];

const ALLOWED_ENVS = ['development', 'staging'];

function projectRef(url) {
  const match = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(url);
  return match?.[1];
}

function isJwt(key) {
  return key.split('.').length === 3;
}

function isSecretKey(key) {
  if (key.startsWith('sb_secret_')) return true;
  if (!isJwt(key)) return false;
  try {
    return (
      JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString()).role === 'service_role'
    );
  } catch {
    return false;
  }
}

/** Valida o destino antes de qualquer chamada. Mensagens nunca incluem valores das variáveis. */
export function seedTarget(env) {
  const appEnv = env.APP_ENV || 'development';
  if (!ALLOWED_ENVS.includes(appEnv)) {
    throw new Error(`seed recusado: APP_ENV=${appEnv}; só roda em ${ALLOWED_ENVS.join(' ou ')}`);
  }
  const url = env.SUPABASE_URL?.trim();
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    throw new Error('seed recusado: preencha SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  }
  const ref = projectRef(url);
  if (ref && env.SUPABASE_PRODUCTION_REF && ref === env.SUPABASE_PRODUCTION_REF.trim()) {
    throw new Error('seed recusado: SUPABASE_URL aponta para o projeto de produção');
  }
  if (!isSecretKey(serviceKey)) {
    throw new Error(
      'seed recusado: SUPABASE_SERVICE_ROLE_KEY não é a chave secreta (service_role)',
    );
  }
  const password = env.SEED_USER_PASSWORD ?? '';
  if (
    password.length < 10 ||
    !/[a-z]/.test(password) ||
    !/[A-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    throw new Error(
      'seed recusado: SEED_USER_PASSWORD precisa de 10+ caracteres com maiúscula, minúscula e dígito',
    );
  }
  return { url: url.replace(/\/$/, ''), serviceKey, password };
}

/** Cria cada persona; e-mail já cadastrado conta como sucesso (idempotente). */
export async function seedUsers({ url, serviceKey, password }, fetchFn = fetch) {
  const headers = {
    apikey: serviceKey,
    'content-type': 'application/json',
    // Chaves novas (sb_secret_) não são JWT: o gateway aceita só o header apikey.
    ...(isJwt(serviceKey) && { authorization: `Bearer ${serviceKey}` }),
  };
  const results = [];
  for (const { persona, email, name } of PERSONAS) {
    const response = await fetchFn(`${url}/auth/v1/admin/users`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { name },
        app_metadata: { seed_persona: persona },
      }),
    });
    if (response.ok) {
      results.push({ persona, email, status: 'criado' });
      continue;
    }
    const body = await response.json().catch(() => ({}));
    if (body.error_code === 'email_exists' || /already (been )?registered/i.test(body.msg ?? '')) {
      results.push({ persona, email, status: 'já existia' });
      continue;
    }
    throw new Error(
      `falha ao criar ${email}: HTTP ${response.status} ${body.error_code ?? ''}`.trim(),
    );
  }
  return results;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const results = await seedUsers(seedTarget(process.env));
    console.log(`Seed de usuários fictícios (APP_ENV=${process.env.APP_ENV || 'development'}):`);
    for (const { persona, email, status } of results) {
      console.log(`  ${persona.padEnd(10)} ${email.padEnd(24)} ${status}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
