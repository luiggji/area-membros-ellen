import {
  buttonClasses,
  CompactCard,
  CourseCard,
  CourseCover,
  CourseGrid,
  EditorialArt,
  EditorialHero,
  JourneyFocusCard,
  SectionHeader,
} from '@caixa-forte/ui';
import { ArrowRight, Coffee, Diamond, Flag, PenLine, Sparkle, Users } from 'lucide-react';
import Link from 'next/link';

import { exampleCourses, exampleJourney, type HomeVariant } from '../domain/fixtures';
import { hrefFor } from './nav-links';

/**
 * Home do protótipo montada só com os componentes editoriais de `@caixa-forte/ui` (CF-022) e os
 * textos de exemplo da prévia do Brand System V2. Progresso não aparece: não há dado real.
 */

const courseIcons = { diamond: Diamond, spark: Sparkle, pen: PenLine };

export function HomeHero() {
  return (
    <EditorialHero
      eyebrow="Bem-vindo à comunidade"
      title="Caixa Forte"
      tagline="Conhecimento. Estratégia. Evolução."
      description="Um espaço para desenvolver sua advocacia, no seu ritmo e com propósito."
      media={
        <EditorialArt
          caption="Mais clareza para o próximo passo."
          icon={<Coffee className="size-16 opacity-70" strokeWidth={1.2} />}
          className="h-36 sm:h-48"
        />
      }
    />
  );
}

export function HomeJourney({ variant }: { variant: HomeVariant }) {
  const isNew = variant === 'novo';
  return (
    <JourneyFocusCard
      state={isNew ? 'novo' : 'em-progresso'}
      eyebrow={isNew ? 'Comece por aqui' : 'Minha jornada'}
      title={isNew ? 'Diagnóstico inicial' : exampleJourney.title}
      summary={
        isNew
          ? 'Responda algumas perguntas para receber o caminho recomendado para o seu momento.'
          : exampleJourney.summary
      }
      note="Nesta prévia, não exibimos progresso fictício."
      icon={<Flag className="size-6 sm:size-7" strokeWidth={1.4} />}
      action={
        <Link href={hrefFor('jornada')} className={buttonClasses()}>
          {isNew ? 'Começar diagnóstico' : 'Continuar jornada'}
          <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
        </Link>
      }
    />
  );
}

export function HomeCourses() {
  return (
    <section aria-labelledby="cursos-titulo">
      <SectionHeader
        id="cursos-titulo"
        title="Cursos em destaque"
        action={
          <Link href={hrefFor('cursos')} className={buttonClasses({ variant: 'link' })}>
            Ver todos <ArrowRight aria-hidden className="size-4" strokeWidth={1.8} />
          </Link>
        }
      />
      <CourseGrid empty="Novos conteúdos serão publicados em breve.">
        {exampleCourses.map((course, index) => {
          const Icon = courseIcons[course.icon];
          return (
            <li key={course.slug}>
              <CourseCard
                title={course.title}
                summary={course.summary}
                status={course.status}
                href={hrefFor('cursos')}
                linkAs={Link}
                cover={
                  <CourseCover tone={index} icon={<Icon className="size-8" strokeWidth={1.3} />} />
                }
              />
            </li>
          );
        })}
      </CourseGrid>
    </section>
  );
}

/** No máximo 2 cartões complementares na home (doc G §4.1). */
export function HomeAuxiliary() {
  return (
    <section aria-label="Destaques complementares" className="grid gap-4 md:grid-cols-2">
      <CompactCard
        tone="muted"
        icon={<Coffee className="size-5" strokeWidth={1.5} />}
        eyebrow="Eventos"
        title="Café Estratégico"
        description="Encontros presenciais e conversas que geram direção."
        href={hrefFor('cafe')}
        linkAs={Link}
      />
      <CompactCard
        icon={<Users className="size-5" strokeWidth={1.5} />}
        eyebrow="Comunidade"
        title="Conexões que impulsionam"
        description="Conheça colegas e compartilhe experiências."
        href={hrefFor('comunidade')}
        linkAs={Link}
      />
    </section>
  );
}
