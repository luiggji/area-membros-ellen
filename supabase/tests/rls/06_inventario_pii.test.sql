-- CF-033 · Inventário obrigatório: toda tabela em `public` precisa estar classificada aqui.
-- Tabela nova derruba este teste até ser classificada E ganhar testes de isolamento (README).
--
-- | tabela           | dado pessoal       | testes de isolamento                         |
-- | audit_logs       | sim (ator)         | database/audit_logs, rls/05                  |
-- | consents         | sim                | rls/03, rls/05                               |
-- | course_modules   | não (catálogo)     | rls/08                                       |
-- | directory_profiles | sim (opt-in)     | rls/11                                       |
-- | courses          | não (catálogo)     | rls/08                                       |
-- | entitlements     | sim                | database/billing, rls/07                     |
-- | group_members    | sim (quem participa)| rls/14 (só o próprio, com acesso vigente)   |
-- | groups           | não (catálogo)     | rls/13 (só publicados), database/groups_admin |
-- | lesson_contents  | não (conteúdo pago)| rls/08 (paywall)                             |
-- | lesson_progress  | sim (uso por pessoa)| rls/09                                      |
-- | lessons          | não (catálogo)     | rls/08                                       |
-- | materials        | não (catálogo)     | rls/10 (só a API)                            |
-- | payments         | sim (financeiro)   | database/billing, rls/07                     |
-- | plans            | não (catálogo)     | rls/07 (vitrine só ativos)                   |
-- | policy_versions  | não (texto)        | rls/03 (rascunho fechado), rls/05 (publicar) |
-- | posts            | sim (autor e texto)| rls/14 (só do grupo em que entrou, com acesso)|
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
    'audit_logs', 'consents', 'course_modules', 'courses', 'directory_profiles', 'entitlements',
    'group_members', 'groups', 'lesson_contents', 'lesson_progress', 'lessons', 'materials',
    'payments', 'plans', 'policy_versions', 'posts', 'price_versions', 'subscriptions', 'tracks',
    'user_profiles', 'user_roles', 'webhook_receipts'
  ],
  'toda tabela em public está classificada no inventário de PII (CF-033)'
);

select * from finish();
rollback;
