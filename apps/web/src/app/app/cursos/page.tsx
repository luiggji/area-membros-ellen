import { CourseCard, CourseCover, CourseGrid, Notice } from '@caixa-forte/ui';
import { BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

import {
  availabilityText,
  emptyCatalogText,
  filterCatalog,
  parseCatalogFilter,
} from '@/modules/learning/domain/catalog-view';
import { loadCatalog } from '@/modules/learning/infrastructure/catalog-api';
import { CatalogFilters } from '@/modules/learning/presentation/catalog-filters';

export const metadata: Metadata = { title: 'Cursos · Caixa Forte' };

type Props = { searchParams: Promise<{ estado?: string | string[] }> };

/**
 * Catálogo (CF-082): cursos disponíveis e programados (com a data verdadeira), na ordem da
 * owner. Rascunho nunca aparece; o conteúdo das aulas fica atrás do paywall no player.
 */
export default async function CatalogPage({ searchParams }: Props) {
  const filter = parseCatalogFilter((await searchParams).estado);
  const catalog = await loadCatalog();
  const courses = catalog ? filterCatalog(catalog.courses, filter) : [];

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-6xl flex-col gap-8 py-12">
      <header className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
            Cursos
          </h1>
          <p className="text-cf-text-secondary">
            O que já está disponível e o que tem data marcada para entrar.
          </p>
        </div>
        <CatalogFilters current={filter} />
      </header>

      {catalog === null ? (
        <Notice tone="danger">
          Não foi possível carregar os cursos agora. Recarregue a página.
        </Notice>
      ) : (
        <CourseGrid empty={emptyCatalogText(filter)}>
          {courses.map((course, index) => (
            <li key={course.slug}>
              <CourseCard
                title={course.title}
                summary={course.summary ?? ''}
                status={course.availability === 'available' ? 'disponivel' : 'programado'}
                statusText={availabilityText(course)}
                href={`/app/cursos/${course.slug}`}
                linkAs={Link}
                cover={<CourseCover tone={index} icon={<BookOpen className="size-5" />} />}
              />
            </li>
          ))}
        </CourseGrid>
      )}
    </div>
  );
}
