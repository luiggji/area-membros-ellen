-- CF-084 · Progresso por membro (PRD §8: lesson_progress, UNIQUE(user_id, lesson_id)).
-- Uma linha por pessoa e aula: última posição do vídeo e quando concluiu. Cada pessoa lê só o
-- próprio progresso; escrita só pela API, que antes confere se a aula está liberada para quem
-- grava (acesso pago vigente ou aula aberta). Republicar ou editar a aula não apaga progresso;
-- apagar a aula (ou a conta) leva junto as linhas dela.
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  last_position_seconds integer not null default 0
    check (last_position_seconds between 0 and 86400),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

comment on table public.lesson_progress is
  'Progresso por membro e aula (CF-084). Lido pelo dono; gravado só pela API.';

-- "Continuar aula": a aula mexida mais recentemente pela pessoa.
create index lesson_progress_user_recent_idx on public.lesson_progress (user_id, updated_at desc);

create trigger lesson_progress_updated_at before update on public.lesson_progress
  for each row execute function private.set_updated_at();

alter table public.lesson_progress enable row level security;

revoke all on public.lesson_progress from public, anon, authenticated;
grant select on public.lesson_progress to authenticated;
grant select, insert, update, delete on public.lesson_progress to service_role;

create policy "cada pessoa lê o próprio progresso" on public.lesson_progress
  for select to authenticated using (user_id = (select auth.uid()));
