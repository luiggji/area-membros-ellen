-- CF-046 · Máquina de estados da assinatura e regra única de acesso (PRD CF-03).
-- Acesso = entitlement vigente; o de assinatura só vale enquanto o contrato permite:
--   active → sim; past_due e cancel_at_period_end → só até o fim do período pago;
--   pending, canceled, refunded, suspended → não. Concessão manual vale até `valid_to` (CF-048).
-- Uma só definição (private.access_of) serve à RLS de conteúdo, à API e ao web.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

-- Transições permitidas do contrato; o webhook (CF-045) só aplica as que estão aqui. A lista fica
-- dentro do trigger: chamar outra função de `private` exigiria USAGE no schema para quem faz o
-- UPDATE (service_role), e abrir o schema exporia as demais funções.
create or replace function private.subscription_status_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status <> new.status and (old.status, new.status) not in (
    ('pending', 'active'), ('pending', 'canceled'),
    ('active', 'past_due'), ('active', 'cancel_at_period_end'), ('active', 'canceled'),
    ('active', 'refunded'), ('active', 'suspended'),
    ('past_due', 'active'), ('past_due', 'canceled'), ('past_due', 'suspended'),
    ('past_due', 'refunded'),
    ('cancel_at_period_end', 'active'), ('cancel_at_period_end', 'canceled'),
    ('cancel_at_period_end', 'refunded'),
    ('suspended', 'active'), ('suspended', 'canceled')
  ) then
    raise exception 'transição de assinatura inválida: % → %', old.status, new.status
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger subscriptions_status_guard
  before update of status on public.subscriptions
  for each row execute function private.subscription_status_guard();

-- Acesso vigente da pessoa no escopo. Sem linha = sem acesso. Entre vários, o que dura mais
-- (sem fim conhecido primeiro). security definer: lê contratos sem depender da RLS de quem chama.
create or replace function private.access_of(p_user uuid, p_scope text)
returns table (source text, subscription_status text, valid_until timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select e.source, s.status, coalesce(s.current_period_end, e.valid_to)
  from public.entitlements e
  -- O contrato precisa ser da mesma pessoa: entitlement apontando para o contrato de outra não vale.
  left join public.subscriptions s on s.id = e.source_subscription_id and s.user_id = e.user_id
  where e.user_id = p_user
    and e.resource_scope = p_scope
    and e.revoked_at is null
    and e.valid_from <= now()
    and (e.valid_to is null or e.valid_to > now())
    and (
      e.source = 'manual'
      or s.status = 'active'
      or (s.status in ('past_due', 'cancel_at_period_end') and s.current_period_end > now())
    )
  order by coalesce(s.current_period_end, e.valid_to) desc nulls first
  limit 1;
$$;

-- Para policies de conteúdo (CF-080 em diante): `using ((select private.has_access(auth.uid())))`.
create or replace function private.has_access(p_user uuid, p_scope text default 'caixa_forte')
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from private.access_of(p_user, p_scope));
$$;

-- Fechadas por padrão; a primeira policy de conteúdo concede `usage` em private e `execute` em
-- has_access para authenticated (privilégio mínimo até lá).
revoke all on function private.access_of(uuid, text) from public;
revoke all on function private.has_access(uuid, text) from public;

-- O membro consulta só o próprio acesso (web: /app/assinatura e paywall das telas).
create or replace function public.my_access(p_scope text default 'caixa_forte')
returns table (source text, subscription_status text, valid_until timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select * from private.access_of((select auth.uid()), p_scope);
$$;

-- A API (service_role) consulta o acesso de quem está chamando o endpoint (paywall no servidor).
create or replace function public.access_of_user(p_user uuid, p_scope text default 'caixa_forte')
returns table (source text, subscription_status text, valid_until timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select * from private.access_of(p_user, p_scope);
$$;

revoke all on function public.my_access(text) from public, anon;
grant execute on function public.my_access(text) to authenticated;
revoke all on function public.access_of_user(uuid, text) from public, anon, authenticated;
grant execute on function public.access_of_user(uuid, text) to service_role;
