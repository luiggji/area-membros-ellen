---
paths:
  - 'supabase/**'
---

# Regras — Banco Supabase/Postgres

- Migration nova: `npx supabase migration new <descricao>`; nunca editar migration já aplicada/mergeada.
- Somente migrations **aditivas** (expand/contract). Drop/rename/alter destrutivo exige plano de rollback e aprovação do Luiggi.
- Toda tabela com dado pessoal: `alter table ... enable row level security;` + policies explícitas + teste pgTAP em `supabase/tests/rls/` (titular, outro membro, anônimo, expirado, papel commercial).
- Papéis em `user_roles` (nunca coluna editável pelo usuário). Constraints de estado com `check`. `unique` onde o PRD exige (`provider_event_id`, `token_hash`, `checkins.ticket_id`…).
- Dinheiro `integer`/`bigint` em centavos; `uuid` como PK; `timestamptz`.
- Seeds só com dados fictícios. Nunca rodar `db reset`/`db push` contra ambiente remoto sem autorização.
