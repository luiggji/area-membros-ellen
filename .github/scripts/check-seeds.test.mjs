// node --test .github/scripts/check-seeds.test.mjs
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { checkSeed } from './check-seeds.mjs';

test('aceita e-mails do domínio fictício', () => {
  assert.deepEqual(checkSeed('a.sql', "insert into x values ('membro@teste.local');"), []);
});

test('recusa e-mail real ou de outro domínio', () => {
  assert.equal(checkSeed('a.sql', "values ('fulana@gmail.com')").length, 1);
  assert.equal(checkSeed('a.mjs', 'email: "x@empresa.com.br"').length, 1);
});

test('recusa CPF com ou sem máscara', () => {
  assert.equal(checkSeed('a.sql', "values ('123.456.789-09')").length, 1);
  assert.equal(checkSeed('a.sql', "values ('12345678909')").length, 1);
});

test('não confunde timestamp de migration nem valores em centavos com CPF', () => {
  assert.deepEqual(checkSeed('a.sql', '-- 20261020180000\nvalues (8900), (79000);'), []);
});
