import { can } from '@caixa-forte/contracts';
import { Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { contentAdminApi } from '@/modules/learning/infrastructure/content-admin-api';
import { CourseAdminCard } from '@/modules/learning/presentation/course-admin-card';
import { CreateCourseForm } from '@/modules/learning/presentation/content-forms';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Conteúdo · Caixa Forte' };

/**
 * Editor de conteúdo (CF-081/CF-172): a owner cria cursos, módulos e aulas sem deploy e decide quando cada um
 * aparece (rascunho, agendado ou publicado). Aulas e o conteúdo de cada uma ficam dentro dos
 * módulos (CF-172).
 */
export default async function ContentAdminPage() {
  const { roles } = await requireAdminPanel();
  if (!can(roles, 'content.manage')) notFound();
  const content = await contentAdminApi.tree();

  return (
    <PublicFrame>
      <div className="mx-auto flex w-full min-w-0 max-w-4xl flex-col gap-10 py-12">
        <div className="flex flex-col gap-2">
          <Link href="/admin" className="text-sm text-cf-primary underline underline-offset-4">
            Painel da equipe
          </Link>
          <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
            Conteúdo
          </h1>
          <p className="text-cf-text-secondary">
            Tudo nasce em rascunho. Membros só veem o que está publicado, ou agendado depois que a
            data chega. Um módulo só aparece se o curso também estiver visível.
          </p>
        </div>

        {content === null ? (
          <Notice tone="danger">
            Não foi possível carregar o conteúdo agora. Recarregue a página.
          </Notice>
        ) : content.courses.length === 0 ? (
          <p className="text-cf-text-secondary">Nenhum curso ainda. Crie o primeiro abaixo.</p>
        ) : (
          content.courses.map((course) => <CourseAdminCard key={course.id} course={course} />)
        )}

        <section aria-labelledby="novo-curso" className="flex flex-col gap-4">
          <h2 id="novo-curso" className="text-lg font-medium text-cf-text">
            Novo curso
          </h2>
          <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
            <CreateCourseForm />
          </div>
        </section>
      </div>
    </PublicFrame>
  );
}
