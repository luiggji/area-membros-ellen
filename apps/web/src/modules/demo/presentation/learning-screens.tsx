import {
  Button,
  buttonClasses,
  CourseCard,
  CourseCover,
  CourseGrid,
  Notice,
} from '@caixa-forte/ui';
import {
  ArrowRight,
  CheckCircle2,
  Diamond,
  FileText,
  PenLine,
  PlayCircle,
  Sparkle,
} from 'lucide-react';
import Link from 'next/link';

import {
  type CatalogFilter,
  type ExampleCatalogCourse,
  type ExampleLesson,
  filterCourses,
  findLesson,
  exampleMaterials,
} from '../domain/learning-fixtures';
import { hrefFor } from './nav-links';
import { ExampleTag, LinkTabs, PageHeader, ScreenPage } from './page-parts';

const courseIcons = { diamond: Diamond, spark: Sparkle, pen: PenLine };
const courseHref = (slug: string) => hrefFor(`cursos/${slug}`);
const lessonHref = (id: string) => hrefFor(`aulas/${id}`);

const filters = [
  { value: 'todos', label: 'Todos', href: hrefFor('cursos') },
  { value: 'disponiveis', label: 'Disponíveis', href: `${hrefFor('cursos')}?estado=disponiveis` },
  { value: 'programados', label: 'Programados', href: `${hrefFor('cursos')}?estado=programados` },
];

/** Catálogo (doc G §4.2): cabeçalho pequeno, filtros discretos, grid 3/2/1. */
export function CatalogScreen({ filter }: { filter: CatalogFilter }) {
  const courses = filterCourses(filter);
  return (
    <ScreenPage>
      <PageHeader
        title="Cursos"
        summary="O que já está disponível e o que tem data marcada para entrar."
      >
        <LinkTabs label="Filtrar cursos" items={filters} current={filter} />
      </PageHeader>
      <p className="-mt-4 flex items-center gap-2 text-xs text-cf-text-secondary">
        <ExampleTag /> Títulos, aulas e datas desta tela são fictícios.
      </p>
      <CourseGrid empty="Nenhum curso neste filtro.">
        {courses.map((course, index) => {
          const Icon = courseIcons[course.icon];
          return (
            <li key={course.slug}>
              <CourseCard
                title={course.title}
                summary={course.summary}
                status={course.status}
                statusText={course.scheduledFor}
                href={courseHref(course.slug)}
                linkAs={Link}
                cover={
                  <CourseCover tone={index} icon={<Icon className="size-8" strokeWidth={1.3} />} />
                }
              />
            </li>
          );
        })}
      </CourseGrid>
    </ScreenPage>
  );
}

function lessonFacts(lesson: ExampleLesson) {
  return `${lesson.kind} · ${lesson.minutes} min`;
}

function CourseOutline({
  course,
  currentId,
}: {
  course: ExampleCatalogCourse;
  currentId?: string;
}) {
  return (
    <ol className="flex flex-col gap-6">
      {course.modules.map((module, index) => (
        <li
          key={module.title}
          className="rounded-card border border-cf-border bg-cf-surface p-5 sm:p-6"
        >
          <h2 className="font-editorial text-xl text-cf-text">
            <span className="text-cf-text-secondary">{index + 1}.</span> {module.title}
          </h2>
          <ol className="mt-3 flex flex-col divide-y divide-cf-border">
            {module.lessons.map((lesson) => (
              <li
                key={lesson.id}
                className="flex min-h-11 flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-sm"
              >
                <span className="flex items-baseline gap-2">
                  {lesson.completed && (
                    <CheckCircle2
                      aria-hidden
                      className="size-4 shrink-0 translate-y-0.5 text-cf-primary"
                    />
                  )}
                  <Link
                    href={lessonHref(lesson.id)}
                    aria-current={lesson.id === currentId ? 'page' : undefined}
                    className="text-cf-text underline-offset-4 hover:text-cf-primary hover:underline aria-[current=page]:font-medium aria-[current=page]:text-cf-primary"
                  >
                    {lesson.title}
                    {lesson.completed && <span className="sr-only"> (concluída)</span>}
                  </Link>
                </span>
                <span className="text-cf-text-secondary">
                  {lessonFacts(lesson)}
                  {lesson.free && (
                    <span className="ml-2 font-medium text-cf-primary">Aula aberta</span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </li>
      ))}
    </ol>
  );
}

/** Página do curso (doc G §4.3): resumo, um CTA de retomada e os módulos liberados. */
export function CourseScreen({ course }: { course: ExampleCatalogCourse }) {
  const lessons = course.modules.flatMap((module) => module.lessons);
  const done = lessons.filter((lesson) => lesson.completed).length;
  const resume = lessons.find((lesson) => !lesson.completed);
  return (
    <ScreenPage width="reading">
      <PageHeader
        title={course.title}
        summary={course.summary}
        back={{ href: hrefFor('cursos'), label: 'Cursos' }}
      >
        {course.status === 'disponivel' && resume && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link href={lessonHref(resume.id)} className={buttonClasses()}>
              {done === 0 ? 'Começar o curso' : `Continuar: ${resume.title}`}
            </Link>
            <p className="flex items-center gap-2 text-sm text-cf-text-secondary">
              {done} de {lessons.length} aulas concluídas <ExampleTag />
            </p>
          </div>
        )}
      </PageHeader>
      {course.status === 'programado' ? (
        <Notice>{course.scheduledFor}. As aulas aparecem aqui quando o curso for liberado.</Notice>
      ) : (
        <CourseOutline course={course} />
      )}
    </ScreenPage>
  );
}

/**
 * Aula (doc G §4.3): vídeo como elemento principal, módulos recolhíveis ao lado, conclusão e
 * próxima aula. A área do vídeo é identificada como exemplo: nada de player falso.
 */
export function LessonScreen({ lessonId }: { lessonId: string }) {
  const found = findLesson(lessonId);
  if (!found) return null;
  const { course, lesson, next } = found;
  const materials = exampleMaterials.filter((item) => item.course === course.title).slice(0, 2);

  return (
    <div className="mx-auto grid w-full min-w-0 max-w-6xl gap-8 pt-2 pb-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <article className="flex min-w-0 flex-col gap-6">
        <Link
          href={courseHref(course.slug)}
          className="self-start text-sm text-cf-primary underline underline-offset-4"
        >
          {course.title}
        </Link>
        <div
          role="img"
          aria-label="Área do vídeo da aula (exemplo; o player real usa o provedor de vídeo contratado)"
          className="flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-card bg-cf-sidebar text-cream-50"
        >
          <PlayCircle aria-hidden className="size-14 opacity-80" strokeWidth={1.1} />
          <p className="px-6 text-center text-sm opacity-80">
            Área do vídeo · no produto, o player protegido do provedor contratado
          </p>
        </div>
        <header className="flex flex-col gap-2">
          <p className="text-sm text-cf-text-secondary">
            {lesson.module} · {lessonFacts(lesson)}
          </p>
          <h1 className="flex flex-wrap items-center gap-3 font-editorial text-3xl tracking-tight text-cf-text">
            {lesson.title} <ExampleTag />
          </h1>
        </header>
        <div className="flex max-w-prose flex-col gap-4 text-cf-text-secondary">
          <p>
            Texto de apoio da aula: o resumo do que foi apresentado no vídeo, com os pontos
            principais para revisar depois.
          </p>
          <p>
            Ao final, marque a aula como concluída para que sua jornada mostre o progresso real.
          </p>
        </div>
        {materials.length > 0 && (
          <section aria-labelledby="materiais-aula" className="flex flex-col gap-3">
            <h2 id="materiais-aula" className="text-sm font-medium text-cf-text">
              Materiais da aula
            </h2>
            <ul className="flex flex-col gap-2">
              {materials.map((item) => (
                <li key={item.title}>
                  <Link
                    href={hrefFor('cofre')}
                    className="flex min-h-11 items-center gap-3 rounded-card border border-cf-border bg-cf-surface px-4 text-sm text-cf-text hover:border-cf-primary"
                  >
                    <FileText aria-hidden className="size-4 text-cf-primary" strokeWidth={1.6} />
                    {item.title}
                    <span className="ms-auto text-cf-text-secondary">{item.format}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="flex flex-col gap-3 border-t border-cf-border pt-6 sm:flex-row sm:items-center">
          <Button variant="secondary" disabled title="Na demonstração, a conclusão não é gravada">
            {lesson.completed ? 'Aula concluída' : 'Marcar como concluída'}
          </Button>
          {next && (
            <Link href={lessonHref(next.id)} className={buttonClasses({ className: 'sm:ms-auto' })}>
              Próxima aula <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
            </Link>
          )}
        </div>
      </article>
      <aside aria-label="Aulas do curso" className="min-w-0">
        <details open className="group lg:sticky lg:top-6">
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-cf-text lg:hidden">
            Aulas do curso
          </summary>
          <CourseOutline course={course} currentId={lesson.id} />
        </details>
      </aside>
    </div>
  );
}
