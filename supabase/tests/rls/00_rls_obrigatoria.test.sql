-- CF-155 · Guarda geral: nenhuma tabela exposta pela API fica sem RLS.
-- Vale para toda migration futura. Tabela nova sem `enable row level security` derruba o CI.
begin;
select plan(2);

select is_empty(
  $$
    select format('%I.%I', n.nspname, c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname in ('public', 'graphql_public')
      and c.relkind in ('r', 'p')
      and not c.relrowsecurity
  $$,
  'toda tabela em public tem RLS ligada'
);

select is_empty(
  $$
    select format('%I.%I', n.nspname, c.relname)
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind = 'v'
      and not coalesce(
        (select bool_or(option = 'security_invoker=true' or option = 'security_invoker=on')
         from unnest(c.reloptions) as option),
        false
      )
  $$,
  'toda view em public usa security_invoker (não fura a RLS das tabelas)'
);

select * from finish();
rollback;
