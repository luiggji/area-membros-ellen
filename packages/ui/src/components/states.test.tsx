import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { EmptyState, ErrorState, LoadingState } from './states.js';

const html = (node: ReactNode) => renderToStaticMarkup(node);

describe('EmptyState', () => {
  it('mostra título, descrição e uma ação', () => {
    const markup = html(
      <EmptyState
        title="Você ainda não começou uma trilha."
        description="Escolha por onde começar."
        action={<a href="/app/cursos">Ver cursos</a>}
      />,
    );
    expect(markup).toContain('<h2');
    expect(markup).toContain('Escolha por onde começar.');
    expect(markup).toContain('href="/app/cursos"');
  });

  it('vira o h1 da página quando ocupa a tela inteira', () => {
    expect(html(<EmptyState size="page" title="Nada por aqui" />)).toContain('<h1');
  });

  it('não renderiza blocos vazios quando não há descrição nem ação', () => {
    const markup = html(<EmptyState title="Novos encontros serão anunciados aqui." />);
    expect(markup).not.toContain('max-w-prose');
    expect(markup).not.toContain('mt-2');
  });
});

describe('ErrorState', () => {
  it('é anunciado a leitores de tela', () => {
    expect(html(<ErrorState title="Não foi possível carregar as aulas." />)).toContain(
      'role="alert"',
    );
  });

  it('mostra o código do erro e a referência para o suporte', () => {
    const markup = html(
      <ErrorState size="page" code="Erro 404" title="Página não encontrada" reference="abc123" />,
    );
    expect(markup).toContain('Erro 404');
    expect(markup).toContain('Código para o suporte');
    expect(markup).toContain('abc123');
  });

  it('sem referência, não promete código de suporte', () => {
    expect(html(<ErrorState title="Falhou" />)).not.toContain('Código para o suporte');
  });
});

describe('LoadingState', () => {
  it('anuncia o carregamento uma vez e não inventa conteúdo', () => {
    const markup = html(<LoadingState lines={2} />);
    expect(markup).toContain('role="status"');
    expect(markup).toContain('Carregando…');
    expect(markup.match(/animate-pulse/g)).toHaveLength(3);
  });
});
