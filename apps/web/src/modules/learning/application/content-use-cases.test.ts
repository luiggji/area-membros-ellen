import { describe, expect, it } from 'vitest';

import {
  brasiliaLocalToIso,
  CONTENT_MESSAGES,
  type ContentAdminApi,
  type ContentApiResult,
  isoToBrasiliaLocal,
  submitCreateCourse,
  submitUpdateCourse,
  submitUpdateModule,
} from './content-use-cases';

const COURSE = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';

function fakeApi(result: ContentApiResult = { ok: true }) {
  const calls: unknown[][] = [];
  const record =
    (name: string) =>
    async (...args: unknown[]) => {
      calls.push([name, ...args]);
      return result;
    };
  const api: ContentAdminApi = {
    createCourse: record('createCourse'),
    updateCourse: record('updateCourse'),
    createModule: record('createModule'),
    updateModule: record('updateModule'),
  };
  return { api, calls };
}

describe('datas no horário de Brasília (CF-081)', () => {
  it('converte o campo datetime-local para UTC e de volta', () => {
    expect(brasiliaLocalToIso('2026-11-03T09:00')).toBe('2026-11-03T12:00:00.000Z');
    expect(isoToBrasiliaLocal('2026-11-03T12:00:00.000Z')).toBe('2026-11-03T09:00');
    expect(brasiliaLocalToIso('03/11/2026 09:00')).toBeNull();
    expect(isoToBrasiliaLocal(null)).toBe('');
  });
});

describe('editor de conteúdo (CF-081)', () => {
  it('cria curso em rascunho; endereço repetido vira mensagem', async () => {
    const ok = fakeApi();
    const state = await submitCreateCourse(
      { title: 'Gestão', slug: 'Gestao', summary: '' },
      ok.api,
    );
    expect(state).toMatchObject({ status: 'success' });
    expect(ok.calls).toEqual([['createCourse', { title: 'Gestão', slug: 'gestao', summary: '' }]]);
    expect(
      await submitCreateCourse(
        { title: 'Gestão', slug: 'gestao', summary: '' },
        fakeApi({ ok: false, status: 409 }).api,
      ),
    ).toMatchObject({ message: CONTENT_MESSAGES.slugTaken });
  });

  it('agendar envia a data em UTC; publicar ignora a data digitada', async () => {
    const { api, calls } = fakeApi();
    await submitUpdateCourse(
      {
        courseId: COURSE,
        title: 'Gestão',
        summary: '',
        orderIndex: '2',
        status: 'scheduled',
        publishAt: '2026-11-03T09:00',
      },
      api,
    );
    await submitUpdateModule(
      {
        moduleId: COURSE,
        title: 'Módulo',
        orderIndex: '0',
        status: 'published',
        publishAt: '2026-11-03T09:00',
      },
      api,
    );
    expect(calls).toEqual([
      [
        'updateCourse',
        COURSE,
        {
          title: 'Gestão',
          summary: '',
          orderIndex: 2,
          status: 'scheduled',
          publishAt: '2026-11-03T12:00:00.000Z',
        },
      ],
      [
        'updateModule',
        COURSE,
        { title: 'Módulo', orderIndex: 0, status: 'published', publishAt: null },
      ],
    ]);
  });

  it('agendado sem data ou ordem vazia não chega à API', async () => {
    const { api, calls } = fakeApi();
    const state = await submitUpdateCourse(
      {
        courseId: COURSE,
        title: 'Gestão',
        summary: '',
        orderIndex: '',
        status: 'scheduled',
        publishAt: '',
      },
      api,
    );
    expect(state).toMatchObject({ status: 'error' });
    expect(state.status === 'error' && Object.keys(state.fieldErrors ?? {}).sort()).toEqual([
      'orderIndex',
      'publishAt',
    ]);
    expect(calls).toEqual([]);
  });
});
