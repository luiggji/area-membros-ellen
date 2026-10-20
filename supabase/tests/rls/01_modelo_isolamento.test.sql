-- CF-155 · Modelo de teste de isolamento (A × B × anônimo) que toda tabela com PII copia em
-- CF-033. A tabela de exemplo existe só nesta transação e some no rollback.
begin;
select plan(9);

create table public.rls_exemplo (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id),
  conteudo text not null
);
alter table public.rls_exemplo enable row level security;
grant select, insert, update, delete on public.rls_exemplo to authenticated;
grant select on public.rls_exemplo to anon;

create policy "titular lê os próprios" on public.rls_exemplo
  for select to authenticated using (owner_id = (select auth.uid()));
create policy "titular cria para si" on public.rls_exemplo
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "titular edita os próprios" on public.rls_exemplo
  for update to authenticated using (owner_id = (select auth.uid()));

select ok(tests.create_user('ana') is not null, 'cria a usuária A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o usuário B (fictício)');

-- A cria um registro.
select tests.authenticate_as('ana');
select lives_ok(
  $$ insert into public.rls_exemplo (conteudo) values ('dado da Ana') $$,
  'A cria o próprio registro'
);
select results_eq(
  $$ select conteudo from public.rls_exemplo $$,
  $$ values ('dado da Ana') $$,
  'A lê o próprio registro'
);

-- B não enxerga nem altera o registro de A (IDOR).
select tests.authenticate_as('bruno');
select is_empty($$ select * from public.rls_exemplo $$, 'B não lê o registro de A');
select lives_ok(
  $$ update public.rls_exemplo set conteudo = 'invadido' $$,
  'update de B roda, mas não atinge o registro de A (conferido no fim)'
);
select throws_ok(
  $$ insert into public.rls_exemplo (owner_id, conteudo)
     values (tests.user_id('ana'), 'forjado') $$,
  '42501',
  'new row violates row-level security policy for table "rls_exemplo"',
  'B não cria registro em nome de A'
);

-- Visitante sem login não vê nada.
select tests.authenticate_as_anon();
select is_empty($$ select * from public.rls_exemplo $$, 'anônimo não lê nada');

-- O dado de A continua intacto.
select tests.as_service();
select results_eq(
  $$ select conteudo from public.rls_exemplo $$,
  $$ values ('dado da Ana') $$,
  'registro de A intacto depois das tentativas'
);

select * from finish();
rollback;
