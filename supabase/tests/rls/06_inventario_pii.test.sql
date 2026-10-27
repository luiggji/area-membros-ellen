-- CF-033 · Inventário obrigatório: toda tabela em `public` precisa estar classificada aqui.
-- Tabela nova derruba este teste até ser classificada E ganhar testes de isolamento (README).
--
-- | tabela           | dado pessoal       | testes de isolamento                         |
-- | audit_logs       | sim (ator)         | database/audit_logs, rls/05                  |
-- | consents         | sim                | rls/03, rls/05                               |
-- | course_modules   | não (catálogo)     | rls/08                                       |
-- | courses          | não (catálogo)     | rls/08                                       |
-- | entitlements     | sim                | database/billing, rls/07                     |
-- | lesson_contents  | não (conteúdo pago)| rls/08 (paywall)                             |
-- | lessons          | não (catálogo)     | rls/08                                       |
-- | payments         | sim (financeiro)   | database/billing, rls/07                     |
-- | plans            | não (catálogo)     | rls/07 (vitrine só ativos)                   |
-- | policy_versions  | não (texto)        | rls/03 (rascunho fechado), rls/05 (publicar) |
-- | price_versions   | não (catálogo)     | database/billing, rls/07                     |
-- | subscriptions    | sim (financeiro)   | database/billing, rls/07                     |
-- | tracks           | não (catálogo)     | rls/08                                       |
-- | user_profiles    | sim                | rls/03, rls/04, rls/05                       |
-- | user_roles       | sim                | rls/02                                       |
-- | webhook_receipts | não (ids técnicos) | rls/07 (invisível para anon/authenticated)   |
begin;
select plan(1);

select set_eq(
  $$ select tablename::text from pg_tables where schemaname = 'public' $$,
  array[
    'audit_logs', 'consents', 'course_modules', 'courses', 'entitlements',
    'lesson_contents', 'lessons', 'payments', 'plans', 'policy_versions',
    'price_versions', 'subscriptions', 'tracks', 'user_profiles', 'user_roles', 'webhook_receipts'
  ],
  'toda tabela em public está classificada no inventário de PII (CF-033)'
);

select * from finish();
rollback;
