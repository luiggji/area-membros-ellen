-- CF-032 · Depois das migrations, todo usuário existente tem o papel base `member`.
begin;
select plan(1);

select is_empty(
  $$ select u.id from auth.users u
     where not exists (
       select 1 from public.user_roles r where r.user_id = u.id and r.role = 'member'
     ) $$,
  'nenhum usuário sem o papel member'
);

select * from finish();
rollback;
