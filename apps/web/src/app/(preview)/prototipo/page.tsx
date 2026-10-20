import { parseHomeVariant } from '@/modules/prototype/domain/fixtures';
import {
  AuxiliaryCards,
  EditorialHero,
  FeaturedCourses,
  JourneyFocusCard,
} from '@/modules/prototype/presentation/home-sections';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Home do membro v1.1 (doc G §4.1): 1 hero + 1 jornada + 3 cursos + 2 auxiliares. */
export default async function PrototypeHomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const variant = parseHomeVariant((await searchParams).estado);
  return (
    <PrototypeShell activeSlug="">
      <div className="flex flex-col gap-10 sm:gap-12">
        <EditorialHero />
        <JourneyFocusCard variant={variant} />
        <FeaturedCourses />
        <AuxiliaryCards />
      </div>
    </PrototypeShell>
  );
}
