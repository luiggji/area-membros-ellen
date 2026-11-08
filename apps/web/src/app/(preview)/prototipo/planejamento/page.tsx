import { PlanningScreen } from '@/modules/prototype/presentation/journey-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Meu Planejamento no protótipo (CF-174). */
export default function PrototypePlanningPage() {
  return (
    <PrototypeShell>
      <PlanningScreen />
    </PrototypeShell>
  );
}
