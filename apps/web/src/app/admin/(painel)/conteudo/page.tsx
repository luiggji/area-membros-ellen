import { can, CONTENT_STATUSES } from '@caixa-forte/contracts';
import { Notice } from '@caixa-forte/ui';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireAdminPanel } from '@/modules/identity/presentation/admin-guards';
import { contentAdminApi } from '@/modules/learning/infrastructure/content-admin-api';
import { CourseAdminCard } from '@/modules/learning/presentation/course-admin-card';
import {
  CreateCourseForm,
  CreateTrackForm,
  EditTrackForm,
} from '@/modules/learning/presentation/content-forms';
import { PublicFrame } from '@/shared/ui/public-frame';

export const metadata: Metadata = { title: 'Conteúdo · Caixa Forte' };

/**
 * Editor de conteúdo (CF-081/CF-172): a owner cria cursos, módulos e aulas sem deploy e decide
 * quando cada item aparece (rascunho, agendado ou publicado). Aulas e o conteúdo de cada uma
 * ficam dentro dos módulos.
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
        ) : (
          <>
            <section aria-labelledby="trilhas" className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 id="trilhas" className="text-lg font-medium text-cf-text">
                  Trilhas
                </h2>
                <p className="text-sm text-cf-text-secondary">
                  Agrupam cursos. Trilha em rascunho esconde os cursos dela; curso sem trilha fica
                  avulso.
                </p>
              </div>
              {content.tracks.length === 0 ? (
                <p className="text-sm text-cf-text-secondary">Nenhuma trilha ainda.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-cf-border rounded-(--radius-card) border border-cf-border bg-cf-surface px-6">
                  {content.tracks.map((track) => (
                    <li key={track.id} className="py-3">
                      <details>
                        <summary className="flex min-h-11 cursor-pointer flex-wrap items-baseline justify-between gap-2 py-1 text-sm">
                          <span className="font-medium text-cf-text">
                            {track.orderIndex}. {track.title}
                          </span>
                          <span className="text-cf-text-secondary">
                            {CONTENT_STATUSES[track.status]} ·{' '}
                            {content.courses.filter((c) => c.trackId === track.id).length} curso(s)
                          </span>
                        </summary>
                        <div className="pt-3">
                          <EditTrackForm track={track} />
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
              )}
              <div className="rounded-(--radius-card) border border-cf-border bg-cf-surface p-6 sm:p-8">
                <CreateTrackForm />
              </div>
            </section>

            <h2 className="text-lg font-medium text-cf-text">Cursos</h2>
            {content.courses.length === 0 ? (
              <p className="text-cf-text-secondary">Nenhum curso ainda. Crie o primeiro abaixo.</p>
            ) : (
              content.courses.map((course) => (
                <CourseAdminCard key={course.id} course={course} tracks={content.tracks} />
              ))
            )}
          </>
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
