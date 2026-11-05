-- CF-033 · IDOR cruzado: tentativas de B (e de um operador comercial) contra os dados de A em
-- todas as tabelas com dado pessoal, pelo mesmo caminho do PostgREST (role authenticated + JWT).
begin;
select plan(15);

select ok(tests.create_user('ana') is not null, 'cria a usuária A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o usuário B (fictício)');
select ok(tests.create_user('carla') is not null, 'cria a operadora comercial C (fictícia)');

-- Preparação como superusuário: C é comercial; existe uma versão publicada; A já aceitou.
insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');
insert into public.policy_versions (kind, version, title, body_md, status, published_at)
values ('privacy', '1.0', 'Privacidade (teste)', 'texto fictício', 'published', now());
insert into public.consents (user_id, policy_version_id)
select tests.user_id('ana'), id from public.policy_versions where kind = 'privacy';
update public.user_profiles set name = 'Ana Teste', city = 'Ourinhos' where id = tests.user_id('ana');

-- Ids resolvidos antes, para B tentar usá-los diretamente (o ataque clássico de IDOR).
create temporary table alvo as
select
  tests.user_id('ana') as ana,
  tests.user_id('bruno') as bruno,
  (select id from public.consents where user_id = tests.user_id('ana')) as consentimento_ana,
  (select id from public.policy_versions where kind = 'privacy') as versao;
grant select on alvo to authenticated;

select tests.authenticate_as('bruno');

-- user_profiles
select throws_ok(
  $$ insert into public.user_profiles (id, name) select ana, 'Forjado' from alvo $$,
  '42501', null, 'B não cria perfil em nome de A'
);
select throws_ok(
  $$ update public.user_profiles set id = (select ana from alvo) where id = (select bruno from alvo) $$,
  '42501', null, 'B não troca o próprio perfil pelo id de A'
);

-- consents
select throws_ok(
  $$ insert into public.consents (user_id, policy_version_id) select ana, versao from alvo $$,
  '42501', null, 'B não registra aceite em nome de A'
);
select lives_ok(
  $$ update public.consents set revoked_at = now() where id = (select consentimento_ana from alvo) $$,
  'B tenta revogar o aceite de A (não atinge; conferido no fim)'
);
select throws_ok(
  $$ update public.consents set user_id = (select bruno from alvo) where id = (select consentimento_ana from alvo) $$,
  '42501', null, 'B não transfere o aceite de A para si'
);
select throws_ok(
  $$ delete from public.consents where id = (select consentimento_ana from alvo) $$,
  '42501', null, 'B não apaga aceites'
);

-- policy_versions: só a API publica.
select throws_ok(
  $$ insert into public.policy_versions (kind, version, title, body_md, status, published_at)
     values ('terms', '9.9', 'Termos forjados', 'x', 'published', now()) $$,
  '42501', null, 'membro não publica documento'
);

-- Papel comercial não amplia a leitura de dados pessoais (CF-032: só campos operacionais, que
-- chegam com bilheteria/check-in; perfil e aceites de terceiros seguem fechados).
select tests.authenticate_as('carla');
select is_empty(
  $$ select * from public.user_profiles where id = (select ana from alvo) $$,
  'comercial não lê o perfil de A'
);
select is_empty(
  $$ select * from public.consents where user_id = (select ana from alvo) $$,
  'comercial não lê os aceites de A'
);
select throws_ok($$ select * from public.audit_logs $$, '42501', null, 'comercial não lê a trilha');

-- Visitante sem login não lê aceites de ninguém.
select tests.authenticate_as_anon();
select throws_ok($$ select * from public.consents $$, '42501', null, 'anônimo não lê aceites');

-- No fim: dados de A intactos.
select tests.as_service();
select results_eq(
  $$ select p.name, c.revoked_at is null
     from public.user_profiles p join public.consents c on c.user_id = p.id
     where p.id = tests.user_id('ana') $$,
  $$ values ('Ana Teste', true) $$,
  'perfil e aceite de A intactos depois de todas as tentativas'
);

select * from finish();
rollback;
