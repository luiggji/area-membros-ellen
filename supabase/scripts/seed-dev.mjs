#!/usr/bin/env node
// Usuários FICTÍCIOS de teste no Supabase de dev/staging (CF-154), via API de Admin do Auth.
// Uso: pnpm seed:dev   (lê apps/api/.env; precisa de SEED_USER_PASSWORD). Idempotente.
//
// `app_metadata.seed_persona` só identifica a pessoa de teste: NÃO é autorização. O papel real vai
// para `user_roles` (CF-032); `member` já nasce com o cadastro (trigger), então só owner,
// comercial e técnico precisam ser semeados.
import { fileURLToPath } from 'node:url';

export const SEED_DOMAIN = 'teste.local';

export const PERSONAS = [
  {
    persona: 'owner',
    role: 'owner',
    email: `owner@${SEED_DOMAIN}`,
    name: 'Pessoa de teste (owner)',
  },
  {
    persona: 'commercial',
    role: 'commercial',
    email: `comercial@${SEED_DOMAIN}`,
    name: 'Pessoa de teste (comercial)',
  },
  {
    persona: 'tech',
    role: 'tech',
    email: `tecnico@${SEED_DOMAIN}`,
    name: 'Pessoa de teste (técnica)',
  },
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
export function adminHeaders(serviceKey) {
  return {
    apikey: serviceKey,
    'content-type': 'application/json',
    // Chaves novas (sb_secret_) não são JWT: o gateway aceita só o header apikey.
    ...(isJwt(serviceKey) && { authorization: `Bearer ${serviceKey}` }),
  };
}

export async function seedUsers({ url, serviceKey, password }, fetchFn = fetch) {
  const headers = adminHeaders(serviceKey);
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

/**
 * Papéis da equipe fictícia em `user_roles` (CF-032). Idempotente: papel já concedido é ignorado.
 * Cada concessão vira uma entrada em audit_logs (trigger), como ação do sistema.
 */
export async function seedRoles({ url, serviceKey }, fetchFn = fetch) {
  const headers = adminHeaders(serviceKey);
  const listed = await fetchFn(`${url}/auth/v1/admin/users?per_page=1000`, { headers });
  if (!listed.ok) throw new Error(`falha ao listar usuários: HTTP ${listed.status}`);
  const { users = [] } = await listed.json();
  const idByEmail = new Map(users.map((user) => [user.email, user.id]));

  const results = [];
  for (const { persona, email, role } of PERSONAS.filter((p) => p.role)) {
    const userId = idByEmail.get(email);
    if (!userId) throw new Error(`pessoa de teste ausente: ${email} (rode o seed de usuários)`);
    const response = await fetchFn(`${url}/rest/v1/user_roles`, {
      method: 'POST',
      headers: { ...headers, prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      const hint = body.code === 'PGRST205' ? ' — aplique a migration user_roles (db push)' : '';
      throw new Error(`falha ao conceder ${role} a ${email}: HTTP ${response.status}${hint}`);
    }
    results.push({ persona, email, role });
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
    const roles = await seedRoles(seedTarget(process.env));
    console.log('Papéis (user_roles; member vem do cadastro):');
    for (const { email, role } of roles) console.log(`  ${email.padEnd(24)} ${role}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
