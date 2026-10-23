-- CF-035 · Onboarding grava só no próprio perfil, valida o objetivo e não publica nada.
begin;
select plan(6);

select ok(tests.create_user('ana') is not null, 'cria a usuária A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o usuário B (fictício)');

select tests.authenticate_as('ana');
select lives_ok(
  $$ update public.user_profiles
     set professional_stage = 'iniciante', city = 'Ourinhos', state = 'SP',
         main_goal = 'aprender', onboarding_completed_at = now()
     where id = tests.user_id('ana') $$,
  'A conclui o próprio onboarding'
);
select throws_ok(
  $$ update public.user_profiles set main_goal = 'enriquecer' where id = tests.user_id('ana') $$,
  '23514', null, 'objetivo fora da lista é recusado'
);

select tests.authenticate_as('bruno');
select lives_ok(
  $$ update public.user_profiles set main_goal = 'planejar' where id = tests.user_id('ana') $$,
  'update de B roda, mas não atinge A (conferido abaixo)'
);

select tests.as_service();
select results_eq(
  $$ select main_goal, directory_opt_in from public.user_profiles where id = tests.user_id('ana') $$,
  $$ values ('aprender', false) $$,
  'objetivo de A intacto e diretório continua desligado após o onboarding'
);

select * from finish();
rollback;
