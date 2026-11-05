#!/usr/bin/env node
// Depois do `next build`: nenhuma rota de /app ou /admin pode ser pré-renderizada (CF-152).
// Página estática não recebe o nonce da CSP e fica com o JavaScript bloqueado em produção.
// Uso: node scripts/check-private-dynamic.mjs [caminho/do/prerender-manifest.json]
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PRIVATE = /^\/(app|admin)(\/|$)/;

/** Rotas privadas encontradas entre as pré-renderizadas do manifesto. */
export function staticPrivateRoutes(manifest) {
  return Object.keys(manifest.routes ?? {}).filter((route) => PRIVATE.test(route));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const file = process.argv[2] ?? '.next/prerender-manifest.json';
  const offenders = staticPrivateRoutes(JSON.parse(readFileSync(file, 'utf8')));
  if (offenders.length) {
    console.error(
      `✖ Rotas privadas pré-renderizadas (ficariam sem nonce): ${offenders.join(', ')}.\n` +
        '  Use uma API dinâmica no layout (ex.: await connection()) — ver src/app/app/layout.tsx.',
    );
    process.exit(1);
  }
  console.log('✔ /app e /admin só com renderização dinâmica (CSP com nonce)');
}
