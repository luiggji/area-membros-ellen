-- CF-041 · Administração de planos e preços pelo owner (PRD CF-03): preço novo = versão nova; a
-- vendável anterior sai de venda na mesma transação e continua valendo para os contratos vigentes
-- (valor imutável, CF-040). Escrita e trilha de auditoria juntas, dentro das funções.
-- Executáveis só pela API (service_role), que exige `prices.manage` (owner com MFA).
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

-- Cria (sem p_id) ou atualiza um plano. O código não muda depois de criado (vira referência).
create or replace function public.save_plan(
  p_code text, p_name text, p_description text, p_active boolean, p_actor uuid, p_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row public.plans;
  saved public.plans;
begin
  if p_id is null then
    insert into public.plans (code, name, description, active)
    values (p_code, btrim(p_name), nullif(btrim(p_description), ''), p_active)
    returning * into saved;
  else
    select * into before_row from public.plans where id = p_id for update;
    if not found then
      raise exception 'plano não encontrado' using errcode = 'no_data_found';
    end if;
    update public.plans
    set name = btrim(p_name), description = nullif(btrim(p_description), ''), active = p_active
    where id = p_id
    returning * into saved;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, target_type, target_id, before, after)
  values (
    p_actor, 'owner',
    case when p_id is null then 'plan.created' else 'plan.updated' end,
    'plan', saved.id::text,
    case when before_row.id is not null then
      jsonb_build_object('name', before_row.name, 'description', before_row.description,
                         'active', before_row.active)
    end,
    jsonb_build_object('code', saved.code, 'name', saved.name, 'description', saved.description,
                       'active', saved.active)
  );
  return saved.id;
end;
$$;

-- Publica um preço novo para novas vendas daquele plano e frequência.
create or replace function public.publish_price_version(
  p_plan_id uuid, p_interval text, p_amount_cents integer, p_actor uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  previous public.price_versions;
  created uuid;
begin
  -- Trava o plano: duas publicações simultâneas não deixam duas versões vendáveis.
  perform 1 from public.plans where id = p_plan_id for update;
  if not found then
    raise exception 'plano não encontrado' using errcode = 'no_data_found';
  end if;

  update public.price_versions set is_sellable = false
  where plan_id = p_plan_id and "interval" = p_interval and is_sellable
  returning * into previous;

  insert into public.price_versions (plan_id, amount_cents, "interval")
  values (p_plan_id, p_amount_cents, p_interval)
  returning id into created;

  insert into public.audit_logs (actor_id, actor_role, action, target_type, target_id, before, after)
  values (
    p_actor, 'owner', 'price_version.published', 'price_version', created::text,
    case when previous.id is not null then
      jsonb_build_object('price_version_id', previous.id, 'amount_cents', previous.amount_cents)
    end,
    jsonb_build_object('plan_id', p_plan_id, 'interval', p_interval, 'amount_cents', p_amount_cents)
  );
  return created;
end;
$$;

revoke all on function public.save_plan(text, text, text, boolean, uuid, uuid) from public, anon, authenticated;
revoke all on function public.publish_price_version(uuid, text, integer, uuid) from public, anon, authenticated;
grant execute on function public.save_plan(text, text, text, boolean, uuid, uuid) to service_role;
grant execute on function public.publish_price_version(uuid, text, integer, uuid) to service_role;
