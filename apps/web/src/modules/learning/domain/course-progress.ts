import type { CourseDetail } from '@caixa-forte/contracts';

type Lesson = CourseDetail['modules'][number]['lessons'][number];

const lessonsOf = (modules: CourseDetail['modules']): Lesson[] =>
  modules.flatMap((module) => module.lessons);

/** "2 de 5 aulas concluídas"; nada concluído (ou curso sem aulas) não mostra número nenhum. */
export function courseProgressText(modules: CourseDetail['modules']): string | null {
  const lessons = lessonsOf(modules);
  const done = lessons.filter((lesson) => lesson.completed).length;
  if (done === 0) return null;
  if (done === lessons.length) return 'Todas as aulas concluídas';
  return `${done} de ${lessons.length} ${lessons.length === 1 ? 'aula concluída' : 'aulas concluídas'}`;
}

/** Próxima aula liberada depois da atual, na ordem do curso (atravessa módulos). */
export function nextLesson(modules: CourseDetail['modules'], currentId: string): Lesson | null {
  const lessons = lessonsOf(modules);
  const index = lessons.findIndex((lesson) => lesson.id === currentId);
  return index === -1 ? null : (lessons[index + 1] ?? null);
}
