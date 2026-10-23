-- CF-035 · Onboarding inicial: objetivo principal e conclusão no próprio perfil (privado).
-- Objetivos = as três frentes da home aprovada (D-003: aprendizado, comunidade, planejamento).
-- O onboarding nunca liga directory_opt_in (continua false até escolha explícita, CF-091).
-- Aditiva. Rollback: migration compensatória (docs/runbooks/migrations.md).

alter table public.user_profiles
  add column main_goal text check (main_goal in ('aprender', 'conectar', 'planejar')),
  add column onboarding_completed_at timestamptz;

comment on column public.user_profiles.main_goal is
  'Objetivo principal escolhido no onboarding (CF-035); base das recomendações do CF-102.';
comment on column public.user_profiles.onboarding_completed_at is
  'Quando o membro concluiu o onboarding; null = retomar na primeira etapa pendente.';
