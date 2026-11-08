import { parseCatalogFilter } from '@/modules/prototype/domain/learning-fixtures';
import { CatalogScreen } from '@/modules/prototype/presentation/learning-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Catálogo do protótipo (CF-174), com os filtros por URL. */
export default async function PrototypeCatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filter = parseCatalogFilter((await searchParams).estado);
  return (
    <PrototypeShell>
      <CatalogScreen filter={filter} />
    </PrototypeShell>
  );
}
