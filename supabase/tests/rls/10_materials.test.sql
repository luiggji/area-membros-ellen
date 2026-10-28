-- CF-085 · Cofre: ninguém lê nem grava materiais direto (nem assinante, nem comercial, nem
-- visitante); só a API. Chave do arquivo só no formato gerado pelo servidor; publicado exige data;
-- excluído volta a rascunho.
begin;
select plan(11);

select ok(tests.create_user('ana') is not null, 'cria a assinante A (fictícia, com acesso)');
select ok(tests.create_user('carla') is not null, 'cria a operadora comercial C (fictícia)');

insert into public.entitlements (user_id, source, reason, valid_to)
values (tests.user_id('ana'), 'manual', 'teste', now() + interval '30 days');
insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');
insert into public.materials (title, subject, storage_key, file_name, mime_type, size_bytes, status, published_at)
values ('Modelo de contrato', 'Contratos', '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e.pdf', 'Modelo.pdf', 'application/pdf', 1024, 'published', now());

select tests.authenticate_as('ana');
select throws_ok($$ select storage_key from public.materials $$, '42501', null, 'assinante não lê a tabela direto (só pela API)');
select throws_ok(
  $$ insert into public.materials (title, subject, storage_key, file_name, mime_type, size_bytes)
     values ('Forjado', 'X', '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6f.pdf', 'f.pdf', 'application/pdf', 1) $$,
  '42501', null, 'assinante não cria material'
);

select throws_ok(
  $$ update public.materials set status = 'draft' $$,
  '42501', null, 'assinante não altera material'
);
select throws_ok($$ delete from public.materials $$, '42501', null, 'assinante não apaga material');

select tests.authenticate_as('carla');
select throws_ok($$ select 1 from public.materials $$, '42501', null, 'comercial não lê materiais direto');

select tests.authenticate_as_anon();
select throws_ok($$ select 1 from public.materials $$, '42501', null, 'visitante não lê materiais');

select tests.as_service();
select throws_ok(
  $$ insert into public.materials (title, subject, storage_key, file_name, mime_type, size_bytes)
     values ('Caminho', 'X', '../../segredo.pdf', 'x.pdf', 'application/pdf', 1) $$,
  '23514', null, 'chave do arquivo só no formato gerado pelo servidor'
);
select throws_ok(
  $$ insert into public.materials (title, subject, storage_key, file_name, mime_type, size_bytes, status)
     values ('Sem data', 'X', '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d70.pdf', 'x.pdf', 'application/pdf', 1, 'published') $$,
  '23514', null, 'publicado exige data de publicação'
);
select throws_ok(
  $$ update public.materials set deleted_at = now() where title = 'Modelo de contrato' $$,
  '23514', null, 'excluído não fica publicado'
);

select * from finish();
rollback;
