-- CF-040 · Catálogo e cobrança: constraints que impedem duplicidade estrutural e preço retroativo.
-- Roda como superusuário (fora da RLS); a RLS está em rls/07_billing.
begin;
select plan(22);

select ok(tests.create_user('ana') is not null, 'cria a usuária A (fictícia)');

-- Catálogo inicial (D-007): um plano, mensal R$89 e anual R$790, ambos vendáveis.
select results_eq(
  $$ select pv."interval", pv.amount_cents, pv.currency, pv.is_sellable
     from public.price_versions pv join public.plans p on p.id = pv.plan_id
     where p.code = 'caixa-forte' order by pv."interval" $$,
  $$ values ('month'::text, 8900, 'BRL'::text, true), ('year'::text, 79000, 'BRL'::text, true) $$,
  'catálogo inicial: R$89 mensal e R$790 anual, vendáveis'
);

create temporary table ref as
select
  (select id from public.plans where code = 'caixa-forte') as plano,
  (select pv.id from public.price_versions pv join public.plans p on p.id = pv.plan_id
   where p.code = 'caixa-forte' and pv."interval" = 'month') as mensal;

-- Planos e versões de preço
select throws_ok(
  $$ insert into public.plans (code, name) values ('caixa-forte', 'Duplicado') $$,
  '23505', null, 'código de plano é único'
);
select throws_ok(
  $$ insert into public.plans (code, name) values ('Caixa Forte', 'Código inválido') $$,
  '23514', null, 'código de plano só em minúsculas com hífen'
);
select throws_ok(
  $$ insert into public.price_versions (plan_id, amount_cents, "interval") select plano, 9900, 'month' from ref $$,
  '23505', null, 'só uma versão vendável por plano e frequência'
);
select throws_ok(
  $$ update public.price_versions set amount_cents = 1 where id = (select mensal from ref) $$,
  '23514', null, 'valor de versão existente não muda (sem preço retroativo)'
);
select throws_ok(
  $$ insert into public.price_versions (plan_id, amount_cents, "interval", is_sellable) select plano, 0, 'month', false from ref $$,
  '23514', null, 'valor precisa ser positivo, em centavos'
);
select lives_ok(
  $$ update public.price_versions set is_sellable = false where id = (select mensal from ref) $$,
  'versão antiga pode sair de venda'
);
select lives_ok(
  $$ insert into public.price_versions (plan_id, amount_cents, "interval") select plano, 9900, 'month' from ref $$,
  'preço novo = versão nova vendável'
);

-- Assinaturas
select lives_ok(
  $$ insert into public.subscriptions (user_id, price_version_id, provider_id, status)
     select tests.user_id('ana'), mensal, 'sub_teste_1', 'active' from ref $$,
  'assinatura ativa no preço antigo continua válida'
);
select throws_ok(
  $$ insert into public.subscriptions (user_id, price_version_id) select tests.user_id('ana'), mensal from ref $$,
  '23505', null, 'no máximo uma assinatura viva por pessoa'
);
select throws_ok(
  $$ insert into public.subscriptions (user_id, price_version_id, status) select tests.user_id('ana'), mensal, 'trial' from ref $$,
  '23514', null, 'estado fora da lista do PRD é recusado'
);
update public.subscriptions set status = 'canceled' where provider_id = 'sub_teste_1';
select lives_ok(
  $$ insert into public.subscriptions (user_id, price_version_id) select tests.user_id('ana'), mensal from ref $$,
  'depois de cancelada, pode assinar de novo'
);
select throws_ok(
  $$ update public.subscriptions set provider_id = 'sub_teste_1' where status = 'pending' $$,
  '23505', null, 'id do contrato no provedor é único'
);

-- Pagamentos
select lives_ok(
  $$ insert into public.payments (user_id, provider_id, kind, amount_cents, status, confirmed_at)
     values (tests.user_id('ana'), 'pi_teste_1', 'charge', 8900, 'succeeded', now()) $$,
  'pagamento confirmado registrado'
);
select throws_ok(
  $$ insert into public.payments (user_id, provider_id, kind, amount_cents, status, confirmed_at)
     values (tests.user_id('ana'), 'pi_teste_1', 'charge', 8900, 'succeeded', now()) $$,
  '23505', null, 'a mesma transação do provedor não vira dois pagamentos'
);
select throws_ok(
  $$ insert into public.payments (user_id, provider_id, kind, amount_cents, status)
     values (tests.user_id('ana'), 'pi_teste_2', 'charge', 8900, 'succeeded') $$,
  '23514', null, 'pagamento confirmado exige data de confirmação'
);

-- Webhooks
insert into public.webhook_receipts (provider, provider_event_id, event_type)
values ('stripe', 'evt_teste_1', 'invoice.paid');
select throws_ok(
  $$ insert into public.webhook_receipts (provider, provider_event_id, event_type)
     values ('stripe', 'evt_teste_1', 'invoice.paid') $$,
  '23505', null, 'evento repetido do provedor é reconhecido pela chave única'
);

-- Acessos
select throws_ok(
  $$ insert into public.entitlements (user_id, source, reason) values (tests.user_id('ana'), 'manual', 'cortesia') $$,
  '23514', null, 'concessão manual sem validade é recusada'
);
select lives_ok(
  $$ insert into public.entitlements (user_id, source, reason, valid_to)
     values (tests.user_id('ana'), 'manual', 'cortesia de teste', now() + interval '30 days') $$,
  'concessão manual com motivo e validade'
);
select throws_ok(
  $$ insert into public.entitlements (user_id, source) values (tests.user_id('ana'), 'subscription') $$,
  '23514', null, 'acesso por assinatura exige o contrato de origem'
);
insert into public.entitlements (user_id, source, source_subscription_id)
select tests.user_id('ana'), 'subscription', id from public.subscriptions where provider_id = 'sub_teste_1';
select throws_ok(
  $$ insert into public.entitlements (user_id, source, source_subscription_id)
     select tests.user_id('ana'), 'subscription', id from public.subscriptions where provider_id = 'sub_teste_1' $$,
  '23505', null, 'um acesso por contrato: webhook duplicado não duplica a matrícula'
);

select * from finish();
rollback;
