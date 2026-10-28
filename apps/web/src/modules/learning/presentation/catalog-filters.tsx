import { cn } from '@caixa-forte/ui';
import Link from 'next/link';

import { CATALOG_FILTERS, type CatalogFilter } from '../domain/catalog-view';

/** Filtros discretos do catálogo: links (funcionam sem JS) com o atual marcado. */
export function CatalogFilters({ current }: { current: CatalogFilter }) {
  return (
    <nav aria-label="Filtrar cursos">
      <ul className="flex flex-wrap gap-2">
        {(Object.keys(CATALOG_FILTERS) as CatalogFilter[]).map((filter) => {
          const active = filter === current;
          return (
            <li key={filter}>
              <Link
                href={filter === 'todos' ? '/app/cursos' : `/app/cursos?estado=${filter}`}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors',
                  active
                    ? 'border-cf-primary bg-cf-primary text-cf-surface'
                    : 'border-cf-border bg-cf-surface text-cf-text hover:border-cf-primary',
                )}
              >
                {CATALOG_FILTERS[filter]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
