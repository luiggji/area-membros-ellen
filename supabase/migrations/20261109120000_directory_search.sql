-- CF-091 · Busca no diretório (PRD CF-07): só quem tem perfil público, aceite ativo da versão
-- publicada do termo do diretório e acesso vigente. Filtros por UF, cidade, área e nome, sem
-- diferenciar maiúsculas e acentos. Devolve só os campos do perfil público (nunca e-mail ou
-- telefone, que nem existem em `directory_profiles`).
-- Quem chama é a API, com a chave de serviço, depois de conferir sessão, assinatura e rate limit:
-- `authenticated` e `anon` não executam, para a busca não virar um caminho de raspagem direto.
-- Aditiva. Rollback: `drop function` das três funções (docs/runbooks/migrations.md).

-- Forma de comparação: minúsculas e sem acento (o `unaccent` não está habilitado no projeto).
create or replace function private.fold(p_text text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(translate(
    p_text,
    'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇç',
    'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCc'
  ));
$$;

-- "Contém" para LIKE, com `%`, `_` e `\` digitados tratados como texto.
create or replace function private.contains_pattern(p_text text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select '%' || replace(replace(replace(private.fold(p_text), '\', '\\'), '%', '\%'), '_', '\_') || '%';
$$;

create or replace function public.search_directory(
  p_state text default null,
  p_city text default null,
  p_area text default null,
  p_name text default null,
  p_limit int default 12,
  p_offset int default 0
)
returns table (
  user_id uuid,
  display_name text,
  city text,
  state text,
  areas text[],
  bio text,
  links text[]
)
language sql
stable
security definer
set search_path = ''
as $$
  select d.user_id, d.display_name, d.city, d.state, d.areas, d.bio, d.links
  from public.directory_profiles d
  where exists (
      select 1
      from public.consents c
      join public.policy_versions v on v.id = c.policy_version_id
      where c.user_id = d.user_id
        and c.revoked_at is null
        and v.kind = 'directory'
        and v.status = 'published'
    )
    and private.has_access(d.user_id)
    and (p_state is null or d.state = p_state)
    and (p_city is null or private.fold(d.city) like private.contains_pattern(p_city))
    and (
      p_area is null
      or exists (
        select 1 from unnest(d.areas) as a (area)
        where private.fold(a.area) like private.contains_pattern(p_area)
      )
    )
    and (p_name is null or private.fold(d.display_name) like private.contains_pattern(p_name))
  -- Ordem estável para a paginação não repetir nem pular ninguém entre páginas.
  order by private.fold(d.display_name), d.user_id
  -- Teto no banco também: mesmo um chamador com a chave de serviço não lista tudo de uma vez.
  limit least(greatest(p_limit, 1), 25)
  offset greatest(p_offset, 0);
$$;

comment on function public.search_directory(text, text, text, text, int, int) is
  'Busca no diretório (CF-091): só perfis com aceite ativo do termo e acesso vigente. Só a API.';

revoke all on function private.fold(text) from public, anon, authenticated;
revoke all on function private.contains_pattern(text) from public, anon, authenticated;
revoke all on function public.search_directory(text, text, text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.search_directory(text, text, text, text, int, int) to service_role;
