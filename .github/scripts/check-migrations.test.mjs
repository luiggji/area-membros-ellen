// node --test .github/scripts/check-migrations.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkMigration } from './check-migrations.mjs';

const ok = '20261020180000_fundacao.sql';

test('aceita migration aditiva com nome no padrão', () => {
  assert.deepEqual(checkMigration(ok, 'create table public.x (id uuid primary key);'), []);
});

test('recusa nome fora do padrão', () => {
  assert.equal(checkMigration('fundacao.sql', 'select 1;').length, 1);
  assert.equal(checkMigration('20261020_Fundacao.sql', 'select 1;').length, 1);
});

test('recusa comando destrutivo sem aprovação registrada', () => {
  for (const sql of [
    'drop table public.x;',
    'alter table public.x drop column nome;',
    'truncate public.x;',
    'delete from public.x;',
    'alter table public.x alter column nome type text;',
  ]) {
    assert.equal(checkMigration(ok, sql).length, 1, sql);
  }
});

test('aceita destrutiva com aprovação e ignora comandos citados em comentário', () => {
  assert.deepEqual(checkMigration(ok, '-- destrutiva-aprovada: #123\ndrop table public.x;'), []);
  assert.deepEqual(checkMigration(ok, '-- nunca usar drop table aqui\nselect 1;'), []);
});

test('proíbe desligar RLS, mesmo com aprovação', () => {
  const sql = '-- destrutiva-aprovada: #1\nalter table public.x disable row level security;';
  assert.equal(checkMigration(ok, sql).length, 1);
});
