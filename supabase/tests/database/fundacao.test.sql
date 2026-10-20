-- CF-016 · Smoke da fundação: o banco sobe do zero com as migrations e os helpers funcionam.
begin;
create extension if not exists pgtap with schema extensions;
select plan(5);

select has_schema('private', 'schema private existe');
select has_function('private', 'set_updated_at', array[]::name[], 'helper de updated_at existe');
select ok(
  not has_schema_privilege('anon', 'private', 'usage'),
  'anon não acessa o schema private'
);
select ok(
  not has_schema_privilege('authenticated', 'private', 'usage'),
  'authenticated não acessa o schema private'
);

create temporary table exemplo (id int primary key, updated_at timestamptz not null);
create trigger exemplo_updated_at before update on exemplo
  for each row execute function private.set_updated_at();
insert into exemplo values (1, '2000-01-01T00:00:00Z');
update exemplo set id = 1 where id = 1;
select ok(
  (select updated_at > '2000-01-01T00:00:00Z' from exemplo),
  'set_updated_at atualiza a coluna no UPDATE'
);

select * from finish();
rollback;
