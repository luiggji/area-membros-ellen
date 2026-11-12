-- CF-093 · Participação e feed: cada pessoa vê só a própria participação e só as publicações dos
-- grupos em que entrou — e nada disso sem acesso pago vigente (CF-046). Matriz da doc F/CF-033:
-- titular, outro membro, anônimo, assinatura expirada e operadora comercial.
begin;
select plan(21);

select ok(tests.create_user('ana') is not null, 'assinante A, participa do grupo A');
select ok(tests.create_user('bruno') is not null, 'assinante B, participa de outro grupo');
select ok(tests.create_user('expirada') is not null, 'assinante com acesso vencido');
select ok(tests.create_user('carla') is not null, 'operadora comercial, sem assinatura');

insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');

-- Acesso vigente para A e B; vencido ontem para a terceira. A comercial não ganha acesso: papel
-- de equipe não dá conteúdo pago (PRD CF-02).
insert into public.entitlements (user_id, source, reason, valid_to) values
  (tests.user_id('ana'), 'manual', 'teste', now() + interval '30 days'),
  (tests.user_id('bruno'), 'manual', 'teste', now() + interval '30 days');
insert into public.entitlements (user_id, source, reason, valid_from, valid_to)
values (tests.user_id('expirada'), 'manual', 'teste', now() - interval '60 days',
        now() - interval '1 day');

insert into public.groups (slug, name, status) values
  ('advocacia-solo', 'Advocacia Solo', 'published'),
  ('gestao', 'Gestão e Finanças', 'published');

insert into public.group_members (group_id, user_id)
select id, tests.user_id('ana') from public.groups where slug = 'advocacia-solo';
insert into public.group_members (group_id, user_id)
select id, tests.user_id('expirada') from public.groups where slug = 'advocacia-solo';
insert into public.group_members (group_id, user_id)
select id, tests.user_id('bruno') from public.groups where slug = 'gestao';

insert into public.posts (group_id, author_id, body, status)
select id, tests.user_id('ana'), 'Como vocês organizam a agenda da semana?', 'published'
from public.groups where slug = 'advocacia-solo';
insert into public.posts (group_id, author_id, body, status)
select id, tests.user_id('ana'), 'Publicação ocultada pela moderação.', 'hidden'
from public.groups where slug = 'advocacia-solo';

-- Titular ---------------------------------------------------------------------------------------
select tests.authenticate_as('ana');
select results_eq(
  $$ select g.slug from public.group_members m join public.groups g on g.id = m.group_id
     order by g.slug $$,
  $$ values ('advocacia-solo'::text) $$,
  'vê só a própria participação, nunca a de outra pessoa'
);
select results_eq(
  $$ select body from public.posts $$,
  $$ values ('Como vocês organizam a agenda da semana?'::text) $$,
  'lê as publicações do grupo em que entrou'
);
select is_empty(
  $$ select 1 from public.posts where status = 'hidden' $$,
  'publicação ocultada pela moderação some para todo mundo, inclusive o autor'
);
select throws_ok(
  $$ insert into public.group_members (group_id, user_id)
     values ((select id from public.groups where slug = 'gestao'), tests.user_id('ana')) $$,
  '42501', null, 'membro não entra em grupo pela API pública'
);
select throws_ok(
  $$ delete from public.group_members $$, '42501', null, 'membro não sai pela API pública'
);
select throws_ok(
  $$ insert into public.posts (group_id, author_id, body)
     values ((select id from public.groups where slug = 'advocacia-solo'), tests.user_id('ana'),
             'forjado') $$,
  '42501', null, 'membro não publica direto na tabela'
);

-- Outro membro ------------------------------------------------------------------------------------
select tests.authenticate_as('bruno');
select is_empty(
  $$ select 1 from public.posts $$,
  'quem não entrou no grupo não lê as publicações dele'
);
select results_eq(
  $$ select g.slug from public.group_members m join public.groups g on g.id = m.group_id $$,
  $$ values ('gestao'::text) $$,
  'cada pessoa enxerga apenas o próprio vínculo'
);

-- Assinatura vencida --------------------------------------------------------------------------
select tests.authenticate_as('expirada');
select is_empty(
  $$ select 1 from public.group_members $$,
  'acesso vencido não lê nem a própria participação'
);
select is_empty(
  $$ select 1 from public.posts $$,
  'acesso vencido não lê publicação do grupo em que estava'
);

-- Comercial ---------------------------------------------------------------------------------------
select tests.authenticate_as('carla');
select is_empty(
  $$ select 1 from public.group_members $$,
  'comercial não enxerga a participação de ninguém'
);
select is_empty($$ select 1 from public.posts $$, 'comercial não lê publicações');

-- Visitante ---------------------------------------------------------------------------------------
select tests.authenticate_as_anon();
select throws_ok(
  $$ select 1 from public.group_members $$, '42501', null, 'visitante não lê participações'
);
select throws_ok($$ select 1 from public.posts $$, '42501', null, 'visitante não lê publicações');

-- Limites da tabela, válidos para qualquer chamador (inclusive a API) ---------------------------
select tests.as_service();
select throws_ok(
  $$ insert into public.posts (group_id, author_id, body)
     values ((select id from public.groups where slug = 'gestao'), tests.user_id('bruno'), '   ') $$,
  '23514', null, 'publicação sem texto é recusada'
);
select throws_ok(
  $$ insert into public.posts (group_id, author_id, body, status)
     values ((select id from public.groups where slug = 'gestao'), tests.user_id('bruno'), 'oi',
             'arquivado') $$,
  '23514', null, 'situação fora de published/hidden é recusada'
);
select throws_ok(
  $$ insert into public.group_members (group_id, user_id)
     values ((select id from public.groups where slug = 'gestao'), tests.user_id('bruno')) $$,
  '23505', null, 'participação é única por grupo e pessoa'
);

select * from finish();
rollback;
