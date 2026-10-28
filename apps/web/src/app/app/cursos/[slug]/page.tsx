import { Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { availabilityText } from '@/modules/learning/domain/catalog-view';
import { loadCourse } from '@/modules/learning/infrastructure/catalog-api';
import { CourseOutline } from '@/modules/learning/presentation/course-outline';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await loadCourse((await params).slug);
  return {
    title:
      course && course !== 'not_found' ? `${course.title} · Caixa Forte` : 'Cursos · Caixa Forte',
  };
}

/**
 * Página do curso (CF-082): resumo e a estrutura liberada (módulos e aulas). Curso programado
 * mostra só a data verdadeira; rascunho ou inexistente responde 404. O player entra no CF-083.
 */
export default async function CoursePage({ params }: Props) {
  const course = await loadCourse((await params).slug);
  if (course === 'not_found') notFound();

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-8 py-12">
      <Link href="/app/cursos" className="text-sm text-cf-primary underline underline-offset-4">
        Cursos
      </Link>
      {course === null ? (
        <Notice tone="danger">Não foi possível carregar o curso agora. Recarregue a página.</Notice>
      ) : (
        <>
          <header className="flex flex-col gap-2">
            <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
              {course.title}
            </h1>
            {course.summary && <p className="text-cf-text-secondary">{course.summary}</p>}
          </header>
          {course.availability === 'scheduled' ? (
            <Notice>
              {availabilityText(course)}. As aulas aparecem aqui quando o curso for liberado.
            </Notice>
          ) : (
            <CourseOutline modules={course.modules} />
          )}
        </>
      )}
    </div>
  );
}
