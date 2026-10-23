-- CF-031 · Perfil pessoal e consentimentos versionados (PRD §8.1 user_profiles/consents).
-- Perfil: só o titular lê e edita. Consentimento: histórico imutável por versão de documento;
-- aceita-se só versão publicada. Nenhum texto jurídico é criado aqui (P-012, pendente).
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

-- Perfil ------------------------------------------------------------------------------------
create table public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text check (name is null or char_length(btrim(name)) between 2 and 80),
  city text check (city is null or char_length(btrim(city)) between 2 and 80),
  state text check (
    state is null or state in (
      'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI',
      'RJ','RN','RS','RO','RR','SC','SP','SE','TO'
    )
  ),
  professional_stage text check (professional_stage in ('iniciante', 'solo', 'equipe')),
  bio text check (bio is null or char_length(bio) <= 500),
  -- Aparecer no diretório é opt-in explícito (PRD CF-08, LGPD); o padrão é não aparecer.
  directory_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_profiles is
  'Perfil pessoal (CF-031). Só o titular lê/edita; diretório só com opt-in (CF-091).';

create index user_profiles_state_city_idx on public.user_profiles (state, city);

create trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function private.set_updated_at();

alter table public.user_profiles enable row level security;
revoke all on public.user_profiles from public, anon, authenticated;
grant select, update on public.user_profiles to authenticated;
grant select, insert, update on public.user_profiles to service_role;

create policy "titular lê o próprio perfil" on public.user_profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "titular edita o próprio perfil" on public.user_profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- Perfil nasce com o cadastro, já com o nome informado (user_metadata.name).
create or replace function private.create_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.user_profiles (id, name)
  values (new.id, nullif(btrim(new.raw_user_meta_data ->> 'name'), ''))
  on conflict do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_create_profile
  after insert on auth.users
  for each row execute function private.create_profile();

-- Quem já existia antes desta migration também ganha perfil (o trigger só vale para novos).
insert into public.user_profiles (id, name)
select id, nullif(btrim(raw_user_meta_data ->> 'name'), '') from auth.users
on conflict do nothing;

-- Documentos versionados --------------------------------------------------------------------
create table public.policy_versions (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('terms', 'privacy', 'directory', 'marketing')),
  version text not null check (version ~ '^[0-9]+\.[0-9]+$'),
  title text not null,
  body_md text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (kind, version),
  check ((status = 'draft') = (published_at is null))
);

comment on table public.policy_versions is
  'Versões de termos/privacidade/consentimentos (CF-031). Texto final vem do jurídico (P-012).';

-- Texto de documento é público (qualquer um pode ler o que vai aceitar); só a API publica.
alter table public.policy_versions enable row level security;
revoke all on public.policy_versions from public, anon, authenticated;
grant select on public.policy_versions to anon, authenticated;
grant select, insert, update on public.policy_versions to service_role;

create policy "versões publicadas são públicas" on public.policy_versions
  for select to anon, authenticated using (status <> 'draft');

-- Consentimentos ----------------------------------------------------------------------------
create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  policy_version_id uuid not null references public.policy_versions (id),
  accepted_at timestamptz not null default now(),
  revoked_at timestamptz,
  check (revoked_at is null or revoked_at >= accepted_at)
);

comment on table public.consents is
  'Aceites com histórico imutável (CF-031): aceitar insere; revogar só preenche revoked_at, uma vez.';

-- Um aceite ativo por usuário e versão; o histórico de revogados permanece.
create unique index consents_one_active_idx
  on public.consents (user_id, policy_version_id) where revoked_at is null;

alter table public.consents enable row level security;
revoke all on public.consents from public, anon, authenticated;
grant select, insert on public.consents to authenticated;
grant update (revoked_at) on public.consents to authenticated;
grant select, insert on public.consents to service_role;

create policy "titular lê os próprios aceites" on public.consents
  for select to authenticated using (user_id = (select auth.uid()));
create policy "titular aceita versão publicada" on public.consents
  for insert to authenticated with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from public.policy_versions v
      where v.id = policy_version_id and v.status = 'published'
    )
  );
create policy "titular revoga o próprio aceite" on public.consents
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Imutável: nada além de preencher revoked_at uma única vez; nunca apagar.
create or replace function private.guard_consent_history()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'consents é histórico: DELETE não é permitido' using errcode = 'insufficient_privilege';
  end if;
  if old.revoked_at is not null
     or new.user_id <> old.user_id
     or new.policy_version_id <> old.policy_version_id
     or new.accepted_at <> old.accepted_at then
    raise exception 'consents é histórico: só é possível revogar, uma vez' using errcode = 'insufficient_privilege';
  end if;
  return new;
end;
$$;

create trigger consents_history_guard
  before update or delete on public.consents
  for each row execute function private.guard_consent_history();
