import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';
import { parseVaultCategory, VaultScreen } from '@/modules/prototype/presentation/vault-screen';

/** Cofre de Materiais no protótipo (CF-174), com a categoria na URL. */
export default async function PrototypeVaultPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const category = parseVaultCategory((await searchParams).categoria);
  return (
    <PrototypeShell>
      <VaultScreen category={category} />
    </PrototypeShell>
  );
}
