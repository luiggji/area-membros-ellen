-- CF-031 · Perfil só do titular; consentimento só de versão publicada, com histórico imutável.
begin;
select plan(17);

select ok(tests.create_user('ana') is not null, 'cria a usuária A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o usuário B (fictício)');

select ok(
  exists (select 1 from public.user_profiles where id = tests.user_id('ana')),
  'perfil nasce com o cadastro'
);

-- Documentos de teste (rascunho e publicado), criados como a API faria.
insert into public.policy_versions (kind, version, title, body_md, status, published_at)
values
  ('terms', '0.1', 'Termos (rascunho de teste)', 'texto fictício', 'draft', null),
  ('privacy', '1.0', 'Privacidade (publicada de teste)', 'texto fictício', 'published', now());
-- Id do rascunho resolvido aqui: como A não o enxerga, o teste tenta aceitá-lo pelo id.
create temporary table rascunho as select id from public.policy_versions where kind = 'terms';
grant select on rascunho to authenticated;

-- Perfil: titular lê e edita; B não vê nem altera; anônimo não lê.
select tests.authenticate_as('ana');
select lives_ok(
  $$ update public.user_profiles
     set name = 'Ana Teste', city = 'Ourinhos', state = 'SP', professional_stage = 'solo'
     where id = tests.user_id('ana') $$,
  'A edita o próprio perfil'
);
select results_eq(
  $$ select name, state from public.user_profiles $$,
  $$ values ('Ana Teste', 'SP') $$,
  'A lê só o próprio perfil'
);
select throws_ok(
  $$ update public.user_profiles set state = 'XX' where id = tests.user_id('ana') $$,
  '23514', null, 'UF fora da lista é recusada'
);

select tests.authenticate_as('bruno');
select is_empty($$ select * from public.user_profiles where id = tests.user_id('ana') $$,
  'B não lê o perfil de A');
select lives_ok(
  $$ update public.user_profiles set name = 'Invadido' where id = tests.user_id('ana') $$,
  'update de B roda, mas não atinge o perfil de A (conferido no fim)'
);

select tests.authenticate_as_anon();
select throws_ok($$ select * from public.user_profiles $$, '42501', null, 'anônimo não lê perfis');

-- Rascunho não aparece nem pode ser aceito; publicado aparece e pode.
select is_empty($$ select * from public.policy_versions where status = 'draft' $$,
  'rascunho não é público');

select tests.authenticate_as('ana');
select throws_ok(
  $$ insert into public.consents (user_id, policy_version_id)
     select tests.user_id('ana'), id from rascunho $$,
  '42501', null, 'A não aceita versão em rascunho, nem sabendo o id'
);
select lives_ok(
  $$ insert into public.consents (user_id, policy_version_id)
     select tests.user_id('ana'), id from public.policy_versions where kind = 'privacy' $$,
  'A aceita a versão publicada'
);
select throws_ok(
  $$ update public.consents set accepted_at = now() - interval '1 year' $$,
  '42501', null, 'data do aceite não pode ser alterada'
);
select lives_ok($$ update public.consents set revoked_at = now() $$, 'A revoga o próprio aceite');
select throws_ok(
  $$ update public.consents set revoked_at = now() $$,
  '42501', null, 'revogação é única (histórico imutável)'
);

select tests.authenticate_as('bruno');
select is_empty($$ select * from public.consents $$, 'B não vê os aceites de A');

-- No fim, o perfil de A segue intacto.
select tests.as_service();
select results_eq(
  $$ select name from public.user_profiles where id = tests.user_id('ana') $$,
  $$ values ('Ana Teste') $$,
  'perfil de A intacto depois da tentativa de B'
);

select * from finish();
rollback;
