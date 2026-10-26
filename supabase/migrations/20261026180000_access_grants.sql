-- CF-048 · Concessões manuais de acesso: quem revogou, trilha automática e apoio à API (owner).
-- A auditoria é trigger no banco (como em user_roles): conceder/revogar e registrar acontecem
-- na mesma transação, então não existe concessão sem log.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

alter table public.entitlements
  add column revoked_by uuid references auth.users (id) on delete set null;

-- Trilha: concessão e revogação viram entradas append-only em audit_logs (CF-161).
create or replace function private.audit_entitlement_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid;
begin
  if tg_op = 'INSERT' then
    actor := new.granted_by;
    insert into public.audit_logs (actor_id, actor_role, action, target_type, target_id, after)
    values (
      actor,
      -- Concessão manual só pelo owner (permissão access.grant); de assinatura, o sistema.
      case when actor is null then 'system' else 'owner' end,
      'entitlement.granted',
      'entitlement',
      new.id::text,
      jsonb_build_object(
        'user_id', new.user_id, 'source', new.source, 'reason', new.reason,
        'valid_from', new.valid_from, 'valid_to', new.valid_to
      )
    );
  elsif old.revoked_at is null and new.revoked_at is not null then
    actor := new.revoked_by;
    insert into public.audit_logs (actor_id, actor_role, action, target_type, target_id, before, after)
    values (
      actor,
      case when actor is null then 'system' else 'owner' end,
      'entitlement.revoked',
      'entitlement',
      new.id::text,
      jsonb_build_object('revoked_at', null),
      jsonb_build_object('revoked_at', new.revoked_at)
    );
  end if;
  return new;
end;
$$;

create trigger entitlements_audit
  after insert or update of revoked_at on public.entitlements
  for each row execute function private.audit_entitlement_change();

-- Apoio à API (service_role): achar a pessoa pelo e-mail sem listar o Auth inteiro.
create or replace function public.user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from auth.users where lower(email) = lower(btrim(p_email)) limit 1;
$$;

-- Concessões manuais com o e-mail da pessoa, para a tela do owner (mais recentes primeiro).
create or replace function public.manual_access_grants()
returns table (
  id uuid, member_email text, reason text, valid_from timestamptz, valid_to timestamptz,
  revoked_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select e.id, u.email::text, e.reason, e.valid_from, e.valid_to, e.revoked_at
  from public.entitlements e
  join auth.users u on u.id = e.user_id
  where e.source = 'manual'
  order by e.created_at desc
  limit 200;
$$;

revoke all on function public.user_id_by_email(text) from public, anon, authenticated;
revoke all on function public.manual_access_grants() from public, anon, authenticated;
grant execute on function public.user_id_by_email(text) to service_role;
grant execute on function public.manual_access_grants() to service_role;
