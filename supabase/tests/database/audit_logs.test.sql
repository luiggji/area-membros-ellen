-- CF-161 · audit_logs: só a API grava, ninguém altera nem apaga, e a API pública não lê.
begin;
select plan(13);

select has_table('public', 'audit_logs', 'tabela audit_logs existe');

-- A API (service_role) grava uma entrada.
set local role service_role;
select lives_ok(
  $$ insert into public.audit_logs (actor_id, actor_role, action, target_type, target_id, after)
     values (gen_random_uuid(), 'owner', 'price_version.created', 'price_version', 'pv-1',
             '{"amount_cents": 8900}') $$,
  'service_role grava uma entrada'
);
select lives_ok(
  $$ insert into public.audit_logs (actor_role, action, target_type)
     values ('system', 'webhook.received', 'webhook') $$,
  'entrada de sistema, sem ator e sem alvo específico'
);

-- Append-only, inclusive para a service_role.
select throws_ok(
  $$ update public.audit_logs set action = 'price_version.deleted' $$,
  '42501', null, 'service_role não altera entradas'
);
select throws_ok(
  $$ delete from public.audit_logs $$,
  '42501', null, 'service_role não apaga entradas'
);
reset role;

-- Nem o dono da tabela (postgres) altera, apaga ou trunca.
select throws_ok(
  $$ update public.audit_logs set target_id = 'x' $$,
  '42501', 'audit_logs é append-only: UPDATE não é permitido', 'postgres não altera (trigger)'
);
select throws_ok(
  $$ delete from public.audit_logs $$,
  '42501', 'audit_logs é append-only: DELETE não é permitido', 'postgres não apaga (trigger)'
);
select throws_ok(
  $$ truncate public.audit_logs $$,
  '42501', 'audit_logs é append-only: TRUNCATE não é permitido', 'postgres não trunca (trigger)'
);

-- Formatos validados no banco.
select throws_ok(
  $$ insert into public.audit_logs (actor_role, action, target_type)
     values ('owner', 'Preço Alterado', 'price_version') $$,
  '23514', null, 'action fora do padrão <recurso>.<verbo> é recusada'
);
select throws_ok(
  $$ insert into public.audit_logs (actor_role, action, target_type)
     values ('hacker', 'price_version.created', 'price_version') $$,
  '23514', null, 'papel desconhecido é recusado'
);

-- API pública: anônimo e logado não leem nem gravam.
select ok(tests.create_user('curiosa') is not null, 'cria usuária fictícia');
select tests.authenticate_as_anon();
select throws_ok(
  $$ select * from public.audit_logs $$,
  '42501', null, 'anônimo não lê a trilha'
);
select tests.authenticate_as('curiosa');
select throws_ok(
  $$ insert into public.audit_logs (actor_role, action, target_type)
     values ('member', 'price_version.created', 'price_version') $$,
  '42501', null, 'usuário logado não grava na trilha'
);

select * from finish();
rollback;
