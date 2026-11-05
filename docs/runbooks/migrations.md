# Migrations e rollback de banco (CF-016, Issue #16)

**Regra de ouro:** o banco de qualquer ambiente sobe **do zero** só com `supabase/migrations/` (mais os seeds fictícios em dev/staging). Ninguém altera schema pelo painel.

## Criar uma migration

1. `npx supabase migration new <descricao_em_snake_case>` gera `supabase/migrations/<AAAAMMDDHHMMSS>_<descricao>.sql`.
2. Escrever SQL **aditivo**. Cada migration começa com um comentário dizendo a Issue e o que faz.
3. Tabela nova com dado de usuário entra **na mesma migration** com:
   - `enable row level security`;
   - policies;
   - teste pgTAP em `supabase/tests/` cobrindo usuário A × B, anônimo e expirado (CF-155).
4. Funções em `private` (fora da API), com `set search_path = ''`. Desde o CF-080 elas nascem
   **sem EXECUTE** (default privileges do papel das migrations). Se uma policy precisar chamar a
   função como `authenticated`, conceda o `execute` explicitamente e inclua o nome na lista fechada
   de `supabase/tests/database/fundacao.test.sql`; função criada por outro papel é pega por esse
   teste. Nunca exponha a `authenticated` uma função que receba outro usuário como argumento.
5. Abrir PR. O job **`database`** do CI:
   - valida o nome e as regras (`.github/scripts/check-migrations.mjs`);
   - sobe um Postgres local do Supabase;
   - aplica tudo do zero, reaplica com `db reset`;
   - roda `db lint` e os testes pgTAP.

Sem Docker na máquina, o CI é a fonte de verdade. Com Docker: `npx supabase start`, `npx supabase db reset` e `npx supabase test db`.

## Mudanças que apagam ou alteram dado (expand/contract)

Nunca em um passo só:

1. **Expand:** adicionar a coluna ou tabela nova; o código passa a escrever nos dois lugares.
2. **Migrar:** backfill em migration própria, idempotente.
3. **Contract:** só depois de um release estável, remover o antigo.

O script recusa `drop table`, `drop column`, `drop schema`, `truncate`, `delete from` e troca de tipo de coluna. A exceção exige a linha `-- destrutiva-aprovada: #<issue>` no arquivo, com aprovação do Luiggi registrada na Issue. **Desligar RLS é proibido**, mesmo com aprovação.

## Aplicar em staging e produção (depois da P-014)

1. Staging: `npx supabase link --project-ref <ref-staging>` e depois `npx supabase db push`, pelo pipeline de deploy (CF-015) e nunca da máquina pessoal.
2. Conferir o `/status` de staging e rodar os smoke tests.
3. Produção: mesmo comando no deploy aprovado no Environment `production`, depois de backup recente (CF-018).
4. Proibido rodar `db reset` fora do banco local.

## Rollback

As migrations do Supabase não têm "down". O rollback é sempre **para frente**:

| Situação                                                | Ação                                                                                             |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Migration aditiva com problema, sem dado novo relevante | nova migration compensatória (ex.: remover a coluna recém-criada, com `destrutiva-aprovada`)     |
| Dado corrompido por backfill                            | migration corretiva idempotente; se não der, restaurar backup ou PITR no ambiente (CF-018)       |
| Deploy de código incompatível com o schema              | reverter o código (revert do squash); o schema aditivo continua compatível com a versão anterior |

Toda reversão em staging ou produção é registrada no runbook de incidente (CF-018).
