-- CF-032 · user_roles: papel base automático, cada um lê só os próprios papéis, ninguém se
-- promove pela API pública e toda concessão/revogação fica em audit_logs.
begin;
select plan(11);

select ok(tests.create_user('ana') is not null, 'cria a usuária A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o usuário B (fictício)');

-- Cadastro já nasce member, e isso é auditado como ação do sistema.
select results_eq(
  $$ select role from public.user_roles where user_id = tests.user_id('ana') $$,
  $$ values ('member') $$,
  'todo cadastro nasce com o papel member'
);
select ok(
  exists (
    select 1 from public.audit_logs
    where action = 'user_role.granted' and actor_role = 'system'
      and target_id = tests.user_id('ana')::text
  ),
  'papel base registrado em audit_logs como ação do sistema'
);

-- A lê só os próprios papéis (não vê os de B).
select tests.authenticate_as('ana');
select results_eq(
  $$ select user_id from public.user_roles $$,
  $$ select tests.user_id('ana') $$,
  'A lê só os próprios papéis'
);

-- Ninguém se promove nem se rebaixa pela API pública.
select throws_ok(
  $$ insert into public.user_roles (user_id, role) values (tests.user_id('ana'), 'owner') $$,
  '42501', null, 'A não se concede owner'
);
select throws_ok(
  $$ delete from public.user_roles where user_id = tests.user_id('ana') $$,
  '42501', null, 'A não remove papéis'
);

select tests.authenticate_as_anon();
select throws_ok($$ select * from public.user_roles $$, '42501', null, 'anônimo não lê papéis');

-- A API (service_role) concede e revoga; as duas ações ficam na trilha com o autor.
select tests.as_service();
set local role service_role;
insert into public.user_roles (user_id, role, granted_by)
values (tests.user_id('bruno'), 'commercial', tests.user_id('ana'));
delete from public.user_roles where user_id = tests.user_id('bruno') and role = 'commercial';
reset role;

select results_eq(
  $$ select action, actor_id from public.audit_logs
     where target_type = 'user_role' and target_id = tests.user_id('bruno')::text
       and coalesce(after, before) = '{"role": "commercial"}'
     order by happened_at, action $$,
  $$ values ('user_role.granted', tests.user_id('ana')), ('user_role.revoked', tests.user_id('ana')) $$,
  'concessão e revogação auditadas com o autor'
);

select throws_ok(
  $$ insert into public.user_roles (user_id, role) values (tests.user_id('bruno'), 'admin') $$,
  '23514', null, 'papel fora do catálogo é recusado'
);

select results_eq(
  $$ select role from public.user_roles where user_id = tests.user_id('bruno') $$,
  $$ values ('member') $$,
  'B segue só com o papel base'
);

select * from finish();
rollback;
