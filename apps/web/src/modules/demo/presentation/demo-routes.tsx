import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { parseHomeVariant } from '../domain/fixtures';
import {
  findCourse,
  findLesson,
  parseCatalogFilter,
  parseJourneyStep,
} from '../domain/learning-fixtures';
import { HomeAuxiliary, HomeCourses, HomeHero, HomeJourney } from './home-sections';
import { JourneyScreen, PlanningScreen } from './journey-screens';
import { CatalogScreen, CourseScreen, LessonScreen } from './learning-screens';
import { parseVaultCategory, VaultScreen } from './vault-screen';

/**
 * Telas do modo demonstração (CF-177) prontas para as rotas oficiais de `/app`. Cada página real
 * chama a sua quando `demoMode()` está ligado; sem o modo, nada daqui é usado.
 */

type Search = Record<string, string | string[] | undefined>;

export function DemoHome({ search }: { search: Search }) {
  return (
    <div className="flex flex-col gap-7 pt-2 pb-12 sm:gap-8">
      <HomeHero />
      <HomeJourney variant={parseHomeVariant(search.estado)} />
      <HomeCourses />
      <HomeAuxiliary />
    </div>
  );
}

export function DemoCatalog({ search }: { search: Search }) {
  return <CatalogScreen filter={parseCatalogFilter(search.estado)} />;
}

export function DemoCourse({ slug }: { slug: string }) {
  const course = findCourse(slug);
  if (!course) notFound();
  return <CourseScreen course={course} />;
}

export function DemoLesson({ id }: { id: string }) {
  if (!findLesson(id)) notFound();
  return <LessonScreen lessonId={id} />;
}

export function DemoVault({ search }: { search: Search }) {
  return <VaultScreen category={parseVaultCategory(search.categoria)} />;
}

export function DemoJourney({ search }: { search: Search }) {
  return <JourneyScreen step={parseJourneyStep(search.passo)} />;
}

/** Destinos do menu que ainda não têm página real (`/app/[...secao]`). */
const sections: Record<string, (rest: string[]) => ReactNode | null> = {
  planejamento: (rest) => (rest.length === 0 ? <PlanningScreen /> : null),
};

export function demoSection(segments: string[]): ReactNode | null {
  const [slug, ...rest] = segments;
  return (slug && sections[slug]?.(rest)) ?? null;
}
