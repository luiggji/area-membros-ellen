-- CF-016 · Fundação do banco.
-- Schema `private` para funções internas (fora da API do PostgREST) e o helper de updated_at
-- usado pelas tabelas dos módulos. Aditiva. Rollback: migration compensatória
-- (docs/runbooks/migrations.md).

create schema if not exists private;

comment on schema private is
  'Funções e dados internos. Não exposto pela API; sem acesso para anon/authenticated.';

revoke all on schema private from public, anon, authenticated;

-- Trigger BEFORE UPDATE: mantém updated_at (timestamptz, UTC) sem depender do cliente.
create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

comment on function private.set_updated_at() is
  'Uso: create trigger <tabela>_updated_at before update on <tabela> for each row execute function private.set_updated_at();';
