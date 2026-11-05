-- CF-032 · Papéis (RBAC) em tabela própria, nunca em coluna editável pelo usuário (PRD §8.1).
-- Concessão/revogação auditada em audit_logs; todo cadastro nasce com o papel `member`.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

create table public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('owner', 'commercial', 'tech', 'member')),
  -- Quem concedeu (null = sistema: cadastro, seed, migração).
  granted_by uuid references auth.users (id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is
  'Papéis do RBAC (CF-032). O usuário lê só os próprios; concessão só pela API (service_role) e auditada.';

-- Cada usuário lê os próprios papéis (o web mostra e decide navegação); ninguém grava pela API pública.
alter table public.user_roles enable row level security;
revoke all on public.user_roles from public, anon, authenticated;
grant select on public.user_roles to authenticated;
grant select, insert, delete on public.user_roles to service_role;

create policy "titular lê os próprios papéis" on public.user_roles
  for select to authenticated using (user_id = (select auth.uid()));

-- Trilha: toda concessão e revogação vira uma entrada append-only em audit_logs (CF-161).
create or replace function private.audit_user_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed public.user_roles := coalesce(new, old);
  actor uuid := coalesce(changed.granted_by, (select auth.uid()));
begin
  insert into public.audit_logs (actor_id, actor_role, action, target_type, target_id, before, after)
  values (
    actor,
    -- Só o owner concede papéis (PRD CF-12); sem ator, foi o sistema (cadastro, seed).
    case when actor is null then 'system' else 'owner' end,
    case tg_op when 'INSERT' then 'user_role.granted' else 'user_role.revoked' end,
    'user_role',
    changed.user_id::text,
    case when tg_op = 'DELETE' then jsonb_build_object('role', old.role) end,
    case when tg_op = 'INSERT' then jsonb_build_object('role', new.role) end
  );
  return changed;
end;
$$;

create trigger user_roles_audit
  after insert or delete on public.user_roles
  for each row execute function private.audit_user_role_change();

-- Todo usuário novo é `member` (papel base; acesso a conteúdo pago é entitlement, CF-046).
create or replace function private.grant_member_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_roles (user_id, role) values (new.id, 'member')
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_grant_member
  after insert on auth.users
  for each row execute function private.grant_member_role();
