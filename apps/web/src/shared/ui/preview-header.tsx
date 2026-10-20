import { cn } from '@caixa-forte/ui';
import Link from 'next/link';

import { BrandMark } from './brand-mark';

const links = [
  { href: '/prototipo', label: 'Protótipo' },
  { href: '/design', label: 'Design' },
  { href: '/status', label: 'Status' },
] as const;

/** Cabeçalho das rotas internas de `/design` e `/status` (o protótipo tem shell próprio). */
export function PreviewHeader({ active }: { active: '/design' | '/status' }) {
  return (
    <header className="border-b border-cf-border bg-cf-surface">
      <div className="mx-auto flex max-w-(--spacing-content-max) flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <div className="flex flex-col gap-1">
          <BrandMark />
          <span className="text-xs text-cf-text-secondary">Rota interna · fora de produção</span>
        </div>
        <nav aria-label="Rotas internas" className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.href === active ? 'page' : undefined}
              className={cn(
                'inline-flex min-h-11 items-center rounded-full px-4 text-sm text-cf-text-secondary hover:bg-cf-surface-muted hover:text-cf-text',
                link.href === active && 'bg-cf-surface-muted font-medium text-cf-primary',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
