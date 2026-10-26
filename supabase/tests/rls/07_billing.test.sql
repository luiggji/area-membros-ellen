-- CF-040 · RLS do catálogo e da cobrança: vitrine pública só com o que está à venda; contrato,
-- pagamentos e acessos só para o titular; ninguém grava pela API pública; webhooks invisíveis.
begin;
select plan(18);

select ok(tests.create_user('ana') is not null, 'cria a usuária A (fictícia)');
select ok(tests.create_user('bruno') is not null, 'cria o usuário B (fictício)');
select ok(tests.create_user('carla') is not null, 'cria a operadora comercial C (fictícia)');

-- Preparação como superusuário: plano inativo, preço antigo fora de venda com contrato de A.
insert into public.user_roles (user_id, role) values (tests.user_id('carla'), 'commercial');
insert into public.plans (code, name, active) values ('plano-desativado', 'Desativado', false);
insert into public.price_versions (plan_id, amount_cents, "interval")
select id, 5000, 'month' from public.plans where code = 'plano-desativado';
insert into public.price_versions (plan_id, amount_cents, "interval", is_sellable)
select id, 7900, 'month', false from public.plans where code = 'caixa-forte';
insert into public.subscriptions (user_id, price_version_id, provider_id, status)
select tests.user_id('ana'), id, 'sub_rls_1', 'active' from public.price_versions where amount_cents = 7900;
insert into public.payments (user_id, subscription_id, provider_id, kind, amount_cents, status, confirmed_at)
select tests.user_id('ana'), id, 'pi_rls_1', 'charge', 7900, 'succeeded', now()
from public.subscriptions where provider_id = 'sub_rls_1';
insert into public.entitlements (user_id, source, source_subscription_id)
select tests.user_id('ana'), 'subscription', id from public.subscriptions where provider_id = 'sub_rls_1';
insert into public.webhook_receipts (provider, provider_event_id, event_type)
values ('stripe', 'evt_rls_1', 'invoice.paid');

create temporary table alvo as
select (select id from public.subscriptions where provider_id = 'sub_rls_1') as contrato_ana;
grant select on alvo to anon, authenticated;

-- Visitante: vitrine com o que está à venda, nada além.
select tests.authenticate_as_anon();
select results_eq(
  $$ select code from public.plans $$, $$ values ('caixa-forte'::text) $$,
  'visitante vê só planos ativos'
);
select results_eq(
  $$ select amount_cents from public.price_versions order by amount_cents $$,
  $$ values (8900), (79000) $$,
  'visitante vê só versões vendáveis de planos ativos'
);
select throws_ok($$ select 1 from public.subscriptions $$, '42501', null, 'visitante não lê contratos');
select throws_ok($$ select 1 from public.webhook_receipts $$, '42501', null, 'visitante não lê webhooks');

-- Titular
select tests.authenticate_as('ana');
select results_eq(
  $$ select status from public.subscriptions $$, $$ values ('active'::text) $$,
  'A lê o próprio contrato'
);
select results_eq(
  $$ select amount_cents from public.price_versions where not is_sellable $$, $$ values (7900) $$,
  'A lê o preço contratado mesmo fora de venda'
);
select is((select count(*)::int from public.payments), 1, 'A lê os próprios pagamentos');
select is((select count(*)::int from public.entitlements), 1, 'A lê os próprios acessos');
select throws_ok(
  $$ update public.subscriptions set status = 'active' where id = (select contrato_ana from alvo) $$,
  '42501', null, 'A não muda o estado do próprio contrato (só o webhook, pela API)'
);
select throws_ok(
  $$ insert into public.entitlements (user_id, source, reason, valid_to)
     values (auth.uid(), 'manual', 'autoconcessão', now() + interval '1 year') $$,
  '42501', null, 'A não concede acesso a si mesma'
);
select throws_ok(
  $$ insert into public.price_versions (plan_id, amount_cents, "interval", is_sellable)
     select id, 1, 'year', false from public.plans $$,
  '42501', null, 'A não cria preço'
);
select throws_ok($$ select 1 from public.webhook_receipts $$, '42501', null, 'A não lê webhooks');

-- Outro membro e comercial: nada do contrato de A pelo PostgREST.
select tests.authenticate_as('bruno');
select is(
  (select count(*)::int from public.subscriptions) + (select count(*)::int from public.payments)
    + (select count(*)::int from public.entitlements),
  0, 'B não vê contrato, pagamentos nem acessos de A'
);
select is(
  (select count(*)::int from public.price_versions where not is_sellable), 0,
  'B não vê o preço antigo contratado por A'
);
select tests.authenticate_as('carla');
select is(
  (select count(*)::int from public.subscriptions) + (select count(*)::int from public.payments),
  0, 'comercial não lê contratos e pagamentos direto do banco (só pela API, CF-105)'
);

select * from finish();
rollback;
