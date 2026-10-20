import { parseHomeVariant } from '@/modules/prototype/domain/fixtures';
import {
  HomeAuxiliary,
  HomeCourses,
  HomeHero,
  HomeJourney,
} from '@/modules/prototype/presentation/home-sections';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Home do membro (doc G §4.1): 1 hero + 1 jornada + 3 cursos + 2 auxiliares. */
export default async function PrototypeHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const variant = parseHomeVariant((await searchParams).estado);
  return (
    <PrototypeShell>
      <div className="flex flex-col gap-7 pt-2 sm:gap-8">
        <HomeHero />
        <HomeJourney variant={variant} />
        <HomeCourses />
        <HomeAuxiliary />
      </div>
    </PrototypeShell>
  );
}
