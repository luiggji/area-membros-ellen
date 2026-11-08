import {
  CommunityScreen,
  parseCommunityTab,
} from '@/modules/prototype/presentation/community-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Comunidade no protótipo (CF-175), com a aba na URL. */
export default async function PrototypeCommunityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const tab = parseCommunityTab((await searchParams).aba);
  return (
    <PrototypeShell>
      <CommunityScreen tab={tab} />
    </PrototypeShell>
  );
}
