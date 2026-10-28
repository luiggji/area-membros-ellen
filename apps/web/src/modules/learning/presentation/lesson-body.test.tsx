import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { LessonBody } from './lesson-body';

describe('texto da aula na tela', () => {
  it('monta títulos, listas e ênfases como elementos', () => {
    const html = renderToStaticMarkup(<LessonBody source={'# Tema\n\n- **um**\n- *dois*'} />);
    expect(html).toContain('<h2');
    expect(html).toContain('<ul');
    expect(html).toContain('<strong class="font-semibold text-cf-text">um</strong>');
    expect(html).toContain('<em>dois</em>');
  });

  it('HTML escrito no texto sai escapado, nunca como tag', () => {
    const html = renderToStaticMarkup(
      <LessonBody source={'<img src=x onerror=alert(1)> e <script>alert(1)</script>'} />,
    );
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;script&gt;');
  });

  it('link e imagem em Markdown saem como texto, sem href nem src', () => {
    const html = renderToStaticMarkup(
      <LessonBody source={'[clique](javascript:alert(1)) ![x](https://exemplo.test/x.png)'} />,
    );
    expect(html).not.toContain('href');
    expect(html).not.toContain('<img');
    expect(html).toContain('[clique](javascript:alert(1))');
  });
});
