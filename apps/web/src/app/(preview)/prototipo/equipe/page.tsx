import type { Metadata } from 'next';

import { TeamOverview } from '@/modules/prototype/presentation/team-overview';
import { TeamPrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

export const metadata: Metadata = { title: 'Equipe · Protótipo · Caixa Forte' };

/** Shell do painel da equipe (CF-020) com a visão geral vazia e honesta. */
export default function TeamPrototypePage() {
  return (
    <TeamPrototypeShell>
      <TeamOverview />
    </TeamPrototypeShell>
  );
}
