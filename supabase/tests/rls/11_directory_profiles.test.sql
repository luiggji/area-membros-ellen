-- CF-090 · Perfil público do diretório: só o titular lê e edita o próprio; outro membro, comercial
-- e visitante não veem nada direto (a busca é pela API, CF-091); regras de áreas e links; o
-- titular não liga mais `directory_opt_in` sozinho (presença vem do aceite do termo).
begin;
select plan(13);

select ok(tests.create_user('ana') is not null, 'cria a membro A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o membro B (fictício)');
select ok(tests.create_user('carla') is not null, 'cria a operadora comercial C (fictícia)');
insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');

select tests.authenticate_as('ana');
select lives_ok(
  $$ insert into public.directory_profiles (user_id, display_name, city, state, areas, links)
     values (auth.uid(), 'Ana Fictícia', 'Curitiba', 'PR', array['Família', 'Sucessões'],
             array['https://exemplo.test/ana']) $$,
  'A cria o próprio perfil público'
);
select results_eq(
  $$ select display_name from public.directory_profiles $$,
  array['Ana Fictícia'],
  'A lê o próprio perfil público'
);
select throws_ok(
  $$ update public.user_profiles set directory_opt_in = true $$,
  '42501', null, 'A não liga directory_opt_in direto (presença vem do aceite do termo)'
);
select lives_ok(
  $$ update public.user_profiles set city = 'Curitiba' where id = auth.uid() $$,
  'A continua editando o perfil pessoal'
);

select tests.authenticate_as('bruno');
select is_empty($$ select 1 from public.directory_profiles $$, 'B não lê o perfil público de A direto');
select throws_ok(
  $$ insert into public.directory_profiles (user_id, display_name) values (tests.user_id('ana'), 'Forjado') $$,
  '42501', null, 'B não cria perfil público em nome de A'
);

select tests.authenticate_as('carla');
select is_empty($$ select 1 from public.directory_profiles $$, 'comercial não lê perfis públicos direto');

select tests.authenticate_as_anon();
select throws_ok($$ select 1 from public.directory_profiles $$, '42501', null, 'visitante não lê perfis públicos');

select tests.as_service();
select throws_ok(
  $$ update public.directory_profiles set areas = array['a1', 'a2', 'a3', 'a4', 'a5', 'a6'] $$,
  '23514', null, 'no máximo 5 áreas de atuação'
);
select throws_ok(
  $$ update public.directory_profiles set links = array['javascript:alert(1)'] $$,
  '23514', null, 'link só https'
);

select * from finish();
rollback;
