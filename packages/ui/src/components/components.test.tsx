import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Button, buttonClasses } from './button.js';
import { Card } from './card.js';
import { AppShell, PublicShell } from './shells.js';

const html = (node: ReactNode) => renderToStaticMarkup(node);

describe('buttonClasses', () => {
  it('usa o primário vinho com alvo de toque de 44px por padrão', () => {
    const classes = buttonClasses();
    expect(classes).toContain('bg-cf-primary');
    expect(classes).toContain('min-h-11');
  });

  it('deixa a classe extra vencer conflitos de utilitário', () => {
    expect(buttonClasses({ className: 'px-8' })).not.toContain('px-6');
  });
});

describe('Button', () => {
  it('é type="button" por padrão para não enviar formulário sem querer', () => {
    expect(html(<Button>Salvar</Button>)).toContain('type="button"');
  });

  it('mostra o motivo do bloqueio e o liga ao botão', () => {
    const markup = html(
      <Button disabled disabledReason="Vagas esgotadas">
        Quero participar
      </Button>,
    );
    const describedBy = /aria-describedby="([^"]+)"/.exec(markup)?.[1];
    expect(describedBy).toBeTruthy();
    expect(markup).toContain(`id="${describedBy}"`);
    expect(markup).toContain('Vagas esgotadas');
  });
});

describe('Card', () => {
  it('renderiza a tag e o tom pedidos', () => {
    const markup = html(
      <Card as="article" tone="deep">
        x
      </Card>,
    );
    expect(markup).toMatch(/^<article class="[^"]*bg-cf-sidebar/);
  });
});

describe('AppShell', () => {
  const shell = (width?: 'reading' | 'wide') =>
    html(
      <AppShell sidebar={<nav>menu</nav>} topbar={<span>topo</span>} width={width}>
        <h1>Página</h1>
      </AppShell>,
    );

  it('tem link de pular para o conteúdo apontando para o <main>', () => {
    const markup = shell();
    expect(markup).toContain('href="#conteudo"');
    expect(markup).toMatch(/<main id="conteudo"/);
  });

  it('coloca a navegação na sidebar vinho e o topo no <header>', () => {
    const markup = shell();
    expect(markup).toMatch(/<aside class="[^"]*bg-cf-sidebar[^"]*"><div[^>]*><nav>menu<\/nav>/);
    expect(markup).toMatch(/<header[^>]*><span>topo<\/span><\/header>/);
  });

  it('só reserva espaço no rodapé quando há barra inferior mobile', () => {
    expect(shell()).not.toContain('max-lg:pb-28');
    const markup = html(
      <AppShell sidebar="s" topbar="t" bottomBar={<nav>barra</nav>}>
        x
      </AppShell>,
    );
    expect(markup).toContain('max-lg:pb-28');
    expect(markup).toContain('<div class="lg:hidden"><nav>barra</nav></div>');
  });

  it('limita a largura de leitura e libera largura no painel da equipe', () => {
    expect(shell()).toContain('max-w-(--spacing-content-max)');
    expect(shell('wide')).toContain('max-w-(--spacing-admin-max)');
  });
});

describe('PublicShell', () => {
  it('só renderiza rodapé e ações quando informados', () => {
    const bare = html(<PublicShell brand="CF">conteúdo</PublicShell>);
    expect(bare).not.toContain('<footer');
    const full = html(
      <PublicShell brand="CF" actions={<a href="/entrar">Entrar</a>} footer="rodapé">
        conteúdo
      </PublicShell>,
    );
    expect(full).toContain('<footer');
    expect(full).toContain('Entrar');
  });
});
