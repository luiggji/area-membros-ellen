import { describe, expect, it } from 'vitest';

import { formatSize, groupBySubject, materialFacts, revisedText } from './material-view';

const material = (title: string, subject: string) => ({
  id: '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e',
  title,
  description: null,
  subject,
  kind: 'PDF',
  extension: 'pdf',
  sizeBytes: 2_516_582,
  version: '2',
  license: null,
  revisedOn: '2026-10-20',
  course: null,
  publishedAt: '2026-10-21T12:00:00.000Z',
});

describe('Cofre na tela', () => {
  it('agrupa por assunto em ordem alfabética, mantendo a ordem dos itens', () => {
    const groups = groupBySubject([
      material('B', 'Marketing'),
      material('A', 'Contratos'),
      material('C', 'Marketing'),
    ]);
    expect(groups.map((g) => [g.subject, g.items.map((i) => i.title)])).toEqual([
      ['Contratos', ['A']],
      ['Marketing', ['B', 'C']],
    ]);
  });

  it('tamanho legível, revisão em data brasileira e fatos só com o que existe', () => {
    expect(formatSize(348_160)).toBe('340 KB');
    expect(formatSize(2_516_582)).toBe('2,4 MB');
    expect(formatSize(10)).toBe('1 KB');
    expect(revisedText('2026-10-20')).toBe('Revisado em 20/10/2026');
    expect(revisedText(null)).toBeNull();
    expect(materialFacts(material('A', 'X'))).toBe(
      'PDF · 2,4 MB · versão 2 · Revisado em 20/10/2026',
    );
  });
});
