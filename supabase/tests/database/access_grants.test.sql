-- CF-048 · Concessão manual: trilha automática, acesso concedido imutável (só revogação) e
-- funções de apoio só para a API (service_role).
begin;
select plan(16);

do $$
begin
  perform tests.create_user('ellen');
  perform tests.create_user('ana');
  perform tests.create_user('nao_confirmada');
  update auth.users set email_confirmed_at = now() where email = 'ana@teste.local';
  insert into public.user_roles (user_id, role) values (tests.user_id('ellen'), 'owner');
  insert into public.entitlements (user_id, source, reason, valid_to, granted_by)
  values (tests.user_id('ana'), 'manual', 'cortesia de teste', now() + interval '30 days', tests.user_id('ellen'));
end;
$$;

create temporary table alvo as
select tests.user_id('ellen') as ellen, tests.user_id('ana') as ana,
  (select id from public.entitlements where user_id = tests.user_id('ana')) as concessao;
grant select on alvo to service_role;

-- Trilha da concessão
select results_eq(
  $$ select actor_id, actor_role, action, after->>'reason'
     from public.audit_logs where target_type = 'entitlement' and target_id = (select concessao::text from alvo) $$,
  $$ select ellen, 'owner'::text, 'entitlement.granted'::text, 'cortesia de teste'::text from alvo $$,
  'concessão registra quem concedeu, motivo e ação na trilha'
);

-- Imutável, inclusive para a API (service_role): só revogar, uma vez.
set local role service_role;
select throws_ok(
  $$ update public.entitlements set valid_to = now() + interval '10 years' where id = (select concessao from alvo) $$,
  '23514', null, 'prorrogar sem nova concessão é recusado'
);
select throws_ok(
  $$ update public.entitlements set reason = 'outro motivo' where id = (select concessao from alvo) $$,
  '23514', null, 'trocar o motivo é recusado'
);
select lives_ok(
  $$ update public.entitlements set revoked_at = now(), revoked_by = (select ellen from alvo)
     where id = (select concessao from alvo) $$,
  'revogar é permitido'
);
select throws_ok(
  $$ update public.entitlements set revoked_at = null where id = (select concessao from alvo) $$,
  '23514', null, 'desfazer a revogação é recusado'
);
reset role;

select results_eq(
  $$ select actor_id, action from public.audit_logs
     where target_id = (select concessao::text from alvo) and action = 'entitlement.revoked' $$,
  $$ select ellen, 'entitlement.revoked'::text from alvo $$,
  'revogação registra quem revogou'
);
select is(
  (select count(*)::int from public.audit_logs where target_id = (select concessao::text from alvo)),
  2, 'trilha tem só a concessão e a revogação'
);
select is(private.has_access((select ana from alvo)), false, 'revogada: sem acesso');

-- Apoio à API
select is(public.user_id_by_email(' ANA@teste.local '), (select ana from alvo), 'acha a conta confirmada pelo e-mail, sem diferenciar caixa');
select is(public.user_id_by_email('nao_confirmada@teste.local'), null, 'conta sem e-mail confirmado não recebe concessão');
select is(public.user_id_by_email('ninguem@teste.local'), null, 'e-mail desconhecido: nulo');

set local role service_role;
select results_eq(
  $$ select member_email, revoked_at is not null from public.manual_access_grants() $$,
  $$ values ('ana@teste.local'::text, true) $$,
  'API (service_role) lista concessões com o e-mail da pessoa'
);
reset role;

select tests.authenticate_as('ana');
select throws_ok($$ select public.user_id_by_email('ana@teste.local') $$, '42501', null, 'membro não procura pessoas por e-mail');
select throws_ok($$ select * from public.manual_access_grants() $$, '42501', null, 'membro não lista concessões');
select tests.authenticate_as_anon();
select throws_ok($$ select public.user_id_by_email('ana@teste.local') $$, '42501', null, 'visitante não procura pessoas por e-mail');
select throws_ok($$ select * from public.manual_access_grants() $$, '42501', null, 'visitante não lista concessões');

select * from finish();
rollback;
