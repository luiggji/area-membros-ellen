import { CafeScreen } from '@/modules/prototype/presentation/events-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Café Estratégico no protótipo (CF-175). */
export default function PrototypeCafePage() {
  return (
    <PrototypeShell>
      <CafeScreen />
    </PrototypeShell>
  );
}
