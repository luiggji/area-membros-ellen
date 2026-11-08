import { HelpScreen } from '@/modules/prototype/presentation/account-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Ajuda no protótipo (CF-175). */
export default function PrototypeHelpPage() {
  return (
    <PrototypeShell>
      <HelpScreen />
    </PrototypeShell>
  );
}
