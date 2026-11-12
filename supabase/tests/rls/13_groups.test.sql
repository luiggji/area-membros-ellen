-- CF-092 · Grupos temáticos: o membro vê só os publicados; rascunho e oculto não existem para
-- ele, nem pelo identificador direto (IDOR). Visitante não vê nada e ninguém grava pela API
-- pública — escrever é só da API (service_role), pelo `save_group`.
begin;
select plan(12);

select ok(tests.create_user('ana') is not null, 'cria a assinante A (fictícia)');
select ok(tests.create_user('carla') is not null, 'cria a operadora comercial C (fictícia)');
insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');

insert into public.groups (slug, name, description, status) values
  ('advocacia-solo', 'Advocacia Solo', 'Quem atua sozinho.', 'published'),
  ('em-preparo', 'Em preparo', null, 'draft'),
  ('encerrado', 'Encerrado', null, 'hidden');

select tests.authenticate_as('ana');
select results_eq(
  $$ select slug from public.groups order by slug $$,
  $$ values ('advocacia-solo'::text) $$,
  'membro vê só os grupos publicados'
);
select is_empty(
  $$ select 1 from public.groups where slug in ('em-preparo', 'encerrado') $$,
  'rascunho e oculto não existem para o membro, nem pelo identificador direto'
);
select throws_ok(
  $$ insert into public.groups (slug, name) values ('forjado', 'Forjado') $$,
  '42501', null, 'membro não cria grupo'
);
select throws_ok(
  $$ update public.groups set status = 'published' $$,
  '42501', null, 'membro não publica grupo'
);
select throws_ok($$ delete from public.groups $$, '42501', null, 'membro não apaga grupo');

select tests.authenticate_as('carla');
select results_eq(
  $$ select slug from public.groups order by slug $$,
  $$ values ('advocacia-solo'::text) $$,
  'comercial não enxerga mais grupos que um membro'
);

select tests.authenticate_as_anon();
select throws_ok($$ select 1 from public.groups $$, '42501', null, 'visitante não lê grupos');

-- Limites da tabela, que valem para qualquer chamador (inclusive a API).
select tests.as_service();
select throws_ok(
  $$ insert into public.groups (slug, name) values ('Advocacia Solo', 'X') $$,
  '23514', null, 'identificador fora do formato é recusado'
);
select throws_ok(
  $$ insert into public.groups (slug, name, status) values ('arquivo', 'X', 'arquivado') $$,
  '23514', null, 'situação fora das três previstas é recusada'
);
select throws_ok(
  $$ insert into public.groups (slug, name) values ('advocacia-solo', 'Duplicado') $$,
  '23505', null, 'identificador é único'
);

select * from finish();
rollback;
