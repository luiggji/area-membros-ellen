import { describe, expect, it } from 'vitest';

import { parseInline, parseMarkdown } from './lesson-markdown';

describe('Markdown do texto da aula', () => {
  it('títulos começam em h2 (o h1 é o título da aula); parágrafos juntam linhas', () => {
    expect(parseMarkdown('# Introdução\n\nPrimeira linha\nsegunda linha\n\n### Fim')).toEqual([
      { type: 'heading', level: 2, spans: [{ text: 'Introdução' }] },
      { type: 'paragraph', spans: [{ text: 'Primeira linha segunda linha' }] },
      { type: 'heading', level: 4, spans: [{ text: 'Fim' }] },
    ]);
  });

  it('listas com marcador e numeradas', () => {
    expect(parseMarkdown('- um\n- dois\n\n1. primeiro\n2) segundo')).toEqual([
      { type: 'list', ordered: false, items: [[{ text: 'um' }], [{ text: 'dois' }]] },
      { type: 'list', ordered: true, items: [[{ text: 'primeiro' }], [{ text: 'segundo' }]] },
    ]);
  });

  it('negrito e itálico; asterisco solto continua texto', () => {
    expect(parseInline('Use **contrato** e *prazo* ou _rito_; 2 * 3')).toEqual([
      { text: 'Use ' },
      { text: 'contrato', bold: true },
      { text: ' e ' },
      { text: 'prazo', italic: true },
      { text: ' ou ' },
      { text: 'rito', italic: true },
      { text: '; 2 * 3' },
    ]);
  });

  it('HTML do texto continua texto puro (a tela não interpreta tags)', () => {
    expect(parseMarkdown('<script>alert(1)</script>')).toEqual([
      { type: 'paragraph', spans: [{ text: '<script>alert(1)</script>' }] },
    ]);
  });
});
