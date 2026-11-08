import { parseJourneyStep } from '@/modules/prototype/domain/learning-fixtures';
import { JourneyScreen } from '@/modules/prototype/presentation/journey-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Minha Jornada no protótipo (CF-174), com a etapa na URL. */
export default async function PrototypeJourneyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const step = parseJourneyStep((await searchParams).etapa);
  return (
    <PrototypeShell>
      <JourneyScreen step={step} />
    </PrototypeShell>
  );
}
