import {
  BookOpen,
  CalendarCheck,
  ChartNoAxesColumn,
  Coffee,
  Crown,
  House,
  LifeBuoy,
  type LucideIcon,
  Radio,
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
};

export function NavIcon({ name, className }: { name: NavIconName; className?: string }) {
  const Icon = icons[name];
  return <Icon aria-hidden className={className} strokeWidth={1.6} />;
}
