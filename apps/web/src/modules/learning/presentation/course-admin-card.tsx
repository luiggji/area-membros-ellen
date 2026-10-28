import {
  type AdminCourse,
  type AdminLesson,
  CONTENT_STATUSES,
  type ContentStatus,
  LESSON_KINDS,
} from '@caixa-forte/contracts';

import {
  CreateLessonForm,
  CreateModuleForm,
  EditCourseForm,
  EditLessonForm,
  EditModuleForm,
  LessonContentForm,
} from './content-forms';

const dateTime = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'America/Sao_Paulo',
});

/** Estado legível, com a data quando há agendamento ("Agendado · 03/11/2026 09:00"). */
function statusLabel(status: ContentStatus, publishAt: string | null): string {
  const label = CONTENT_STATUSES[status];
  return publishAt && status !== 'draft'
    ? `${label} · ${dateTime.format(new Date(publishAt))}`
    : label;
}

/** Tipo, duração e se é aberta, numa linha ("Vídeo · 12 min · Aberta"). */
function lessonFacts(lesson: AdminLesson): string {
  return [
    LESSON_KINDS[lesson.kind],
    lesson.durationMinutes ? `${lesson.durationMinutes} min` : null,
    lesson.isFree ? 'Aberta' : null,
    lesson.bodyMd || lesson.mediaRef ? null : 'Sem conteúdo',
  ]
    .filter(Boolean)
    .join(' · ');
}

/** Aulas do módulo na ordem (CF-172): dados, publicação e o conteúdo protegido de cada uma. */
function LessonList({ moduleId, lessons }: { moduleId: string; lessons: AdminLesson[] }) {
  return (
    <section
      aria-label="Aulas do módulo"
      className="flex flex-col gap-3 border-l-2 border-cf-border pl-4"
    >
      <h5 className="text-sm font-medium text-cf-text">Aulas</h5>
      {lessons.length === 0 ? (
        <p className="text-sm text-cf-text-secondary">Nenhuma aula ainda.</p>
      ) : (
        <ol className="flex flex-col divide-y divide-cf-border">
          {lessons.map((lesson) => (
            <li key={lesson.id} className="py-2">
              <details>
                <summary className="flex min-h-11 cursor-pointer flex-wrap items-baseline justify-between gap-2 py-1 text-sm">
                  <span className="font-medium text-cf-text">
                    {lesson.orderIndex}. {lesson.title}
                  </span>
                  <span className="text-cf-text-secondary">
                    {statusLabel(lesson.status, lesson.publishAt)} · {lessonFacts(lesson)}
                  </span>
                </summary>
                <div className="flex flex-col gap-6 pt-3">
                  <EditLessonForm lesson={lesson} />
                  <div className="flex flex-col gap-3 border-t border-cf-border pt-4">
                    <h6 className="text-sm font-medium text-cf-text">Conteúdo da aula</h6>
                    <LessonContentForm lesson={lesson} />
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
      <CreateLessonForm moduleId={moduleId} />
    </section>
  );
}

/** Um curso no editor da owner (CF-081): estado, edição e módulos na ordem. */
export function CourseAdminCard({ course }: { course: AdminCourse }) {
  return (
    <article className="flex flex-col gap-6 rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-editorial text-2xl tracking-tight text-cf-text">{course.title}</h3>
          <span className="text-sm text-cf-text-secondary">
            {statusLabel(course.status, course.publishAt)}
          </span>
        </div>
        <p className="break-all text-xs text-cf-text-secondary">/app/cursos/{course.slug}</p>
      </header>

      <details>
        <summary className="min-h-11 cursor-pointer py-2 text-sm font-medium text-cf-primary">
          Editar curso, estado e ordem
        </summary>
        <div className="pt-4">
          <EditCourseForm course={course} />
        </div>
      </details>

      <section aria-label={`Módulos de ${course.title}`} className="flex flex-col gap-3">
        <h4 className="text-sm font-medium text-cf-text">Módulos</h4>
        {course.modules.length === 0 ? (
          <p className="text-sm text-cf-text-secondary">Nenhum módulo ainda.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-cf-border">
            {course.modules.map((module) => (
              <li key={module.id} className="py-3">
                <details>
                  <summary className="flex min-h-11 cursor-pointer flex-wrap items-baseline justify-between gap-2 py-1 text-sm">
                    <span className="font-medium text-cf-text">
                      {module.orderIndex}. {module.title}
                    </span>
                    <span className="text-cf-text-secondary">
                      {statusLabel(module.status, module.publishAt)} ·{' '}
                      {module.lessons.length === 1 ? '1 aula' : `${module.lessons.length} aulas`}
                    </span>
                  </summary>
                  <div className="flex flex-col gap-6 pt-3">
                    <EditModuleForm module={module} />
                    <LessonList moduleId={module.id} lessons={module.lessons} />
                  </div>
                </details>
              </li>
            ))}
          </ol>
        )}
        <CreateModuleForm courseId={course.id} />
      </section>
    </article>
  );
}
