import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { CompactCard, CourseCard, CourseGrid, JourneyFocusCard } from './editorial.js';

const html = (node: ReactNode) => renderToStaticMarkup(node);

const journey = (props: Partial<Parameters<typeof JourneyFocusCard>[0]> = {}) =>
  html(
    <JourneyFocusCard
      state="em-progresso"
      eyebrow="Minha jornada"
      title="Da Técnica à Liberdade"
      summary="Resumo"
      icon="◆"
      action={<a href="/app/jornada">Continuar</a>}
      {...props}
    />,
  );

describe('JourneyFocusCard', () => {
  it('mostra a barra só com progresso real e descreve o valor para leitor de tela', () => {
    expect(journey()).not.toContain('role="progressbar"');
    const markup = journey({ progress: { done: 3, total: 8, unit: 'módulos' } });
    expect(markup).toContain('role="progressbar"');
    expect(markup).toContain('aria-valuenow="3"');
    expect(markup).toContain('aria-label="Progresso: 3 de 8 módulos"');
  });

  it('não exibe progresso para quem está começando, mesmo que venha um valor', () => {
    const markup = journey({ state: 'novo', progress: { done: 0, total: 8, unit: 'módulos' } });
    expect(markup).not.toContain('role="progressbar"');
  });

  it('tem exatamente um CTA e liga o título à seção', () => {
    const markup = journey();
    expect(markup.match(/<a /g)).toHaveLength(1);
    const labelledBy = /aria-labelledby="([^"]+)"/.exec(markup)?.[1];
    expect(markup).toContain(`id="${labelledBy}"`);
  });
});

describe('CourseCard', () => {
  const card = (status: 'disponivel' | 'programado' | 'indisponivel') =>
    html(<CourseCard title="Comece Aqui" summary="Resumo" status={status} href="/app/cursos/x" />);

  it('curso disponível é um link e não mostra selo', () => {
    const markup = card('disponivel');
    expect(markup).toMatch(/^<a href="\/app\/cursos\/x"/);
    expect(markup).not.toContain('Em preparação');
  });

  it('curso programado continua navegável e diz que está em preparação', () => {
    const markup = card('programado');
    expect(markup).toMatch(/^<a /);
    expect(markup).toContain('Em preparação');
  });

  it('curso indisponível não vira link e mostra o motivo', () => {
    const markup = card('indisponivel');
    expect(markup).not.toContain('<a ');
    expect(markup).toContain('Indisponível no seu plano');
  });

  it('usa o componente de link do app quando informado', () => {
    const AppLink = ({ href, children }: { href: string; children?: ReactNode }) => (
      <a href={href} data-app-link="">
        {children}
      </a>
    );
    const markup = html(
      <CourseCard title="T" summary="S" status="disponivel" href="/x" linkAs={AppLink} />,
    );
    expect(markup).toContain('data-app-link');
  });
});

describe('CourseGrid', () => {
  it('sem cursos mostra a frase verdadeira no lugar da grade', () => {
    const markup = html(<CourseGrid empty="Novos conteúdos serão publicados em breve." />);
    expect(markup).not.toContain('<ul');
    expect(markup).toContain('Novos conteúdos serão publicados em breve.');
  });
});

describe('CompactCard', () => {
  it('o card inteiro é um único link, com seta decorativa', () => {
    const markup = html(
      <CompactCard
        icon="☕"
        eyebrow="Eventos"
        title="Café Estratégico"
        description="Encontros presenciais."
        href="/eventos"
      />,
    );
    expect(markup.match(/<a /g)).toHaveLength(1);
    expect(markup).toContain('<svg aria-hidden="true"');
  });
});
