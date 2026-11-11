-- CF-092 · Grupos pelo owner: criar não publica; publicar e ocultar ficam na trilha junto da
-- escrita; o identificador não muda; a função é só da API (service_role).
begin;
select plan(13);

do $$
begin
  perform tests.create_user('ellen');
  perform tests.create_user('assinante');
end;
$$;

create temporary table alvo as select tests.user_id('ellen') as ellen;
grant select on alvo to service_role, anon, authenticated;

set local role service_role;
select lives_ok(
  $$ select public.save_group('advocacia-solo', 'Advocacia Solo', 'Quem atua sozinho.', 'draft',
       (select ellen from alvo)) $$,
  'owner cria grupo'
);
select is(
  (select status from public.groups where slug = 'advocacia-solo'),
  'draft', 'criar não publica: o grupo nasce em rascunho'
);
select throws_ok(
  $$ select public.save_group('advocacia-solo', 'Outro', null, 'draft', (select ellen from alvo)) $$,
  '23505', null, 'identificador de grupo é único'
);
select throws_ok(
  $$ select public.save_group('Advocacia Solo', 'X', null, 'draft', (select ellen from alvo)) $$,
  '23514', null, 'identificador fora do formato é recusado'
);
select throws_ok(
  $$ select public.save_group('arquivo', 'X', null, 'arquivado', (select ellen from alvo)) $$,
  '23514', null, 'situação fora das três previstas é recusada'
);
select throws_ok(
  $$ select public.save_group('sem-autor', 'X', null, 'draft', null) $$,
  '23502', null, 'salvar sem autor é recusado'
);
select throws_ok(
  $$ select public.save_group('ignorado', 'X', null, 'draft', (select ellen from alvo),
       gen_random_uuid()) $$,
  'P0002', null, 'grupo inexistente'
);
select lives_ok(
  $$ select public.save_group('ignorado', 'Advocacia Solo', 'Quem atua sozinho.', 'published',
       (select ellen from alvo), (select id from public.groups where slug = 'advocacia-solo')) $$,
  'owner publica o grupo'
);
select lives_ok(
  $$ select public.save_group('ignorado', 'Advocacia Solo', 'Quem atua sozinho.', 'hidden',
       (select ellen from alvo), (select id from public.groups where slug = 'advocacia-solo')) $$,
  'owner oculta o grupo'
);
reset role;

select is(
  (select slug from public.groups where name = 'Advocacia Solo'),
  'advocacia-solo', 'o identificador não muda na atualização'
);
-- Ordenado pelo estado resultante, não por tempo: dentro de uma transação `now()` é o mesmo
-- instante em todas as linhas, e as duas atualizações ficariam empatadas.
select results_eq(
  $$ select action, before->>'status', after->>'status' from public.audit_logs
     where target_type = 'group' order by after->>'status' $$,
  $$ values ('group.created'::text, null::text, 'draft'::text),
            ('group.updated'::text, 'published'::text, 'hidden'::text),
            ('group.updated'::text, 'draft'::text, 'published'::text) $$,
  'trilha registra criação em rascunho, publicação e ocultação, com autor'
);

select tests.authenticate_as('assinante');
select throws_ok(
  $$ select public.save_group('forjado', 'Forjado', null, 'published', null) $$,
  '42501', null, 'membro não cria grupo'
);
select tests.authenticate_as_anon();
select throws_ok(
  $$ select public.save_group('forjado', 'Forjado', null, 'published', null) $$,
  '42501', null, 'visitante não cria grupo'
);

select * from finish();
rollback;
