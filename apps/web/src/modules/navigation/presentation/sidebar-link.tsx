import { cn } from '@caixa-forte/ui';
import Link from 'next/link';

import type { NavIconName } from '../domain/member-nav';
import { NavIcon } from './nav-icon';

/** Item da sidebar ameixa (kit V2: 48px, raio 12px, ativo em vinho). */
export function SidebarLink({
  href,
  icon,
  label,
  active,
  nested = false,
}: {
  href: string;
  icon: NavIconName;
  label: string;
  active: boolean;
  nested?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex min-h-12 items-center gap-3 rounded-md px-4 text-cream-50/85 transition-colors duration-200',
        'hover:bg-cream-50/8 hover:text-cream-50 focus-visible:outline-champagne-500',
        nested ? 'min-h-11 pr-2 pl-6 text-sm' : 'text-[0.95rem]',
        active && 'bg-cf-primary text-cream-50 hover:bg-cf-primary',
      )}
    >
      <NavIcon name={icon} className="size-5 shrink-0" />
      {label}
    </Link>
  );
}
