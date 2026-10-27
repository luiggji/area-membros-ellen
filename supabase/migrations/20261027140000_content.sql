-- CF-080 · Conteúdo: trilha → curso → módulo → aula (PRD CF-05, §8.1).
-- Estados: rascunho (só a equipe vê), agendada (aparece quando `publish_at` chega) e publicada.
-- Visibilidade em cascata: aula só aparece se o módulo, o curso e a trilha também estiverem
-- visíveis. A estrutura (títulos, ordem) é do catálogo, para quem está logado; o conteúdo da aula
-- (texto e mídia) fica em `lesson_contents`, liberado só com acesso pago vigente (CF-046) ou em
-- aula aberta. Escrita só pela API (CMS, CF-081). Horários em UTC.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

-- Visível agora? Publicado, ou agendado com a data já alcançada.
create or replace function private.content_visible(p_status text, p_publish_at timestamptz)
returns boolean
language sql
stable
set search_path = ''
as $$
  select p_status = 'published' or (p_status = 'scheduled' and p_publish_at <= now());
$$;

-- Colunas comuns de publicação, repetidas por tabela (check explícito em cada uma).
create table public.tracks (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 2 and 120),
  summary text check (summary is null or char_length(summary) <= 600),
  order_index integer not null default 0 check (order_index >= 0),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'scheduled' or publish_at is not null)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  -- Curso pode ficar fora de trilha (avulso).
  track_id uuid references public.tracks (id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 2 and 120),
  summary text check (summary is null or char_length(summary) <= 600),
  order_index integer not null default 0 check (order_index >= 0),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'scheduled' or publish_at is not null)
);

create table public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 2 and 120),
  order_index integer not null default 0 check (order_index >= 0),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'scheduled' or publish_at is not null)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules (id) on delete restrict,
  title text not null check (char_length(btrim(title)) between 2 and 160),
  summary text check (summary is null or char_length(summary) <= 600),
  kind text not null default 'video' check (kind in ('video', 'text')),
  duration_minutes integer check (duration_minutes is null or duration_minutes between 1 and 600),
  -- Aula aberta: conteúdo liberado para quem está logado, mesmo sem assinatura (degustação).
  is_free boolean not null default false,
  order_index integer not null default 0 check (order_index >= 0),
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'published')),
  publish_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status <> 'scheduled' or publish_at is not null)
);

-- Conteúdo protegido da aula: texto e referência opaca da mídia no provedor (P-007), nunca URL
-- pública. Separado da estrutura para o paywall valer no banco, não só na tela.
create table public.lesson_contents (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  body_md text check (body_md is null or char_length(body_md) <= 50000),
  media_ref text check (media_ref is null or char_length(media_ref) <= 500),
  updated_at timestamptz not null default now()
);

comment on table public.tracks is 'Trilhas (CF-080). Catálogo para quem está logado; só a API grava.';
comment on table public.courses is 'Cursos (CF-080). Visíveis em cascata com a trilha; só a API grava.';
comment on table public.course_modules is 'Módulos (CF-080). Visíveis em cascata com o curso.';
comment on table public.lessons is 'Aulas (CF-080). Estrutura do catálogo; o conteúdo fica em lesson_contents.';
comment on table public.lesson_contents is
  'Conteúdo da aula (CF-080). Só com acesso pago vigente (CF-046) ou aula aberta.';

create index courses_track_order_idx on public.courses (track_id, order_index);
create index course_modules_course_order_idx on public.course_modules (course_id, order_index);
create index lessons_module_order_idx on public.lessons (module_id, order_index);

create trigger tracks_updated_at before update on public.tracks
  for each row execute function private.set_updated_at();
create trigger courses_updated_at before update on public.courses
  for each row execute function private.set_updated_at();
create trigger course_modules_updated_at before update on public.course_modules
  for each row execute function private.set_updated_at();
create trigger lessons_updated_at before update on public.lessons
  for each row execute function private.set_updated_at();
create trigger lesson_contents_updated_at before update on public.lesson_contents
  for each row execute function private.set_updated_at();

-- Visibilidade em cascata, avaliada no banco (security definer: lê a cadeia sem depender da RLS).
create or replace function private.course_visible(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.courses c
    left join public.tracks t on t.id = c.track_id
    where c.id = p_course_id
      and private.content_visible(c.status, c.publish_at)
      and (c.track_id is null or private.content_visible(t.status, t.publish_at))
  );
$$;

create or replace function private.lesson_visible(p_lesson_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.lessons l
    join public.course_modules m on m.id = l.module_id
    where l.id = p_lesson_id
      and private.content_visible(l.status, l.publish_at)
      and private.content_visible(m.status, m.publish_at)
      and private.course_visible(m.course_id)
  );
$$;

-- Acesso pago de quem está logado, sem aceitar outro usuário como argumento (revisão da CF-046).
create or replace function private.i_have_access(p_scope text default 'caixa_forte')
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.has_access((select auth.uid()), p_scope);
$$;

-- Schema private: as policies chamam funções daqui. Antes de abrir `usage`, fecha o EXECUTE
-- padrão de todas as funções do schema e libera só as que as policies usam.
revoke execute on all functions in schema private from public;
grant usage on schema private to authenticated;
grant execute on function private.content_visible(text, timestamptz) to authenticated;
grant execute on function private.course_visible(uuid) to authenticated;
grant execute on function private.lesson_visible(uuid) to authenticated;
grant execute on function private.i_have_access(text) to authenticated;

-- RLS ------------------------------------------------------------------------------------------
alter table public.tracks enable row level security;
alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_contents enable row level security;

revoke all on public.tracks, public.courses, public.course_modules, public.lessons,
  public.lesson_contents from public, anon, authenticated;
grant select on public.tracks, public.courses, public.course_modules, public.lessons,
  public.lesson_contents to authenticated;
grant select, insert, update, delete on public.tracks, public.courses, public.course_modules,
  public.lessons, public.lesson_contents to service_role;

create policy "logado lê trilhas visíveis" on public.tracks
  for select to authenticated using (private.content_visible(status, publish_at));

create policy "logado lê cursos visíveis" on public.courses
  for select to authenticated using (private.course_visible(id));

create policy "logado lê módulos visíveis" on public.course_modules
  for select to authenticated
  using (private.content_visible(status, publish_at) and private.course_visible(course_id));

create policy "logado lê aulas visíveis" on public.lessons
  for select to authenticated using (private.lesson_visible(id));

-- Paywall no banco: conteúdo só de aula visível e com acesso pago vigente, ou aula aberta.
create policy "conteúdo com acesso pago ou aula aberta" on public.lesson_contents
  for select to authenticated
  using (
    private.lesson_visible(lesson_id)
    and (
      (select private.i_have_access())
      or exists (select 1 from public.lessons l where l.id = lesson_id and l.is_free)
    )
  );
