#!/usr/bin/env node
// Regras das migrations (supabase/README.md, docs/runbooks/migrations.md — CF-016).
// Uso: node .github/scripts/check-migrations.mjs [pasta]   (padrão: supabase/migrations)
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const NAME_PATTERN = /^(\d{14})_[a-z0-9]+(_[a-z0-9]+)*\.sql$/;

// Comandos que apagam dado ou estrutura. Só passam com aprovação registrada no próprio arquivo.
const DESTRUCTIVE = [
  /\bdrop\s+table\b/i,
  /\bdrop\s+schema\b/i,
  /\bdrop\s+column\b/i,
  /\btruncate\b/i,
  /\bdelete\s+from\b/i,
  /\balter\s+column\s+\w+\s+(set\s+data\s+)?type\b/i,
];
const APPROVAL = /^--\s*destrutiva-aprovada:\s*#\d+/im;

/** Sem comentários: `-- drop table` em texto explicativo não conta como comando. */
function stripComments(sql) {
  return sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
}

/** Erros de um arquivo de migration (nome + conteúdo). */
export function checkMigration(name, sql) {
  const errors = [];
  if (!NAME_PATTERN.test(name)) {
    errors.push(`${name}: nome fora do padrão <AAAAMMDDHHMMSS>_<descricao_em_snake_case>.sql`);
  }
  const code = stripComments(sql);
  if (/\bdisable\s+row\s+level\s+security\b/i.test(code)) {
    errors.push(`${name}: desligar RLS é proibido (PRD §8, regra 2 do supabase/README.md)`);
  }
  if (DESTRUCTIVE.some((pattern) => pattern.test(code)) && !APPROVAL.test(sql)) {
    errors.push(
      `${name}: comando destrutivo sem "-- destrutiva-aprovada: #<issue>" (expand/contract, runbook de migrations)`,
    );
  }
  return errors;
}

/** Erros da pasta inteira: cada arquivo + timestamps únicos. */
export function checkMigrationsDir(dir) {
  const files = readdirSync(dir).filter((file) => file.endsWith('.sql'));
  const errors = files.flatMap((file) =>
    checkMigration(file, readFileSync(path.join(dir, file), 'utf8')),
  );
  const seen = new Map();
  for (const file of files) {
    const stamp = NAME_PATTERN.exec(file)?.[1];
    if (!stamp) continue;
    if (seen.has(stamp)) errors.push(`${file}: timestamp repetido com ${seen.get(stamp)}`);
    seen.set(stamp, file);
  }
  return { files, errors };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const dir = process.argv[2] ?? 'supabase/migrations';
  const { files, errors } = checkMigrationsDir(dir);
  if (errors.length) {
    console.error(errors.map((error) => `✖ ${error}`).join('\n'));
    process.exit(1);
  }
  console.log(`✔ ${files.length} migration(s) dentro das regras`);
}
