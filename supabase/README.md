# Supabase — banco, Auth e Storage

**Estado atual:** somente estrutura versionada. Nenhum banco foi provisionado ainda.
Decisão de ambiente (Supabase Cloud por ambiente **ou** local via Docker) fica para a Issue de ambientes (CF-012) — ver `docs/D_DECISION_LOG.md` P-014.

```
supabase/
  config.toml      config do CLI (Auth endurecido: senha ≥ 10 com maiúscula/minúscula/dígito,
                   confirmação de e-mail obrigatória, MFA TOTP habilitado para admins — CF-034)
  migrations/      SQL versionado: <timestamp>_<descricao>.sql (gerado com `supabase migration new`)
  seeds/           dados FICTÍCIOS para dev/staging (CF-154). Nunca dados reais.
  tests/rls/       testes pgTAP de RLS/IDOR (CF-033, CF-155) — rodados com `supabase test db`
```

## Comandos (via `pnpm dlx supabase@<versão>` ou `npx supabase`)

| Ação                        | Comando                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------- |
| Nova migration              | `npx supabase migration new <descricao>`                                               |
| Subir local (exige Docker)  | `npx supabase start`                                                                   |
| Recriar banco local + seeds | `npx supabase db reset` (**somente local**)                                            |
| Testes de RLS               | `npx supabase test db`                                                                 |
| Gerar tipos TS              | `npx supabase gen types typescript --local > packages/contracts/src/database.types.ts` |
| Vincular projeto cloud      | `npx supabase link --project-ref <ref>` (cada ambiente com seu projeto)                |

## Regras inegociáveis

1. Migrations **aditivas** (expand/contract). Destrutiva = plano explícito + aprovação do Luiggi.
2. Toda tabela com dado pessoal: `enable row level security` + policies versionadas + teste pgTAP com usuário A × B, anônimo e expirado.
3. `role` nunca em coluna editável pelo próprio usuário (`user_roles` separado, PRD §8.1).
4. Dinheiro em centavos (`integer`/`bigint`), IDs `uuid`, timestamps `timestamptz` (UTC).
5. `service_role` só na API/servidor. Staging nunca aponta para banco de produção.
6. Nunca rodar `db reset`/`db push` contra staging/produção sem autorização.
