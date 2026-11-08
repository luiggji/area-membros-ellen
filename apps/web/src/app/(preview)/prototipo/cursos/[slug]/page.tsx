import { notFound } from 'next/navigation';

import { findCourse } from '@/modules/prototype/domain/learning-fixtures';
import { CourseScreen } from '@/modules/prototype/presentation/learning-screens';
import { PrototypeShell } from '@/modules/prototype/presentation/prototype-shell';

/** Página do curso no protótipo (CF-174). */
export default async function PrototypeCoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const course = findCourse((await params).slug);
  if (!course) notFound();
  return (
    <PrototypeShell>
      <CourseScreen course={course} />
    </PrototypeShell>
  );
}
