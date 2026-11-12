import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import { findMember } from '../domain/community-fixtures';
import { parseHomeVariant } from '../domain/fixtures';
import {
  findCourse,
  findLesson,
  parseCatalogFilter,
  parseJourneyStep,
} from '../domain/learning-fixtures';
import { HelpScreen, SubscriptionScreen } from './account-screens';
import {
  CommunityScreen,
  ConnectionsScreen,
  MemberProfileScreen,
  parseCommunityTab,
} from './community-screens';
import { CafeScreen, LiveScreen, TicketScreen } from './events-screens';
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

/** `/app/comunidade` virou rota real no CF-093; a demonstração passa a ser chamada por ela. */
export function DemoCommunity({ search }: { search: Search }) {
  return <CommunityScreen tab={parseCommunityTab(search.aba)} />;
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

const text = (value: Search[string]) =>
  typeof value === 'string' && value.trim() ? value.slice(0, 60) : undefined;

type Section = (rest: string[], search: Search) => ReactNode | null;
const only =
  (screen: () => ReactNode): Section =>
  (rest) =>
    rest.length === 0 ? screen() : null;

/** Destinos do menu que ainda não têm página real (`/app/[...secao]`). */
const sections: Record<string, Section> = {
  planejamento: only(() => <PlanningScreen />),
  comunidade: (rest, search) =>
    rest.length === 0 ? <CommunityScreen tab={parseCommunityTab(search.aba)} /> : null,
  conexoes: (rest, search) => {
    if (rest.length === 0) {
      return (
        <ConnectionsScreen
          query={{ cidade: text(search.cidade), uf: text(search.uf), area: text(search.area) }}
        />
      );
    }
    const member = rest.length === 1 ? findMember(rest[0]!) : undefined;
    return member ? <MemberProfileScreen member={member} /> : null;
  },
  'ao-vivo': only(() => <LiveScreen />),
  cafe: (rest) =>
    rest.length === 0 ? <CafeScreen /> : rest.join('/') === 'ingresso' ? <TicketScreen /> : null,
  ajuda: only(() => <HelpScreen />),
};

export function demoSection(segments: string[], search: Search): ReactNode | null {
  const [slug, ...rest] = segments;
  return (slug && sections[slug]?.(rest, search)) ?? null;
}

export function DemoSubscription() {
  return <SubscriptionScreen />;
}

export function DemoCafe() {
  return <CafeScreen />;
}
