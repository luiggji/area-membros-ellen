import { SubscriptionScreen } from '@/modules/prototype/presentation/account-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Minha Assinatura no protótipo (CF-175). */
export default function PrototypeSubscriptionPage() {
  return (
    <PrototypeShell>
      <SubscriptionScreen />
    </PrototypeShell>
  );
}
