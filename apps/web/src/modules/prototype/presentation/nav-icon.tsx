import {
  BookOpen,
  CalendarDays,
  CalendarCheck,
  ChartNoAxesColumn,
  ChartPie,
  Coffee,
  Crown,
  FilePen,
  House,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  Radio,
  ScanLine,
  ShieldCheck,
  UserRoundSearch,
  Users,
  Vault,
} from 'lucide-react';

import type { NavIcon as NavIconName } from '../domain/fixtures';

const icons: Record<NavIconName, LucideIcon> = {
  home: House,
  journey: ChartNoAxesColumn,
  courses: BookOpen,
  community: Users,
  cafe: Coffee,
  subscription: Crown,
  connections: UserRoundSearch,
  live: Radio,
  vault: Vault,
  planning: CalendarCheck,
  help: LifeBuoy,
  overview: LayoutDashboard,
  events: CalendarDays,
  checkin: ScanLine,
  content: FilePen,
  moderation: ShieldCheck,
  reports: ChartPie,
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden className={className} strokeWidth={1.6} />;
}
