-- CF-046 · Regra única de acesso e máquina de estados da assinatura.
-- Cada cenário usa uma pessoa fictícia própria (uma assinatura viva por pessoa).
begin;
select plan(23);

-- Contrato no estado pedido, com fim de período relativo a agora, e o entitlement que ele gera.
create function pg_temp.assina(pessoa text, estado text, fim interval) returns uuid
language plpgsql as $$
declare
  contrato uuid;
begin
  perform tests.create_user(pessoa);
  insert into public.subscriptions (user_id, price_version_id, status, current_period_end)
  select tests.user_id(pessoa), pv.id, estado, now() + fim
  from public.price_versions pv join public.plans p on p.id = pv.plan_id
  where p.code = 'caixa-forte' and pv."interval" = 'month' and pv.is_sellable
  returning id into contrato;
  insert into public.entitlements (user_id, source, source_subscription_id)
  values (tests.user_id(pessoa), 'subscription', contrato);
  return contrato;
end;
$$;

-- Concessão manual com janela relativa a agora.
create function pg_temp.concede(pessoa text, inicio interval, fim interval, revogada boolean)
returns void language plpgsql as $$
begin
  perform tests.create_user(pessoa);
  insert into public.entitlements (user_id, source, reason, valid_from, valid_to, revoked_at)
  values (tests.user_id(pessoa), 'manual', 'cortesia de teste', now() + inicio, now() + fim,
          case when revogada then now() end);
end;
$$;

-- Setup sem saída (só linhas TAP no resultado).
do $$
begin
  perform tests.create_user('sem_acesso');
  perform pg_temp.concede('manual_ok', '-1 day', '30 days', false);
  perform pg_temp.concede('manual_expirada', '-10 days', '-1 day', false);
  perform pg_temp.concede('manual_revogada', '-1 day', '30 days', true);
  perform pg_temp.concede('manual_futura', '1 day', '30 days', false);
  perform pg_temp.assina('ativa', 'active', '20 days');
  perform pg_temp.assina('pendente', 'pending', '20 days');
  perform pg_temp.assina('atrasada_no_periodo', 'past_due', '3 days');
  perform pg_temp.assina('atrasada_vencida', 'past_due', '-1 day');
  perform pg_temp.assina('cancelando', 'cancel_at_period_end', '10 days');
  perform pg_temp.assina('cancelando_vencida', 'cancel_at_period_end', '-1 day');
  perform pg_temp.assina('cancelada', 'canceled', '10 days');
  perform pg_temp.assina('estornada', 'refunded', '10 days');
  perform pg_temp.assina('suspensa', 'suspended', '10 days');
end;
$$;

-- Regra de acesso
select is(private.has_access(tests.user_id('sem_acesso')), false, 'sem entitlement: sem acesso');
select is(private.has_access(tests.user_id('manual_ok')), true, 'concessão manual vigente: acesso');
select is(private.has_access(tests.user_id('manual_expirada')), false, 'concessão expirada: bloqueada');
select is(private.has_access(tests.user_id('manual_revogada')), false, 'concessão revogada: bloqueada');
select is(private.has_access(tests.user_id('manual_futura')), false, 'concessão que ainda não começou: bloqueada');
select is(private.has_access(tests.user_id('ativa')), true, 'assinatura ativa: acesso');
select is(private.has_access(tests.user_id('pendente')), false, 'pendente (checkout sem confirmação): bloqueada');
select is(private.has_access(tests.user_id('atrasada_no_periodo')), true, 'past_due: acesso até o fim do período pago');
select is(private.has_access(tests.user_id('atrasada_vencida')), false, 'past_due depois do período: bloqueada');
select is(private.has_access(tests.user_id('cancelando')), true, 'cancelamento agendado: acesso até o fim do período');
select is(private.has_access(tests.user_id('cancelando_vencida')), false, 'cancelamento agendado vencido: bloqueada');
select is(private.has_access(tests.user_id('cancelada')), false, 'cancelada: bloqueada');
select is(private.has_access(tests.user_id('estornada')), false, 'estornada: bloqueada');
select is(private.has_access(tests.user_id('suspensa')), false, 'suspensa: bloqueada');

-- Máquina de estados
select lives_ok(
  $$ update public.subscriptions set status = 'active' where user_id = tests.user_id('pendente') $$,
  'pending → active (pagamento confirmado)'
);
select is(private.has_access(tests.user_id('pendente')), true, 'confirmada, passa a ter acesso');
select throws_ok(
  $$ update public.subscriptions set status = 'pending' where user_id = tests.user_id('ativa') $$,
  '23514', null, 'active → pending é recusada'
);
select throws_ok(
  $$ update public.subscriptions set status = 'active' where user_id = tests.user_id('estornada') $$,
  '23514', null, 'estornada não volta a ativa'
);

-- Consultas expostas
select tests.authenticate_as_anon();
select throws_ok($$ select * from public.my_access() $$, '42501', null, 'visitante não consulta acesso');
select tests.authenticate_as('manual_ok');
select results_eq(
  $$ select source, subscription_status from public.my_access() $$,
  $$ values ('manual'::text, null::text) $$,
  'membro vê o próprio acesso (concessão manual)'
);
select throws_ok(
  $$ select * from public.access_of_user(tests.user_id('ativa')) $$,
  '42501', null, 'membro não consulta o acesso de outra pessoa'
);
select tests.authenticate_as('cancelando');
select ok(
  (select valid_until > now() + interval '9 days' from public.my_access()),
  'cancelamento agendado informa até quando vale'
);
select tests.authenticate_as('sem_acesso');
select is_empty($$ select * from public.my_access() $$, 'sem acesso: nenhuma linha');

select * from finish();
rollback;
