-- CF-093 · As duas funções que a API usa para montar a comunidade do membro: a lista de grupos
-- (com contagem real e a própria participação) e o feed. Só a API as executa.
begin;
select plan(10);

do $$
begin
  perform tests.create_user('ana');
  perform tests.create_user('bruno');
  perform tests.create_user('sem_nome');
end;
$$;

insert into public.groups (slug, name, status) values
  ('advocacia-solo', 'Advocacia Solo', 'published'),
  ('gestao', 'Gestão e Finanças', 'published'),
  ('em-preparo', 'Em preparo', 'draft');

insert into public.group_members (group_id, user_id)
select id, tests.user_id('ana') from public.groups where slug = 'advocacia-solo';
insert into public.group_members (group_id, user_id)
select id, tests.user_id('bruno') from public.groups where slug = 'advocacia-solo';

-- Nome de exibição só para a Ana; quem não preencheu aparece como "Membro". O perfil já nasce
-- junto com a conta, então aqui é atualização.
update public.user_profiles set name = 'Ana Advogada' where id = tests.user_id('ana');

insert into public.posts (group_id, author_id, body, status, created_at)
select id, tests.user_id('ana'), 'Publicação mais antiga', 'published', now() - interval '2 hours'
from public.groups where slug = 'advocacia-solo';
insert into public.posts (group_id, author_id, body, status, created_at)
select id, tests.user_id('sem_nome'), 'Publicação mais nova', 'published', now()
from public.groups where slug = 'advocacia-solo';
insert into public.posts (group_id, author_id, body, status)
select id, tests.user_id('ana'), 'Ocultada pela moderação', 'hidden'
from public.groups where slug = 'advocacia-solo';
insert into public.posts (group_id, author_id, body)
select id, tests.user_id('bruno'), 'De um grupo onde a Ana não entrou'
from public.groups where slug = 'gestao';

-- O schema `tests` é fechado para a service_role, então os ids saem daqui a partir de agora.
create temporary table alvo as
select tests.user_id('ana') as ana,
       tests.user_id('bruno') as bruno,
       tests.user_id('sem_nome') as sem_nome;
grant select on alvo to service_role, anon, authenticated;

set local role service_role;

select results_eq(
  $$ select slug, member_count, joined
     from public.member_groups((select ana from alvo)) $$,
  $$ values ('advocacia-solo'::text, 2::bigint, true),
            ('gestao'::text, 0::bigint, false) $$,
  'lista só grupos publicados, em ordem alfabética, com contagem real e a própria participação'
);
select is(
  (select count(*) from public.member_groups((select ana from alvo)) where slug = 'em-preparo'),
  0::bigint,
  'grupo em rascunho não aparece para o membro'
);
select results_eq(
  $$ select joined from public.member_groups((select bruno from alvo))
     where slug = 'advocacia-solo' $$,
  $$ values (true) $$,
  'a participação é a de quem pediu, não a de outra pessoa'
);

select results_eq(
  $$ select body, author_name, group_slug from public.member_feed((select ana from alvo)) $$,
  $$ values ('Publicação mais nova'::text, 'Membro'::text, 'advocacia-solo'::text),
            ('Publicação mais antiga'::text, 'Ana Advogada'::text, 'advocacia-solo'::text) $$,
  'feed traz só o grupo em que entrou, mais recentes primeiro, com o nome de quem escreveu'
);
select is_empty(
  $$ select 1 from public.member_feed((select ana from alvo))
     where body = 'Ocultada pela moderação' $$,
  'publicação ocultada pela moderação não entra no feed'
);
select is_empty(
  $$ select 1 from public.member_feed((select ana from alvo))
     where body = 'De um grupo onde a Ana não entrou' $$,
  'publicação de grupo alheio não entra no feed'
);
select is(
  (select count(*) from public.member_feed((select ana from alvo), 1)),
  1::bigint,
  'o limite pedido é respeitado'
);
select is(
  (select count(*) from public.member_feed((select sem_nome from alvo))),
  0::bigint,
  'quem não entrou em grupo nenhum tem feed vazio'
);

reset role;

select tests.authenticate_as('ana');
select throws_ok(
  $$ select 1 from public.member_groups((select ana from alvo)) $$,
  '42501', null, 'membro não executa a função direto'
);
select tests.authenticate_as_anon();
select throws_ok(
  $$ select 1 from public.member_feed((select ana from alvo)) $$,
  '42501', null, 'visitante não executa a função direto'
);

select * from finish();
rollback;
