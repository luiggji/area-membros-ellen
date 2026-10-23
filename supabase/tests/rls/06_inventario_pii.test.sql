-- CF-033 · Inventário obrigatório: toda tabela em `public` precisa estar classificada aqui.
-- Tabela nova derruba este teste até ser classificada E ganhar testes de isolamento (README).
--
-- | tabela          | dado pessoal | testes de isolamento                         |
-- | audit_logs      | sim (ator)   | database/audit_logs, rls/05                  |
-- | consents        | sim          | rls/03, rls/05                               |
-- | policy_versions | não (texto)  | rls/03 (rascunho fechado), rls/05 (publicar) |
-- | user_profiles   | sim          | rls/03, rls/04, rls/05                       |
-- | user_roles      | sim          | rls/02                                       |
begin;
select plan(1);

select set_eq(
  $$ select tablename::text from pg_tables where schemaname = 'public' $$,
  array['audit_logs', 'consents', 'policy_versions', 'user_profiles', 'user_roles'],
  'toda tabela em public está classificada no inventário de PII (CF-033)'
);

select * from finish();
rollback;
