import { LESSON_KINDS } from '@caixa-forte/contracts';
import { buttonClasses, Card, Notice } from '@caixa-forte/ui';
import { Crown } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { loadLesson } from '@/modules/learning/infrastructure/lesson-api';
import { LessonBody } from '@/modules/learning/presentation/lesson-body';
import { LessonVideo } from '@/modules/learning/presentation/lesson-video';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await loadLesson((await params).id);
  return {
    title:
      lesson && lesson !== 'not_found' ? `${lesson.title} · Caixa Forte` : 'Aula · Caixa Forte',
  };
}

/**
 * Player (CF-083): vídeo e texto só chegam da API para quem tem acesso pago ou quando a aula é
 * aberta. Sem acesso, a tela diz por quê e leva à assinatura; nada do conteúdo vem junto.
 */
export default async function LessonPage({ params }: Props) {
  const lesson = await loadLesson((await params).id);
  if (lesson === 'not_found') notFound();
  if (lesson === null) {
    return (
      <div className="mx-auto w-full max-w-3xl py-12">
        <Notice tone="danger">Não foi possível carregar a aula agora. Recarregue a página.</Notice>
      </div>
    );
  }

  const facts = [
    LESSON_KINDS[lesson.kind],
    lesson.durationMinutes ? `${lesson.durationMinutes} min` : null,
    lesson.isFree ? 'Aula aberta' : null,
  ].filter(Boolean);

  return (
    <article className="mx-auto flex w-full min-w-0 max-w-3xl flex-col gap-6 py-12">
      <Link
        href={`/app/cursos/${lesson.course.slug}`}
        className="text-sm text-cf-primary underline underline-offset-4"
      >
        {lesson.course.title}
      </Link>
      <header className="flex flex-col gap-2">
        <p className="text-sm text-cf-text-secondary">{lesson.moduleTitle}</p>
        <h1 className="font-editorial text-3xl tracking-tight text-cf-text sm:text-4xl">
          {lesson.title}
        </h1>
        <p className="text-sm text-cf-text-secondary">{facts.join(' · ')}</p>
        {lesson.summary && <p className="text-cf-text-secondary">{lesson.summary}</p>}
      </header>

      {lesson.access === 'subscription_required' ? (
        <Card className="flex flex-col items-start gap-4 border border-cf-border sm:flex-row sm:p-8">
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-blush-200 text-cf-primary"
          >
            <Crown className="size-5" />
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-medium text-cf-text">Esta aula é para assinantes</h2>
            <p className="text-cf-text-secondary">
              Com a assinatura do Caixa Forte você assiste a todas as aulas, além das abertas.
            </p>
            <Link href="/app/assinatura" className={buttonClasses({ variant: 'secondary' })}>
              Ver minha assinatura
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {lesson.video && <LessonVideo video={lesson.video} title={lesson.title} />}
          {lesson.bodyMd ? (
            <LessonBody source={lesson.bodyMd} />
          ) : (
            !lesson.video && (
              <p className="rounded-card border border-dashed border-cf-border px-5 py-8 text-center text-sm text-cf-text-secondary">
                O conteúdo desta aula está em preparação.
              </p>
            )
          )}
        </>
      )}
    </article>
  );
}
