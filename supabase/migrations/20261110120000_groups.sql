-- CF-092 · Grupos temáticos da comunidade (PRD §"Comunidade e networking"): Ellen cria, publica
-- e oculta grupo sem deploy. Só a API grava (service_role), exigindo `content.manage` (owner com
-- MFA); a escrita e a trilha de auditoria acontecem juntas, dentro da função.
-- Adesão, posts e comentários chegam no CF-093/CF-094 — aqui só o catálogo de grupos.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  -- Identificador da URL do grupo (/app/comunidade/grupos/<slug>); não muda depois de criado.
  slug text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 2 and 60),
  name text not null check (char_length(btrim(name)) between 2 and 80),
  description text check (description is null or char_length(description) <= 500),
  -- `draft`: nunca foi ao ar. `hidden`: saiu do ar depois de publicado. A distinção importa para
  -- a trilha de auditoria. Só `published` aparece para membros.
  status text not null default 'draft' check (status in ('draft', 'published', 'hidden')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.groups is
  'Grupo temático da comunidade (CF-092). Membro lê os publicados; só a API grava (content.manage).';

-- A lista do membro é sempre "publicados, em ordem alfabética".
create index groups_publicados_idx on public.groups (name) where status = 'published';

create trigger groups_updated_at
  before update on public.groups
  for each row execute function private.set_updated_at();

-- RLS -----------------------------------------------------------------------------------------
alter table public.groups enable row level security;

revoke all on public.groups from public, anon, authenticated;
grant select on public.groups to authenticated;

-- Grupo em rascunho ou oculto não existe para o membro, nem pelo id direto (IDOR). Visitante não
-- lê nada: a comunidade é benefício de assinante. Aderir e publicar são o CF-093/CF-094.
create policy "membro lê grupos publicados" on public.groups
  for select to authenticated using (status = 'published');

-- Escrita auditada ------------------------------------------------------------------------------
-- Cria (sem p_id) ou atualiza um grupo. O slug não muda depois de criado: é a referência estável.
create or replace function public.save_group(
  p_slug text, p_name text, p_description text, p_status text, p_actor uuid, p_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  before_row public.groups;
  saved public.groups;
begin
  -- Toda alteração do catálogo da comunidade tem autor na trilha.
  if p_actor is null then
    raise exception 'autor obrigatório' using errcode = 'not_null_violation';
  end if;
  -- Mesmo limite do check da tabela e do contrato, para qualquer chamador.
  if p_status not in ('draft', 'published', 'hidden') then
    raise exception 'situação inválida' using errcode = 'check_violation';
  end if;

  if p_id is null then
    insert into public.groups (slug, name, description, status)
    values (p_slug, btrim(p_name), nullif(btrim(p_description), ''), p_status)
    returning * into saved;
  else
    select * into before_row from public.groups where id = p_id for update;
    if not found then
      raise exception 'grupo não encontrado' using errcode = 'no_data_found';
    end if;
    update public.groups
    set name = btrim(p_name), description = nullif(btrim(p_description), ''), status = p_status
    where id = p_id
    returning * into saved;
  end if;

  insert into public.audit_logs (actor_id, actor_role, action, target_type, target_id, before, after)
  values (
    p_actor, 'owner',
    case when p_id is null then 'group.created' else 'group.updated' end,
    'group', saved.id::text,
    case when before_row.id is not null then
      jsonb_build_object('name', before_row.name, 'description', before_row.description,
                         'status', before_row.status)
    end,
    jsonb_build_object('slug', saved.slug, 'name', saved.name, 'description', saved.description,
                       'status', saved.status)
  );
  return saved.id;
end;
$$;

revoke all on function public.save_group(text, text, text, text, uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.save_group(text, text, text, text, uuid, uuid) to service_role;
