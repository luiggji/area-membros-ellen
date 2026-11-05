import { buttonClasses, Notice } from '@caixa-forte/ui';
import type { CourseDetail } from '@caixa-forte/contracts';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { availabilityText } from '@/modules/learning/domain/catalog-view';
import { courseProgressText } from '@/modules/learning/domain/course-progress';
import { loadCourse } from '@/modules/learning/infrastructure/catalog-api';
import { CourseOutline } from '@/modules/learning/presentation/course-outline';

type Props = { params: Promise<{ slug: string }> };

/** Por onde seguir e quanto já foi concluído (CF-084): só números de progresso real. */
function CourseProgress({ course }: { course: CourseDetail }) {
  const text = courseProgressText(course.modules);
  if (course.availability !== 'available' || (!text && !course.resume)) return null;
  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:gap-6">
      {course.resume && (
        <Link href={`/app/aulas/${course.resume.lessonId}`} className={buttonClasses()}>
          {course.resume.state === 'start'
            ? 'Começar o curso'
            : `Continuar: ${course.resume.title}`}
        </Link>
      )}
      {text && <p className="text-sm text-cf-text-secondary">{text}</p>}
    </div>
  );
}

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
            <CourseProgress course={course} />
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
