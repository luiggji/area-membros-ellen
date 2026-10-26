-- CF-040 · Catálogo e cobrança (PRD CF-03, §8.1): plano (produto) ≠ versão de preço (valor e
-- frequência) ≠ assinatura (contrato no provedor) ≠ pagamento (transação) ≠ acesso (entitlement).
-- Só leitura pela API pública; quem grava é a API (service_role): CRUD de planos (CF-041),
-- concessões (CF-048) e, depois, o webhook do Stripe (CF-045, D-017). Valores em centavos.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

-- Planos ------------------------------------------------------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  description text check (description is null or char_length(description) <= 500),
  -- Plano inativo some da vitrine e não vende (PRD CF-01); contratos vigentes continuam.
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.plans is
  'Produto vendável (CF-040). Vitrine lê os ativos; só a API grava (CF-041).';

create trigger plans_updated_at
  before update on public.plans
  for each row execute function private.set_updated_at();

-- Versões de preço ---------------------------------------------------------------------------
create table public.price_versions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.plans (id) on delete restrict,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  "interval" text not null check ("interval" in ('month', 'year')),
  effective_at timestamptz not null default now(),
  -- Só a versão vendável aparece para novas vendas; as antigas ficam para os contratos vigentes.
  is_sellable boolean not null default true,
  gateway_price_id text unique check (gateway_price_id is null or char_length(gateway_price_id) <= 255),
  created_at timestamptz not null default now()
);

comment on table public.price_versions is
  'Valor histórico imutável (CF-040): preço novo = versão nova; mudar preço não altera contrato vigente.';

-- Uma única versão vendável por plano e frequência: a vitrine e o checkout nunca escolhem entre duas.
create unique index price_versions_um_vendavel_idx
  on public.price_versions (plan_id, "interval") where is_sellable;

-- Valor, moeda, frequência e plano não mudam depois de criados; só sai de venda ou ganha o id do gateway.
create or replace function private.price_version_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.plan_id, new.amount_cents, new.currency, new."interval", new.effective_at)
     is distinct from (old.plan_id, old.amount_cents, old.currency, old."interval", old.effective_at) then
    raise exception 'versão de preço é imutável: crie uma nova versão'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger price_versions_immutable
  before update on public.price_versions
  for each row execute function private.price_version_immutable();

-- Assinaturas --------------------------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  -- restrict: registro financeiro não some com a conta; exclusão passa por anonimização (PRD §8.4).
  user_id uuid not null references auth.users (id) on delete restrict,
  price_version_id uuid not null references public.price_versions (id) on delete restrict,
  provider text not null default 'stripe' check (provider in ('stripe')),
  -- Id do contrato no provedor; nulo enquanto o checkout não confirmou.
  provider_id text check (provider_id is null or char_length(provider_id) <= 255),
  status text not null default 'pending' check (
    status in ('pending', 'active', 'past_due', 'cancel_at_period_end', 'canceled', 'refunded', 'suspended')
  ),
  current_period_end timestamptz,
  renewal_policy text not null default 'auto' check (renewal_policy in ('auto', 'manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_id)
);

comment on table public.subscriptions is
  'Contrato de assinatura (CF-040). Estado só muda pela API (webhook assinado, CF-045); titular só lê.';

-- No máximo um contrato vivo por pessoa: evita assinatura dupla por clique duplo ou webhook repetido.
create unique index subscriptions_uma_viva_por_pessoa_idx
  on public.subscriptions (user_id)
  where status in ('pending', 'active', 'past_due', 'cancel_at_period_end');

create index subscriptions_price_version_idx on public.subscriptions (price_version_id);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function private.set_updated_at();

-- Pagamentos ---------------------------------------------------------------------------------
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete restrict,
  subscription_id uuid references public.subscriptions (id) on delete restrict,
  provider text not null default 'stripe' check (provider in ('stripe')),
  provider_id text not null check (char_length(provider_id) <= 255),
  kind text not null check (kind in ('charge', 'refund', 'chargeback')),
  amount_cents integer not null check (amount_cents >= 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  status text not null check (status in ('pending', 'succeeded', 'failed')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  -- A mesma transação do provedor nunca vira dois pagamentos.
  unique (provider, provider_id),
  check (status <> 'succeeded' or confirmed_at is not null)
);

comment on table public.payments is
  'Transações reconciliadas com o provedor (CF-040). Titular só lê as próprias; só a API grava.';

create index payments_user_idx on public.payments (user_id, created_at desc);
create index payments_subscription_idx on public.payments (subscription_id);

-- Recibos de webhook -------------------------------------------------------------------------
-- Sem payload: só o necessário para deduplicar e reprocessar (minimização, LGPD).
create table public.webhook_receipts (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe')),
  provider_event_id text not null check (char_length(provider_event_id) <= 255),
  event_type text not null check (char_length(event_type) <= 120),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_status text not null default 'received' check (
    processing_status in ('received', 'processed', 'failed', 'ignored')
  ),
  attempts integer not null default 0 check (attempts >= 0),
  -- Mensagem técnica sem dado pessoal (CF-157).
  last_error text check (last_error is null or char_length(last_error) <= 500),
  -- Evento repetido do provedor é reconhecido e não reprocessado.
  unique (provider, provider_event_id)
);

comment on table public.webhook_receipts is
  'Idempotência dos webhooks (CF-040/045). Invisível para anon/authenticated; só a API grava.';

-- Acessos (entitlements) ---------------------------------------------------------------------
create table public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Escopo do acesso; o MVP tem um só: a assinatura Caixa Forte (Seven Box nunca incluso).
  resource_scope text not null default 'caixa_forte' check (resource_scope in ('caixa_forte')),
  -- Origem: contrato pago (webhook) ou concessão manual do owner, auditada e com validade (CF-048).
  source text not null check (source in ('subscription', 'manual')),
  source_subscription_id uuid references public.subscriptions (id) on delete restrict,
  granted_by uuid references auth.users (id) on delete set null,
  reason text check (reason is null or char_length(btrim(reason)) between 3 and 300),
  valid_from timestamptz not null default now(),
  valid_to timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  check (valid_to is null or valid_to > valid_from),
  check (
    (source = 'subscription' and source_subscription_id is not null)
    or (source = 'manual' and source_subscription_id is null and valid_to is not null and reason is not null)
  )
);

comment on table public.entitlements is
  'Permissão de acesso (CF-040/046). Nasce de assinatura ou de concessão manual com validade; titular só lê.';

-- Um acesso por contrato e escopo: webhook duplicado não duplica a matrícula (PRD CF-03).
create unique index entitlements_um_por_assinatura_idx
  on public.entitlements (source_subscription_id, resource_scope)
  where source_subscription_id is not null;

create index entitlements_user_scope_idx on public.entitlements (user_id, resource_scope);

-- RLS -----------------------------------------------------------------------------------------
alter table public.plans enable row level security;
alter table public.price_versions enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_receipts enable row level security;
alter table public.entitlements enable row level security;

revoke all on public.plans, public.price_versions, public.subscriptions, public.payments,
  public.webhook_receipts, public.entitlements from public, anon, authenticated;

-- Vitrine pública (landing e comparador): planos ativos e suas versões vendáveis.
grant select on public.plans, public.price_versions to anon, authenticated;
-- Titular lê o próprio contrato, pagamentos e acessos.
grant select on public.subscriptions, public.payments, public.entitlements to authenticated;

grant select, insert, update on public.plans, public.price_versions, public.subscriptions,
  public.payments, public.webhook_receipts, public.entitlements to service_role;

create policy "vitrine lê planos ativos" on public.plans
  for select to anon, authenticated using (active);

create policy "vitrine lê versões vendáveis de planos ativos" on public.price_versions
  for select to anon, authenticated
  using (
    is_sellable
    and exists (select 1 from public.plans p where p.id = price_versions.plan_id and p.active)
  );

-- Minha Assinatura mostra o preço contratado, mesmo depois que ele sai de venda.
create policy "titular lê a versão do próprio contrato" on public.price_versions
  for select to authenticated
  using (exists (
    select 1 from public.subscriptions s
    where s.price_version_id = price_versions.id and s.user_id = (select auth.uid())
  ));

create policy "titular lê o próprio contrato" on public.subscriptions
  for select to authenticated using (user_id = (select auth.uid()));

create policy "titular lê os próprios pagamentos" on public.payments
  for select to authenticated using (user_id = (select auth.uid()));

create policy "titular lê os próprios acessos" on public.entitlements
  for select to authenticated using (user_id = (select auth.uid()));

-- Catálogo inicial ----------------------------------------------------------------------------
-- Preços-base confirmados (D-007, PRD CF-03): R$89 mensal e R$790 anual. Alteráveis sem deploy
-- criando nova versão (CF-041). Sem id do gateway até o Stripe entrar (D-017, D-019).
insert into public.plans (code, name, description)
values ('caixa-forte', 'Caixa Forte', 'Assinatura da área de membros Caixa Forte.');

insert into public.price_versions (plan_id, amount_cents, "interval")
select id, amount_cents, "interval"
from public.plans, (values (8900, 'month'), (79000, 'year')) as preco (amount_cents, "interval")
where code = 'caixa-forte';
