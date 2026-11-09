-- CF-091 · Busca no diretório: só aparece quem tem perfil público, aceite ativo do termo publicado
-- e acesso vigente; filtros sem diferenciar maiúsculas e acentos; `%` digitado é texto; paginação
-- estável; membro e visitante não executam a busca direto (só a API, com a chave de serviço).
begin;
select plan(13);

select ok(tests.create_user('ana') is not null, 'cria Ana: perfil, aceite e acesso (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria Bruno: perfil e aceite, sem acesso');
select ok(tests.create_user('carla') is not null, 'cria Carla: perfil e acesso, sem aceite');
select ok(tests.create_user('davi') is not null, 'cria Davi: aceite revogado');
select ok(tests.create_user('eva') is not null, 'cria Eva: perfil, aceite e acesso em SP');

insert into public.policy_versions (kind, version, title, body_md, status, published_at)
values
  ('directory', '1.0', 'Diretório (publicado de teste)', 'texto fictício', 'published', now()),
  ('directory', '0.9', 'Diretório (rascunho de teste)', 'texto fictício', 'draft', null);

insert into public.directory_profiles (user_id, display_name, city, state, areas)
values
  (tests.user_id('ana'), 'Ana Fictícia', 'Curitiba', 'PR', array['Família', 'Sucessões']),
  (tests.user_id('bruno'), 'Bruno Exemplo', 'Curitiba', 'PR', array['Família']),
  (tests.user_id('carla'), 'Carla Teste', 'Curitiba', 'PR', array['Família']),
  (tests.user_id('davi'), 'Davi Fictício', 'Curitiba', 'PR', array['Família']),
  (tests.user_id('eva'), 'Eva Exemplo', 'São Paulo', 'SP', array['Trabalhista']);

insert into public.consents (user_id, policy_version_id, revoked_at)
select tests.user_id(u.name), v.id, u.revoked
from (values ('ana', null::timestamptz), ('bruno', null), ('davi', now()), ('eva', null))
  as u (name, revoked)
cross join public.policy_versions v
where v.kind = 'directory' and v.status = 'published';
-- Aceite de rascunho não conta: Carla "aceitou" a versão que nunca foi publicada.
insert into public.consents (user_id, policy_version_id)
select tests.user_id('carla'), id from public.policy_versions where kind = 'directory' and status = 'draft';

insert into public.entitlements (user_id, source, reason, valid_to)
select tests.user_id(name), 'manual', 'acesso de teste', now() + interval '1 year'
from unnest(array['ana', 'carla', 'davi', 'eva']) as name;

select tests.as_service();
select results_eq(
  $$ select display_name from public.search_directory() $$,
  array['Ana Fictícia', 'Eva Exemplo'],
  'só aparece quem tem aceite ativo do termo publicado e acesso vigente'
);
select results_eq(
  $$ select display_name from public.search_directory(p_state => 'PR', p_area => 'familia') $$,
  array['Ana Fictícia'],
  'UF e área combinadas, área sem acento encontra "Família"'
);
select results_eq(
  $$ select display_name from public.search_directory(p_city => 'SAO PAU') $$,
  array['Eva Exemplo'],
  'cidade por trecho, sem diferenciar maiúsculas e acentos'
);
select results_eq(
  $$ select display_name from public.search_directory(p_name => 'fict') $$,
  array['Ana Fictícia'],
  'nome por trecho'
);
select is_empty(
  $$ select 1 from public.search_directory(p_name => '%') $$,
  '% digitado é texto, não curinga'
);
select results_eq(
  $$ select display_name from public.search_directory(p_limit => 1, p_offset => 1) $$,
  array['Eva Exemplo'],
  'paginação estável pela ordem do nome'
);

select tests.authenticate_as('ana');
select throws_ok(
  $$ select 1 from public.search_directory() $$,
  '42501', null, 'membro não executa a busca direto (só pela API)'
);

select tests.authenticate_as_anon();
select throws_ok(
  $$ select 1 from public.search_directory() $$,
  '42501', null, 'visitante não executa a busca'
);

select * from finish();
rollback;
