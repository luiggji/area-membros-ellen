-- CF-093 · Participação em grupo e feed de publicações (PRD CF-08): o membro entra e sai de um
-- grupo publicado e lê o que foi publicado nos grupos em que está. Só com acesso pago vigente
-- (CF-046) — é o "outros não" do critério de aceite, resolvido também no banco e não só na tela.
-- Escrita só pela API (service_role), como no lesson_progress (CF-084).
-- Publicar, comentar e denunciar chegam no CF-094/CF-095; aqui o feed é só leitura.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  joined_at timestamptz not null default now(),
  -- UNIQUE por grupo e pessoa (PRD §8): entrar duas vezes é a mesma participação.
  primary key (group_id, user_id)
);

comment on table public.group_members is
  'Participação em grupo (CF-093). Lida pelo próprio participante; gravada só pela API.';

-- "Meus grupos" e o feed partem sempre da pessoa.
create index group_members_user_idx on public.group_members (user_id);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 5000),
  -- `hidden` é a ocultação da moderação (CF-095): exclusão é lógica, a trilha permanece.
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is
  'Publicação em grupo (CF-093/CF-094). Lida por quem participa do grupo e tem acesso vigente.';

-- O feed é sempre "deste grupo, mais recentes primeiro", e só o que está visível.
create index posts_group_recent_idx on public.posts (group_id, created_at desc)
  where status = 'published';

create trigger posts_updated_at before update on public.posts
  for each row execute function private.set_updated_at();

-- Participação de quem está pedindo, para a policy de posts não repetir o subselect.
create or replace function private.i_am_in_group(p_group uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = p_group and m.user_id = (select auth.uid())
  );
$$;

revoke all on function private.i_am_in_group(uuid) from public, anon;
grant execute on function private.i_am_in_group(uuid) to authenticated;

-- Leitura da API ------------------------------------------------------------------------------
-- Lista do membro: grupos publicados, quantos participam e se esta pessoa participa. Uma
-- consulta só; contar participante por grupo na aplicação seria uma ida ao banco por grupo.
create or replace function public.member_groups(p_user uuid)
returns table (id uuid, slug text, name text, description text, member_count bigint, joined boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select g.id, g.slug, g.name, g.description,
         count(m.user_id) as member_count,
         -- Sem participante nenhum, bool_or devolve null; `is true` resolve para false.
         bool_or(m.user_id = p_user) is true as joined
  from public.groups g
  left join public.group_members m on m.group_id = g.id
  where g.status = 'published'
  group by g.id, g.slug, g.name, g.description
  order by g.name;
$$;

-- Feed: publicações dos grupos em que a pessoa entrou, mais recentes primeiro. Sem nome
-- preenchido, o autor aparece como "Membro" — nunca o e-mail (LGPD, PRD §9).
create or replace function public.member_feed(p_user uuid, p_limit integer default 30)
returns table (
  id uuid, body text, created_at timestamptz,
  author_name text, group_slug text, group_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.body, p.created_at,
         coalesce(nullif(btrim(up.name), ''), 'Membro') as author_name,
         g.slug, g.name
  from public.posts p
  join public.groups g on g.id = p.group_id
  join public.group_members m on m.group_id = p.group_id and m.user_id = p_user
  left join public.user_profiles up on up.id = p.author_id
  where p.status = 'published' and g.status = 'published'
  order by p.created_at desc
  limit greatest(1, least(p_limit, 100));
$$;

revoke all on function public.member_groups(uuid) from public, anon, authenticated;
revoke all on function public.member_feed(uuid, integer) from public, anon, authenticated;
grant execute on function public.member_groups(uuid) to service_role;
grant execute on function public.member_feed(uuid, integer) to service_role;

-- RLS -----------------------------------------------------------------------------------------
alter table public.group_members enable row level security;
alter table public.posts enable row level security;

revoke all on public.group_members, public.posts from public, anon, authenticated;
grant select on public.group_members, public.posts to authenticated;
grant select, insert, update, delete on public.group_members, public.posts to service_role;

-- Cada pessoa vê só a própria participação, e só enquanto o acesso está vigente. Ninguém
-- descobre de quais grupos outra pessoa participa pela API pública.
create policy "cada pessoa lê a própria participação" on public.group_members
  for select to authenticated
  using (user_id = (select auth.uid()) and private.i_have_access());

-- Publicação só para quem participa do grupo e tem acesso vigente. O que a moderação ocultar
-- (CF-095) sai da leitura de todo mundo, inclusive do autor.
create policy "participante lê publicações do grupo" on public.posts
  for select to authenticated
  using (
    status = 'published'
    and private.i_have_access()
    and private.i_am_in_group(group_id)
  );
