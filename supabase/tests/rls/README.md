# Testes de RLS (pgTAP) — CF-155

Rodam no job `database` do CI (`supabase test db`), em Postgres local efêmero e com usuários fictícios.

| Arquivo                         | O que garante                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `../000_setup.test.sql`         | instala os helpers no schema `tests` (só no banco de teste)                                                 |
| `00_rls_obrigatoria.test.sql`   | **toda tabela em `public` tem RLS** e toda view usa `security_invoker`. Vale para qualquer migration futura |
| `01_modelo_isolamento.test.sql` | modelo A × B × anônimo para copiar em cada tabela com PII (CF-033)                                          |

## Helpers

- `tests.create_user('ana')` cria um usuário fictício `ana@teste.local` no Auth local e devolve o id.
- `tests.user_id('ana')` devolve o id de um usuário fictício (útil para tentar agir em nome de outro).
- `tests.authenticate_as('ana')` passa a agir como ela (role `authenticated` + JWT), como o PostgREST faria.
- `tests.authenticate_as_anon()` age como visitante sem login.
- `tests.as_service()` volta ao superusuário para preparar ou conferir dados fora da RLS.

## Para cada tabela com PII (CF-033)

Copie `01_modelo_isolamento.test.sql` para `<tabela>.test.sql` e cubra no mínimo:

- o titular lê, cria e edita só os próprios registros;
- outro membro (B) **não** lê, não altera e não cria em nome de A (IDOR);
- o anônimo não lê;
- a assinatura expirada é bloqueada quando a tabela depender de entitlement (CF-046);
- o papel `commercial` vê só os campos operacionais (CF-032).

Rodar localmente exige Docker: `npx supabase start` e `npx supabase test db`.
