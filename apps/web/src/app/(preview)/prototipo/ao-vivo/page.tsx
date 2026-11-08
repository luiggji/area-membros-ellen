import { LiveScreen } from '@/modules/prototype/presentation/events-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Ao Vivo no protótipo (CF-175). */
export default function PrototypeLivePage() {
  return (
    <PrototypeShell>
      <LiveScreen />
    </PrototypeShell>
  );
}
