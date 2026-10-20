-- CF-155 · Helpers dos testes de RLS. Roda primeiro (ordem alfabética) e faz COMMIT de propósito:
-- o schema `tests` só existe no banco efêmero de teste (CI/local), nunca em migrations.
begin;
create extension if not exists pgtap with schema extensions;
select plan(1);

create schema if not exists tests;
grant usage on schema tests to anon, authenticated;

-- Cria um usuário fictício no Auth local e devolve o id. `identifier` vira <identifier>@teste.local.
create or replace function tests.create_user(identifier text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_id uuid := gen_random_uuid();
begin
  insert into auth.users (id, email, aud, role, raw_app_meta_data, raw_user_meta_data)
  values (user_id, identifier || '@teste.local', 'authenticated', 'authenticated', '{}', '{}');
  return user_id;
end;
$$;

-- Id do usuário fictício. security definer: quem já está como authenticated não lê auth.users.
create or replace function tests.user_id(identifier text)
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $
declare
  found uuid;
begin
  select id into found from auth.users where email = identifier || '@teste.local';
  if found is null then
    raise exception 'usuário de teste % não existe', identifier;
  end if;
  return found;
end;
$;

-- Passa a agir como o usuário (role authenticated + claims do JWT), como o PostgREST faria.
-- Precisa ser security invoker: o Postgres não deixa trocar de role dentro de security definer.
create or replace function tests.authenticate_as(identifier text)
returns void
language plpgsql
set search_path = ''
as $
declare
  user_id uuid := tests.user_id(identifier);
begin
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', user_id, 'role', 'authenticated')::text,
    true
  );
end;
$$;

-- Visitante sem login.
create or replace function tests.authenticate_as_anon()
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', json_build_object('role', 'anon')::text, true);
end;
$$;

-- Volta ao superusuário do teste (para preparar dados fora da RLS).
create or replace function tests.as_service()
returns void
language plpgsql
set search_path = ''
as $$
begin
  perform set_config('role', 'postgres', true);
  perform set_config('request.jwt.claims', null, true);
end;
$$;

grant execute on all functions in schema tests to anon, authenticated;

select ok(true, 'helpers de RLS instalados no schema tests');
select * from finish();
commit;
