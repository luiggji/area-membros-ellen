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
});
