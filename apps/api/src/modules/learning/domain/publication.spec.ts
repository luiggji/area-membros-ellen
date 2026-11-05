import { describe, expect, it } from '@jest/globals';

import { catalogState, isReleased, isUpcoming } from './publication';

const now = new Date('2026-10-28T12:00:00.000Z');
const past = '2026-10-01T12:00:00.000Z';
const soon = '2026-11-03T12:00:00.000Z';
const later = '2026-12-01T12:00:00.000Z';

describe('regra de publicação (espelha private.content_visible)', () => {
  it('publicado ou agendado com data alcançada está liberado; rascunho nunca', () => {
    expect(isReleased({ status: 'published', publishAt: null }, now)).toBe(true);
    expect(isReleased({ status: 'scheduled', publishAt: past }, now)).toBe(true);
    expect(isReleased({ status: 'scheduled', publishAt: soon }, now)).toBe(false);
    expect(isReleased({ status: 'published', publishAt: soon }, now)).toBe(false);
    expect(isReleased({ status: 'draft', publishAt: null }, now)).toBe(false);
    expect(isReleased({ status: 'draft', publishAt: past }, now)).toBe(false);
  });

  it('programado é só agendado com data futura', () => {
    expect(isUpcoming({ status: 'scheduled', publishAt: soon }, now)).toBe(true);
    expect(isUpcoming({ status: 'published', publishAt: soon }, now)).toBe(false);
    expect(isUpcoming({ status: 'scheduled', publishAt: past }, now)).toBe(false);
  });
});

describe('estado do curso no catálogo', () => {
  it('sem trilha: disponível, programado com a data ou fora do catálogo', () => {
    expect(catalogState({ status: 'published', publishAt: null }, null, now)).toEqual({
      availability: 'available',
      availableAt: null,
    });
    expect(catalogState({ status: 'scheduled', publishAt: soon }, null, now)).toEqual({
      availability: 'scheduled',
      availableAt: soon,
    });
    expect(catalogState({ status: 'draft', publishAt: null }, null, now)).toBeNull();
  });

  it('com trilha: rascunho no caminho esconde; programado usa a data mais tardia', () => {
    const published = { status: 'published', publishAt: null };
    expect(catalogState(published, { status: 'draft', publishAt: null }, now)).toBeNull();
    expect(catalogState(published, { status: 'scheduled', publishAt: later }, now)).toEqual({
      availability: 'scheduled',
      availableAt: later,
    });
    expect(
      catalogState(
        { status: 'scheduled', publishAt: later },
        { status: 'scheduled', publishAt: soon },
        now,
      ),
    ).toEqual({ availability: 'scheduled', availableAt: later });
    expect(catalogState({ status: 'draft', publishAt: null }, published, now)).toBeNull();
  });
});
