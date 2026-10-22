#!/usr/bin/env node
// Seeds só com dados FICTÍCIOS (CF-154, supabase/README.md regra 5, LGPD).
// Uso: node .github/scripts/check-seeds.mjs [pastas...]   (padrão: supabase/seeds supabase/scripts)
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ALLOWED_EMAIL_DOMAIN = 'teste.local';
const EMAIL = /[\w.+-]+@([\w-]+(\.[\w-]+)+)/g;
// CPF com ou sem máscara (11 dígitos isolados).
const CPF = /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b|(?<![\d.-])\d{11}(?![\d.-])/;

/** Erros de um arquivo de seed: e-mail fora do domínio de teste ou CPF. */
export function checkSeed(name, content) {
  const errors = [];
  for (const [, domain] of content.matchAll(EMAIL)) {
    if (domain !== ALLOWED_EMAIL_DOMAIN) {
      errors.push(`${name}: e-mail fora do domínio fictício @${ALLOWED_EMAIL_DOMAIN} (@${domain})`);
    }
  }
  if (CPF.test(content)) errors.push(`${name}: parece conter CPF; seeds só com dados fictícios`);
  return errors;
}

export function checkSeedDirs(dirs) {
  return dirs.flatMap((dir) =>
    readdirSync(dir)
      .filter((file) => /\.(sql|mjs|json)$/.test(file))
      .flatMap((file) => checkSeed(file, readFileSync(path.join(dir, file), 'utf8'))),
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dirs = process.argv.slice(2);
  const errors = checkSeedDirs(dirs.length ? dirs : ['supabase/seeds', 'supabase/scripts']);
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('✔ Seeds só com dados fictícios');
}
