-- CF-161 · Audit log genérico, append-only (PRD §8.1 `audit_logs`, §8.4).
-- Grava quem fez o quê em qual recurso, com before/after já redigidos pela API (sem PII).
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md). Retenção: sem prazo
-- até a política de dados do PRD §8.4 (PENDENTE, jurídico).

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  happened_at timestamptz not null default now(),
  -- Sem FK para auth.users: a trilha sobrevive à exclusão/anonimização de quem agiu.
  actor_id uuid,
  actor_role text not null
    check (actor_role in ('owner', 'commercial', 'tech', 'member', 'system', 'anonymous')),
  -- <recurso>.<verbo>, ex.: price_version.created, checkin.manual_confirmed.
  action text not null check (action ~ '^[a-z][a-z_]*(\.[a-z][a-z_]*)+$'),
  target_type text not null check (target_type ~ '^[a-z][a-z_]*$'),
  target_id text,
  before jsonb check (before is null or jsonb_typeof(before) = 'object'),
  after jsonb check (after is null or jsonb_typeof(after) = 'object'),
  correlation_id text
);

comment on table public.audit_logs is
  'Trilha de auditoria append-only (CF-161). Escrita só pela API (service_role); leitura do owner entra com user_roles (CF-032).';

create index audit_logs_target_idx on public.audit_logs (target_type, target_id, happened_at desc);
create index audit_logs_actor_idx on public.audit_logs (actor_id, happened_at desc);
create index audit_logs_happened_at_idx on public.audit_logs (happened_at desc);

-- RLS ligada e nenhuma policy: anon/authenticated não leem nem gravam. A service_role (API)
-- ignora RLS para inserir.
alter table public.audit_logs enable row level security;
revoke all on public.audit_logs from public, anon, authenticated;
revoke update, delete, truncate on public.audit_logs from service_role;
grant select, insert on public.audit_logs to service_role;

-- Append-only também para quem tem privilégio total (postgres, dono da tabela).
create or replace function private.forbid_audit_log_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'audit_logs é append-only: % não é permitido', tg_op
    using errcode = 'insufficient_privilege';
end;
$$;

create trigger audit_logs_no_update_delete
  before update or delete on public.audit_logs
  for each row execute function private.forbid_audit_log_mutation();

create trigger audit_logs_no_truncate
  before truncate on public.audit_logs
  for each statement execute function private.forbid_audit_log_mutation();
