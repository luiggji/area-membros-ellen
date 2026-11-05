import { type CourseDetail, LESSON_KINDS } from '@caixa-forte/contracts';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

type Lesson = CourseDetail['modules'][number]['lessons'][number];

/** "Vídeo · 12 min" — só o que existe de verdade. */
function lessonFacts(lesson: Lesson): string {
  return [
    LESSON_KINDS[lesson.kind],
    lesson.durationMinutes ? `${lesson.durationMinutes} min` : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Módulos e aulas liberados do curso, na ordem (CF-082); cada aula abre no player (CF-083). */
export function CourseOutline({ modules }: { modules: CourseDetail['modules'] }) {
  if (modules.length === 0) {
    return (
      <p className="rounded-card border border-dashed border-cf-border px-5 py-8 text-center text-sm text-cf-text-secondary">
        As aulas deste curso estão em preparação.
      </p>
    );
  }
  return (
    <ol className="flex flex-col gap-6">
      {modules.map((module, index) => (
        <li
          key={module.id}
          className="rounded-card border border-cf-border bg-cf-surface p-5 sm:p-6"
        >
          <section aria-labelledby={`modulo-${module.id}`} className="flex flex-col gap-3">
            <h2 id={`modulo-${module.id}`} className="font-editorial text-xl text-cf-text">
              <span className="text-cf-text-secondary">{index + 1}.</span> {module.title}
            </h2>
            {module.lessons.length === 0 ? (
              <p className="text-sm text-cf-text-secondary">Aulas em preparação.</p>
            ) : (
              <ol className="flex flex-col divide-y divide-cf-border">
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
                        href={`/app/aulas/${lesson.id}`}
                        className="text-cf-text underline-offset-4 hover:text-cf-primary hover:underline"
                      >
                        {lesson.title}
                        {lesson.completed && <span className="sr-only"> (concluída)</span>}
                      </Link>
                    </span>
                    <span className="text-cf-text-secondary">
                      {lessonFacts(lesson)}
                      {lesson.isFree && (
                        <span className="ml-2 font-medium text-cf-primary">Aula aberta</span>
                      )}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </li>
      ))}
    </ol>
  );
}
