-- CF-084 · Progresso: cada pessoa lê só o próprio; papel de equipe não enxerga o de ninguém;
-- ninguém grava pela API pública (nem o próprio, nem o de outro); visitante não lê nada; apagar a
-- aula leva o progresso junto.
begin;
select plan(12);

select ok(tests.create_user('ana') is not null, 'cria a membro A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o membro B (fictício)');
select ok(tests.create_user('carla') is not null, 'cria a operadora comercial C (fictícia)');

create temporary table ids (lesson_id uuid) on commit drop;
grant select on ids to authenticated, anon, service_role;

do $$
declare c uuid; m uuid; l uuid;
begin
  insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');
  insert into public.courses (slug, title, status) values ('curso-progresso', 'Curso', 'published') returning id into c;
  insert into public.course_modules (course_id, title, status) values (c, 'Módulo', 'published') returning id into m;
  insert into public.lessons (module_id, title, status, is_free) values (m, 'Aula', 'published', true) returning id into l;
  insert into ids values (l);
  insert into public.lesson_progress (user_id, lesson_id, last_position_seconds, completed_at) values
    (tests.user_id('ana'), l, 120, now()),
    (tests.user_id('bruno'), l, 30, null);
end;
$$;

select tests.authenticate_as('ana');
select results_eq(
  $$ select last_position_seconds from public.lesson_progress $$,
  array[120],
  'A vê só o próprio progresso'
);
select throws_ok(
  $$ update public.lesson_progress set completed_at = now() $$,
  '42501', null, 'A não grava progresso direto (nem o próprio)'
);
select throws_ok(
  $$ insert into public.lesson_progress (user_id, lesson_id) select tests.user_id('bruno'), lesson_id from ids $$,
  '42501', null, 'A não cria progresso em nome de B'
);
select throws_ok(
  $$ delete from public.lesson_progress $$,
  '42501', null, 'A não apaga progresso'
);

select tests.authenticate_as('bruno');
select results_eq(
  $$ select last_position_seconds from public.lesson_progress $$,
  array[30],
  'B vê só o próprio progresso'
);

select tests.authenticate_as('carla');
select is_empty($$ select 1 from public.lesson_progress $$, 'comercial não vê progresso de membros');
select throws_ok(
  $$ update public.lesson_progress set last_position_seconds = 0 $$,
  '42501', null, 'comercial não altera progresso'
);

select tests.authenticate_as_anon();
select throws_ok($$ select 1 from public.lesson_progress $$, '42501', null, 'visitante não lê progresso');

select tests.as_service();
delete from public.lessons where id = (select lesson_id from ids);
select is_empty($$ select 1 from public.lesson_progress $$, 'apagar a aula leva o progresso junto');

select * from finish();
rollback;
