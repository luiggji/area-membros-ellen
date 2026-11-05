-- CF-080 · Conteúdo: rascunho e agendado futuro invisíveis, cascata trilha → curso → módulo → aula,
-- publicado com data futura espera a data, conteúdo só com acesso pago (ou aula aberta), papel de
-- equipe e concessão revogada não abrem o paywall, ninguém grava pela API pública.
begin;
select plan(18);

select ok(tests.create_user('ana') is not null, 'cria a assinante A (fictícia, com acesso)');
select ok(tests.create_user('bruno') is not null, 'cria o membro B (fictício, sem acesso)');
select ok(tests.create_user('carla') is not null, 'cria a operadora comercial C (fictícia, sem assinatura)');
select ok(tests.create_user('davi') is not null, 'cria D (fictício, com concessão revogada)');

do $$
declare
  t_pub uuid; t_rasc uuid; c_a uuid; m_a1 uuid; m_a2 uuid; l1 uuid; l2 uuid; l3 uuid; l4 uuid; l5 uuid;
begin
  insert into public.entitlements (user_id, source, reason, valid_to)
  values (tests.user_id('ana'), 'manual', 'teste', now() + interval '30 days');
  insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');
  insert into public.entitlements (user_id, source, reason, valid_to, revoked_at)
  values (tests.user_id('davi'), 'manual', 'teste', now() + interval '30 days', now());

  insert into public.tracks (slug, title, status) values ('trilha-publicada', 'Trilha publicada', 'published') returning id into t_pub;
  insert into public.tracks (slug, title, status) values ('trilha-rascunho', 'Trilha rascunho', 'draft') returning id into t_rasc;

  insert into public.courses (track_id, slug, title, status) values (t_pub, 'curso-a', 'Curso A', 'published') returning id into c_a;
  insert into public.courses (track_id, slug, title, status) values (t_pub, 'curso-rascunho', 'Rascunho', 'draft');
  insert into public.courses (track_id, slug, title, status, publish_at) values (t_pub, 'curso-futuro', 'Futuro', 'scheduled', now() + interval '1 day');
  insert into public.courses (slug, title, status, publish_at) values ('curso-chegou', 'Chegou', 'scheduled', now() - interval '1 hour');
  insert into public.courses (track_id, slug, title, status) values (t_rasc, 'curso-em-trilha-rascunho', 'Em trilha rascunho', 'published');
  -- Marcado como publicado, mas com data futura: espera a data.
  insert into public.courses (slug, title, status, publish_at) values ('curso-publicado-futuro', 'Publicado futuro', 'published', now() + interval '1 day');

  insert into public.course_modules (course_id, title, status) values (c_a, 'Módulo publicado', 'published') returning id into m_a1;
  insert into public.course_modules (course_id, title, status) values (c_a, 'Módulo rascunho', 'draft') returning id into m_a2;

  insert into public.lessons (module_id, title, status) values (m_a1, 'Aula paga', 'published') returning id into l1;
  insert into public.lessons (module_id, title, status, is_free) values (m_a1, 'Aula aberta', 'published', true) returning id into l2;
  insert into public.lessons (module_id, title, status) values (m_a1, 'Aula rascunho', 'draft') returning id into l3;
  insert into public.lessons (module_id, title, status) values (m_a2, 'Aula em módulo rascunho', 'published') returning id into l4;
  -- Aula aberta dentro de módulo rascunho: a cascata barra, não o paywall.
  insert into public.lessons (module_id, title, status, is_free) values (m_a2, 'Aula aberta escondida', 'published', true) returning id into l5;

  insert into public.lesson_contents (lesson_id, body_md) values
    (l1, 'conteúdo pago'), (l2, 'conteúdo aberto'), (l3, 'conteúdo rascunho'), (l4, 'conteúdo escondido'),
    (l5, 'conteúdo aberto escondido');
end;
$$;

-- Visitante: nada (catálogo é da área logada).
select tests.authenticate_as_anon();
select throws_ok($$ select 1 from public.courses $$, '42501', null, 'visitante não lê cursos');

-- Membro sem acesso: vê o catálogo visível, mas só o conteúdo da aula aberta.
select tests.authenticate_as('bruno');
select set_eq(
  $$ select slug from public.courses $$,
  array['curso-a', 'curso-chegou'],
  'só cursos publicados ou agendados que já chegaram, e com a trilha visível'
);
select set_eq($$ select title from public.course_modules $$, array['Módulo publicado'], 'módulo rascunho fica fora');
select set_eq(
  $$ select title from public.lessons $$,
  array['Aula paga', 'Aula aberta'],
  'aula rascunho e aula de módulo rascunho ficam fora'
);
select set_eq($$ select body_md from public.lesson_contents $$, array['conteúdo aberto'], 'sem acesso: só o conteúdo da aula aberta');
select throws_ok(
  $$ insert into public.courses (slug, title, status) values ('forjado', 'Forjado', 'published') $$,
  '42501', null, 'membro não cria curso'
);
select throws_ok(
  $$ update public.lessons set is_free = true where title = 'Aula paga' $$,
  '42501', null, 'membro não abre aula paga'
);

-- Papel de equipe não abre paywall; concessão revogada não vale.
select tests.authenticate_as('carla');
select set_eq($$ select body_md from public.lesson_contents $$, array['conteúdo aberto'], 'comercial sem assinatura: só a aula aberta');
select tests.authenticate_as('davi');
select set_eq($$ select body_md from public.lesson_contents $$, array['conteúdo aberto'], 'concessão revogada: só a aula aberta');

-- Assinante: conteúdo das aulas visíveis; rascunho continua fora mesmo com acesso.
select tests.authenticate_as('ana');
select set_eq(
  $$ select body_md from public.lesson_contents $$,
  array['conteúdo pago', 'conteúdo aberto'],
  'com acesso: conteúdo das aulas visíveis, nunca de rascunho'
);
select ok((select private.i_have_access()), 'assinante consulta o próprio acesso');
select throws_ok(
  $$ select private.has_access('00000000-0000-4000-8000-000000000000'::uuid) $$,
  '42501', null, 'ninguém consulta o acesso de outra pessoa pelo schema private'
);

-- Constraints
select tests.as_service();
select throws_ok(
  $$ insert into public.courses (slug, title, status) values ('sem-data', 'Sem data', 'scheduled') $$,
  '23514', null, 'agendado exige data de publicação'
);
select throws_ok(
  $$ insert into public.courses (slug, title) values ('Slug Inválido', 'X') $$,
  '23514', null, 'slug só em minúsculas com hífen'
);

select * from finish();
rollback;
