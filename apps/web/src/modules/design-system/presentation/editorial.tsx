import {
  buttonClasses,
  CompactCard,
  CourseCard,
  CourseCardSkeleton,
  CourseCover,
  CourseGrid,
  JourneyFocusCard,
  type JourneyState,
} from '@caixa-forte/ui';
import { AlertTriangle, ArrowRight, Check, Coffee, Diamond, Flag, Users } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Catálogo dos componentes editoriais (CF-022) em todos os estados. Textos e números aqui são
 * amostras de layout, rotuladas como tal — a home real recebe dados do servidor (CF-101).
 */

function Caption({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-xs text-cf-text-secondary">{children}</p>;
}

const journeyStates: Array<{
  state: JourneyState;
  caption: string;
  eyebrow: string;
  title: string;
  summary: string;
  cta: string;
  icon: ReactNode;
}> = [
  {
    state: 'novo',
    caption: 'state="novo" · primeiro acesso, sem progresso',
    eyebrow: 'Comece por aqui',
    title: 'Diagnóstico inicial',
    summary: 'Responda algumas perguntas para receber o caminho recomendado.',
    cta: 'Começar diagnóstico',
    icon: <Flag className="size-6 sm:size-7" strokeWidth={1.4} />,
  },
  {
    state: 'em-progresso',
    caption: 'state="em-progresso" · barra só com progresso real (amostra: 3 de 8)',
    eyebrow: 'Minha jornada',
    title: 'Título da trilha',
    summary: 'Resumo de uma linha sobre o próximo passo.',
    cta: 'Continuar jornada',
    icon: <Flag className="size-6 sm:size-7" strokeWidth={1.4} />,
  },
  {
    state: 'completo',
    caption: 'state="completo" · trilha concluída, próximo passo sugerido',
    eyebrow: 'Jornada concluída',
    title: 'Título da trilha',
    summary: 'Escolha a próxima trilha quando quiser.',
    cta: 'Ver trilhas',
    icon: <Check className="size-6 sm:size-7" strokeWidth={1.4} />,
  },
  {
    state: 'erro',
    caption: 'state="erro" · falha ao carregar, com uma ação para tentar de novo',
    eyebrow: 'Minha jornada',
    title: 'Não foi possível carregar sua jornada',
    summary: 'Tente novamente em instantes.',
    cta: 'Tentar novamente',
    icon: <AlertTriangle className="size-6 sm:size-7" strokeWidth={1.4} />,
  },
];

export function JourneyStatesSample() {
  return (
    <div className="flex flex-col gap-6">
      {journeyStates.map((sample) => (
        <div key={sample.state}>
          <Caption>{sample.caption}</Caption>
          <JourneyFocusCard
            state={sample.state}
            eyebrow={sample.eyebrow}
            title={sample.title}
            summary={sample.summary}
            progress={
              sample.state === 'em-progresso' ? { done: 3, total: 8, unit: 'módulos' } : undefined
            }
            icon={sample.icon}
            action={
              <Link
                href="#jornada"
                className={buttonClasses({
                  variant: sample.state === 'erro' ? 'secondary' : 'primary',
                })}
              >
                {sample.cta}
                {sample.state !== 'erro' && <ArrowRight aria-hidden className="size-4" />}
              </Link>
            }
          />
        </div>
      ))}
    </div>
  );
}

export function CourseStatesSample() {
  const cover = (tone: number) => (
    <CourseCover tone={tone} icon={<Diamond className="size-8" strokeWidth={1.3} />} />
  );
  return (
    <div className="flex flex-col gap-8">
      <div>
        <Caption>
          {'status="disponivel" · "programado" · "indisponivel" (sem link, com motivo)'}
        </Caption>
        <CourseGrid empty="">
          <li>
            <CourseCard
              title="Curso disponível"
              summary="Resumo de até duas linhas sobre o que o curso entrega."
              status="disponivel"
              href="#cursos-editoriais"
              linkAs={Link}
              cover={cover(0)}
            />
          </li>
          <li>
            <CourseCard
              title="Curso programado"
              summary="Aparece com o selo verdadeiro de que ainda está em preparação."
              status="programado"
              href="#cursos-editoriais"
              linkAs={Link}
              cover={cover(1)}
            />
          </li>
          <li>
            <CourseCard
              title="Curso fora do plano"
              summary="Não vira link: o motivo aparece no próprio card."
              status="indisponivel"
              href="#cursos-editoriais"
              cover={cover(2)}
            />
          </li>
        </CourseGrid>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Caption>CourseCardSkeleton · carregando</Caption>
          <CourseCardSkeleton />
        </div>
        <div>
          <Caption>CourseGrid vazia · frase verdadeira no lugar da grade</Caption>
          <CourseGrid empty="Novos conteúdos serão publicados em breve." />
        </div>
      </div>
    </div>
  );
}

export function CompactCardsSample() {
  return (
    <div>
      <Caption>{'CompactCard · tone="muted" e "surface" · o card inteiro é o link'}</Caption>
      <div className="grid gap-4 md:grid-cols-2">
        <CompactCard
          tone="muted"
          icon={<Coffee className="size-5" strokeWidth={1.5} />}
          eyebrow="Eventos"
          title="Café Estratégico"
          description="Novos encontros serão anunciados aqui."
          href="#compactos"
          linkAs={Link}
        />
        <CompactCard
          icon={<Users className="size-5" strokeWidth={1.5} />}
          eyebrow="Comunidade"
          title="Conexões que impulsionam"
          description="Conheça colegas e compartilhe experiências."
          href="#compactos"
          linkAs={Link}
        />
      </div>
    </div>
  );
}
