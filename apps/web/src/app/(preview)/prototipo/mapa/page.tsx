import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';
import { ScreenMap } from '@/modules/prototype/presentation/screen-map';

/** Índice de todas as telas do protótipo (CF-174). */
export default function PrototypeMapPage() {
  return (
    <PrototypeShell>
      <ScreenMap />
    </PrototypeShell>
  );
}
