# Testes de RLS (pgTAP) — CF-155

Rodam no job `database` do CI (`supabase test db`), em Postgres local efêmero e com usuários fictícios.

| Arquivo                         | O que garante                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `../000_setup.test.sql`         | instala os helpers no schema `tests` (só no banco de teste)                                                 |
| `00_rls_obrigatoria.test.sql`   | **toda tabela em `public` tem RLS** e toda view usa `security_invoker`. Vale para qualquer migration futura |
| `01_modelo_isolamento.test.sql` | modelo A × B × anônimo para copiar em cada tabela com PII (CF-033)                                          |
| `02_user_roles.test.sql`        | papéis: member automático e auditado, ninguém se promove pela API pública (CF-032)                          |
| `03_profiles_consents.test.sql` | perfil só do titular; aceite só de versão publicada, imutável e com revogação única (CF-031)                |
| `04_onboarding.test.sql`        | onboarding grava só no próprio perfil e não liga o diretório (CF-035)                                       |
| `05_idor_cruzado.test.sql`      | IDOR: B e um operador comercial contra os dados de A em todas as tabelas com PII (CF-033)                   |
| `06_inventario_pii.test.sql`    | **toda tabela em `public` está classificada**: tabela nova derruba o CI até ganhar classificação e testes   |

## Helpers

- `tests.create_user('ana')` cria um usuário fictício `ana@teste.local` no Auth local e devolve o id.
- `tests.user_id('ana')` devolve o id de um usuário fictício (útil para tentar agir em nome de outro).
- `tests.authenticate_as('ana')` passa a agir como ela (role `authenticated` + JWT), como o PostgREST faria.
- `tests.authenticate_as_anon()` age como visitante sem login.
- `tests.as_service()` volta ao superusuário para preparar ou conferir dados fora da RLS.

## Matriz de isolamento (CF-033)

Cenários exigidos por tabela com dado pessoal, todos pelo caminho do PostgREST (role `authenticated` + JWT):

| Tabela            | Titular lê/edita o seu                                                 | B não lê/altera/cria por A  | Anônimo não lê      | Comercial não amplia            | Assinatura expirada   |
| ----------------- | ---------------------------------------------------------------------- | --------------------------- | ------------------- | ------------------------------- | --------------------- |
| `user_profiles`   | rls/03, rls/04                                                         | rls/03, rls/05              | rls/03              | rls/05                          | n/a (sem entitlement) |
| `consents`        | rls/03                                                                 | rls/03, rls/05              | rls/05              | rls/05                          | n/a                   |
| `user_roles`      | rls/02 (só leitura)                                                    | rls/02                      | rls/02              | — (papel não lê papéis alheios) | n/a                   |
| `audit_logs`      | ninguém lê pela API                                                    | database/audit_logs, rls/05 | database/audit_logs | rls/05                          | n/a                   |
| `policy_versions` | sem dado pessoal: rascunho fechado e só a API publica (rls/03, rls/05) |                             |                     |                                 |                       |

**Quando os cenários "n/a" passam a valer:**

- **assinatura expirada:** na primeira tabela que dependa de entitlement (CF-046: aulas, materiais, comunidade). O teste dessa tabela inclui um usuário com assinatura vencida;
- **comercial com campos operacionais:** nas tabelas de bilheteria e check-in (CF-063…070). O comercial vê só o necessário para atender, nunca o perfil completo.

## Tabela nova

1. Classifique em `06_inventario_pii.test.sql` (o CI falha até isso ser feito).
2. Se tiver dado pessoal, copie `01_modelo_isolamento.test.sql` e cubra as colunas da matriz acima.
3. Acrescente a linha na matriz deste README.

Rodar localmente exige Docker: `npx supabase start` e `npx supabase test db`.
