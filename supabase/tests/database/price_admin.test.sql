-- CF-041 · Planos e preços pelo owner: preço novo não muda contrato vigente; trilha junto da
-- escrita; funções só para a API (service_role).
begin;
select plan(18);

do $$
begin
  perform tests.create_user('ellen');
  perform tests.create_user('assinante');
  -- Contrato vigente no preço mensal atual (R$89).
  insert into public.subscriptions (user_id, price_version_id, status, current_period_end)
  select tests.user_id('assinante'), pv.id, 'active', now() + interval '20 days'
  from public.price_versions pv join public.plans p on p.id = pv.plan_id
  where p.code = 'caixa-forte' and pv."interval" = 'month' and pv.is_sellable;
end;
$$;

create temporary table alvo as
select tests.user_id('ellen') as ellen,
  (select id from public.plans where code = 'caixa-forte') as plano,
  (select price_version_id from public.subscriptions where user_id = tests.user_id('assinante')) as preco_antigo;
grant select on alvo to service_role, anon, authenticated;

-- Novo preço mensal (API = service_role)
set local role service_role;
select lives_ok(
  $$ select public.publish_price_version((select plano from alvo), 'month', 9900, (select ellen from alvo)) $$,
  'owner publica preço mensal novo'
);
select throws_ok(
  $$ select public.publish_price_version((select plano from alvo), 'month', 0, (select ellen from alvo)) $$,
  '23514', null, 'valor precisa ser positivo'
);
select throws_ok(
  $$ select public.publish_price_version((select plano from alvo), 'week', 1000, (select ellen from alvo)) $$,
  '23514', null, 'frequência fora de mensal/anual é recusada'
);
select throws_ok(
  $$ select public.publish_price_version(gen_random_uuid(), 'month', 1000, (select ellen from alvo)) $$,
  'P0002', null, 'plano inexistente'
);
select throws_ok(
  $$ select public.publish_price_version((select plano from alvo), 'month', 50, (select ellen from alvo)) $$,
  '23514', null, 'abaixo de R$ 1,00 é recusado também no banco'
);
select throws_ok(
  $$ select public.publish_price_version((select plano from alvo), 'month', 9900, null) $$,
  '23502', null, 'publicar sem autor é recusado'
);
reset role;

select results_eq(
  $$ select amount_cents, is_sellable from public.price_versions
     where plan_id = (select plano from alvo) and "interval" = 'month' order by created_at, amount_cents $$,
  $$ values (8900, false), (9900, true) $$,
  'preço antigo sai de venda e fica no histórico; o novo é o único vendável'
);
select is(
  (select pv.amount_cents from public.subscriptions s join public.price_versions pv on pv.id = s.price_version_id
   where s.price_version_id = (select preco_antigo from alvo)),
  8900, 'contrato vigente continua no preço antigo (sem retroatividade)'
);
select results_eq(
  $$ select actor_id, before->>'amount_cents', after->>'amount_cents' from public.audit_logs
     where action = 'price_version.published' $$,
  $$ select ellen, '8900'::text, '9900'::text from alvo $$,
  'trilha registra quem publicou, valor anterior e novo'
);

-- Planos
set local role service_role;
select lives_ok(
  $$ select public.save_plan('mentoria', 'Mentoria', 'Plano de teste', true, (select ellen from alvo)) $$,
  'owner cria plano'
);
select throws_ok(
  $$ select public.save_plan('mentoria', 'Outro', null, true, (select ellen from alvo)) $$,
  '23505', null, 'código de plano é único'
);
select lives_ok(
  $$ select public.save_plan('ignorado', 'Mentoria', 'Plano de teste', false, (select ellen from alvo),
       (select id from public.plans where code = 'mentoria')) $$,
  'owner desativa o plano'
);
reset role;

select results_eq(
  $$ select action, before->>'active', after->>'active', after->>'code' from public.audit_logs
     where target_type = 'plan' order by happened_at, action $$,
  $$ values ('plan.created'::text, null::text, 'true'::text, 'mentoria'::text),
            ('plan.updated'::text, 'true'::text, 'false'::text, 'mentoria'::text) $$,
  'trilha de criação e desativação; o código não muda na atualização'
);

select tests.authenticate_as_anon();
select results_eq(
  $$ select code from public.plans order by code $$, $$ values ('caixa-forte'::text) $$,
  'plano desativado some da vitrine'
);
select throws_ok(
  $$ select public.publish_price_version((select plano from alvo), 'month', 1, null) $$,
  '42501', null, 'visitante não publica preço'
);

select tests.authenticate_as('assinante');
select throws_ok(
  $$ select public.publish_price_version((select plano from alvo), 'month', 1, null) $$,
  '42501', null, 'membro não publica preço'
);
select throws_ok(
  $$ select public.save_plan('gratis', 'Grátis', null, true, null) $$,
  '42501', null, 'membro não cria plano'
);
select throws_ok(
  $$ select public.save_plan('x', 'Grátis', null, true, null, (select plano from alvo)) $$,
  '42501', null, 'membro não edita plano'
);

select * from finish();
rollback;
