#!/usr/bin/env node
// Bucket privado de materiais no Supabase Storage de dev/staging (CF-162), pela API do Storage.
// Uso: pnpm storage:setup   (lê apps/api/.env). Idempotente: cria o bucket ou reaplica a
// configuração (privado, limite de tamanho, tipos aceitos). Produção: pelo pipeline (CF-015).
//
// A especificação vem de `MATERIALS_BUCKET` (@caixa-forte/contracts), a mesma que a API usa para
// validar o upload. Nenhuma mensagem imprime valores das variáveis.
import { fileURLToPath } from 'node:url';

import { adminHeaders, seedTarget } from './seed-dev.mjs';

/** Mesmo destino aceito pelo seed (dev/staging, chave secreta, nunca produção), sem exigir senha. */
export function storageTarget(env) {
  return seedTarget({ ...env, SEED_USER_PASSWORD: 'NaoUsadaAqui1' });
}

/** Corpo da API do Storage a partir da especificação do bucket. */
export function bucketBody(spec) {
  return {
    id: spec.id,
    name: spec.id,
    public: false,
    file_size_limit: spec.maxBytes,
    allowed_mime_types: Object.keys(spec.types),
  };
}

export async function setupBucket({ url, serviceKey }, spec, fetchFn = fetch) {
  const headers = adminHeaders(serviceKey);
  const body = JSON.stringify(bucketBody(spec));
  const created = await fetchFn(`${url}/storage/v1/bucket`, { method: 'POST', headers, body });
  let status = 'criado';
  if (!created.ok) {
    // Já existe: reaplica a configuração (inclusive volta a privado, se alguém abriu).
    const updated = await fetchFn(`${url}/storage/v1/bucket/${spec.id}`, {
      method: 'PUT',
      headers,
      body,
    });
    if (!updated.ok)
      throw new Error(`falha ao configurar o bucket ${spec.id}: HTTP ${updated.status}`);
    status = 'atualizado';
  }
  const check = await fetchFn(`${url}/storage/v1/bucket/${spec.id}`, { headers });
  const bucket = check.ok ? await check.json() : null;
  if (!bucket || bucket.public !== false) {
    throw new Error(`o bucket ${spec.id} não está privado depois da configuração`);
  }
  return {
    id: spec.id,
    status,
    maxBytes: bucket.file_size_limit,
    types: bucket.allowed_mime_types,
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { MATERIALS_BUCKET } = await import('../../packages/contracts/dist/storage.js');
    const result = await setupBucket(storageTarget(process.env), MATERIALS_BUCKET);
    console.log(
      `Bucket ${result.id} (APP_ENV=${process.env.APP_ENV || 'development'}): ${result.status}, privado`,
    );
    console.log(
      `  limite: ${Math.round(result.maxBytes / 1024 / 1024)} MiB · tipos: ${result.types.length}`,
    );
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
