import { ConnectionsScreen } from '@/modules/prototype/presentation/community-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

const text = (value: string | string[] | undefined) =>
  typeof value === 'string' && value.trim() ? value.slice(0, 60) : undefined;

/** Diretório de Conexões no protótipo (CF-175), com a busca na URL. */
export default async function PrototypeConnectionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  return (
    <PrototypeShell>
      <ConnectionsScreen
        query={{ cidade: text(params.cidade), uf: text(params.uf), area: text(params.area) }}
      />
    </PrototypeShell>
  );
}
