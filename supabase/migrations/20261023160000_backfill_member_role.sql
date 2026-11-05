-- CF-032 (follow-up) · Papel base para quem já existia antes da 20261023120000_user_roles: o
-- trigger de cadastro só vale para usuários novos. Idempotente (on conflict); cada concessão é
-- auditada pelo trigger de user_roles como ação do sistema. Aditiva. Rollback: nada a desfazer
-- além de revogar os papéis concedidos (migration compensatória).

insert into public.user_roles (user_id, role)
select id, 'member' from auth.users
on conflict do nothing;
