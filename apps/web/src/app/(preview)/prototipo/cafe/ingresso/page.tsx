import { TicketScreen } from '@/modules/prototype/presentation/events-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Ingresso do Café no protótipo (CF-175). */
export default function PrototypeTicketPage() {
  return (
    <PrototypeShell>
      <TicketScreen />
    </PrototypeShell>
  );
}
