import type { ReactNode } from 'react';

import { parseCheckinResult, parseReportPeriod } from '../domain/team-fixtures';
import { CheckinScreen, EventsAdminScreen, ModerationScreen, ReportsScreen } from './team-screens';

type Search = Record<string, string | string[] | undefined>;

/**
 * Telas do painel da equipe no modo demonstração (CF-176/CF-177), servidas por
 * `/admin/[...rest]` só depois da portaria e da permissão do papel.
 */
const screens: Record<string, (search: Search) => ReactNode> = {
  eventos: () => <EventsAdminScreen />,
  checkin: (search) => <CheckinScreen result={parseCheckinResult(search.resultado)} />,
  moderacao: () => <ModerationScreen />,
  relatorios: (search) => <ReportsScreen period={parseReportPeriod(search.periodo)} />,
};

export function demoAdminScreen(slug: string, search: Search): ReactNode | null {
  return screens[slug]?.(search) ?? null;
}
