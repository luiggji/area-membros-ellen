-- CF-085 · Cofre de materiais (PRD CF-06; §8 `resources`). Metadados do material e a chave do
-- arquivo no bucket privado `materiais` (CF-162). Ninguém lê esta tabela direto: a API (service
-- role) lista os publicados para quem está logado e só emite link de download (60 s) para quem tem
-- acesso pago vigente. Exclusão pela equipe é lógica (`deleted_at`): o registro e a trilha de
-- auditoria ficam; o arquivo sai do bucket.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 2 and 160),
  description text check (description is null or char_length(description) <= 600),
  -- Assunto (categoria) livre, para agrupar no Cofre.
  subject text not null check (char_length(btrim(subject)) between 2 and 60),
  version text not null default '1' check (char_length(btrim(version)) between 1 and 20),
  license text check (license is null or char_length(license) <= 120),
  revised_on date,
  course_id uuid references public.courses (id) on delete set null,
  -- Chave gerada no servidor (id + extensão validada); nunca o nome enviado.
  storage_key text not null unique
    check (storage_key ~ '^[0-9a-f-]{36}\.(pdf|docx|xlsx|pptx|png|jpg|jpeg)$'),
  file_name text not null check (char_length(file_name) between 1 and 160),
  mime_type text not null,
  size_bytes integer not null check (size_bytes between 1 and 26214400),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (status = 'draft' or published_at is not null),
  check (deleted_at is null or status = 'draft')
);

comment on table public.materials is
  'Cofre de materiais (CF-085). Só a API lê e grava; arquivo no bucket privado materiais.';

create index materials_listing_idx on public.materials (status, subject, title)
  where deleted_at is null;

create trigger materials_updated_at before update on public.materials
  for each row execute function private.set_updated_at();

alter table public.materials enable row level security;

revoke all on public.materials from public, anon, authenticated;
grant select, insert, update, delete on public.materials to service_role;
