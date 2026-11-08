import { notFound } from 'next/navigation';

import { findLesson } from '@/modules/prototype/domain/learning-fixtures';
import { LessonScreen } from '@/modules/prototype/presentation/learning-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Aula no protótipo (CF-174). */
export default async function PrototypeLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!findLesson(id)) notFound();
  return (
    <PrototypeShell>
      <LessonScreen lessonId={id} />
    </PrototypeShell>
  );
}
