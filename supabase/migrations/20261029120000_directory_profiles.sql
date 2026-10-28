-- CF-090 · Perfil público do diretório (PRD CF-07), separado do perfil pessoal (CF-031).
-- Só campos que o membro escolhe mostrar: nome profissional, cidade/UF, áreas, apresentação curta
-- e links. E-mail, telefone e endereço nunca entram aqui. Aparecer no diretório não é uma coluna:
-- é ter aceite ativo da versão publicada do termo do diretório (`consents`, kind `directory`).
-- Revogar o aceite tira a pessoa do diretório na hora, sem flag para ficar desatualizada.
-- Só o titular lê e edita a própria linha; a busca de outros membros (CF-091) passa pela API.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

create table public.directory_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  city text check (city is null or char_length(btrim(city)) between 2 and 80),
  state text check (
    state is null or state in (
      'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI',
      'RJ','RN','RS','RO','RR','SC','SP','SE','TO'
    )
  ),
  -- Áreas de atuação: até 5, cada uma com 2 a 40 caracteres (sem "|", que separa na conferência).
  areas text[] not null default '{}' check (
    areas = '{}'
    or (
      array_position(areas, null) is null
      and array_to_string(areas, '|') ~ '^[^|]{2,40}(\|[^|]{2,40}){0,4}$'
    )
  ),
  bio text check (bio is null or char_length(bio) <= 280),
  -- Links que a pessoa consente em mostrar: até 3, só https, sem espaço.
  links text[] not null default '{}' check (
    links = '{}'
    or (
      array_position(links, null) is null
      and array_to_string(links, ' ') ~ '^https://\S{3,200}( https://\S{3,200}){0,2}$'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.directory_profiles is
  'Perfil público do diretório (CF-090). Visível a outros só com aceite ativo do termo do diretório.';

create index directory_profiles_state_city_idx on public.directory_profiles (state, city);

create trigger directory_profiles_updated_at before update on public.directory_profiles
  for each row execute function private.set_updated_at();

alter table public.directory_profiles enable row level security;

revoke all on public.directory_profiles from public, anon, authenticated;
grant select, insert, update, delete on public.directory_profiles to authenticated;
grant select, insert, update, delete on public.directory_profiles to service_role;

create policy "titular lê o próprio perfil público" on public.directory_profiles
  for select to authenticated using (user_id = (select auth.uid()));
create policy "titular cria o próprio perfil público" on public.directory_profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "titular edita o próprio perfil público" on public.directory_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "titular apaga o próprio perfil público" on public.directory_profiles
  for delete to authenticated using (user_id = (select auth.uid()));

-- Fecha a brecha do CF-031: o titular podia ligar `user_profiles.directory_opt_in` direto, sem
-- aceite. A coluna fica (migration aditiva), mas só a API muda; a presença no diretório vem do
-- aceite do termo. O titular continua editando os campos que o web usa.
revoke update on public.user_profiles from authenticated;
grant update (name, city, state, professional_stage, bio, main_goal, onboarding_completed_at)
  on public.user_profiles to authenticated;
comment on column public.user_profiles.directory_opt_in is
  'Legado: presença no diretório vem do aceite do termo (CF-090). Não editável pelo titular.';
