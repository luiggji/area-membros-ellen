import { describe, expect, it } from 'vitest';

import {
  brasiliaLocalToIso,
  CONTENT_MESSAGES,
  type ContentAdminApi,
  type ContentApiResult,
  isoToBrasiliaLocal,
  submitCreateCourse,
  submitCreateLesson,
  submitSaveLessonContent,
  submitUpdateCourse,
  submitUpdateLesson,
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
    createLesson: record('createLesson'),
    updateLesson: record('updateLesson'),
    saveLessonContent: record('saveLessonContent'),
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

describe('aulas e conteúdo da aula (CF-172)', () => {
  const LESSON = '3c4d5e6f-7a8b-4c9d-8e1f-2a3b4c5d6e7f';
  const lesson = {
    lessonId: LESSON,
    title: 'Aula 1',
    summary: '',
    kind: 'video',
    durationMinutes: '',
    orderIndex: '0',
    status: 'scheduled',
    publishAt: '2026-11-03T09:00',
  };

  it('aula agendada vai em UTC; duração vazia vira null; checkbox marcado = aula aberta', async () => {
    const { api, calls } = fakeApi();
    expect(await submitUpdateLesson({ ...lesson, isFree: 'on' }, api)).toEqual({
      status: 'success',
      message: 'Aula salva.',
    });
    expect(calls[0]).toEqual([
      'updateLesson',
      LESSON,
      {
        title: 'Aula 1',
        summary: '',
        kind: 'video',
        durationMinutes: null,
        isFree: true,
        orderIndex: 0,
        status: 'scheduled',
        publishAt: '2026-11-03T12:00:00.000Z',
      },
    ]);
  });

  it('agendada sem data e duração fora da faixa: erros juntos, nada enviado', async () => {
    const { api, calls } = fakeApi();
    const result = await submitUpdateLesson(
      { ...lesson, publishAt: '', durationMinutes: '900' },
      api,
    );
    expect(result).toMatchObject({
      status: 'error',
      fieldErrors: {
        publishAt: 'Agendado precisa de data.',
        durationMinutes: 'Duração de 1 a 600 minutos.',
      },
    });
    expect(calls).toEqual([]);
  });

  it('cria aula no módulo; módulo apagado: aviso para recarregar', async () => {
    const ok = fakeApi();
    expect(
      await submitCreateLesson({ moduleId: COURSE, title: 'Aula 1', kind: 'text' }, ok.api),
    ).toEqual({ status: 'success', message: 'Aula “Aula 1” criada em rascunho.' });
    expect(ok.calls[0]).toEqual(['createLesson', COURSE, { title: 'Aula 1', kind: 'text' }]);
    const gone = fakeApi({ ok: false, status: 404 });
    expect(
      await submitCreateLesson({ moduleId: COURSE, title: 'Aula 1', kind: 'text' }, gone.api),
    ).toMatchObject({ status: 'error', message: CONTENT_MESSAGES.notFound });
  });

  it('conteúdo: mídia como link é recusada antes da API; texto e referência válidos vão', async () => {
    const { api, calls } = fakeApi();
    const link = await submitSaveLessonContent(
      { lessonId: LESSON, bodyMd: '', mediaRef: 'https://video.exemplo/abc' },
      api,
    );
    expect(link).toMatchObject({ status: 'error', fieldErrors: { mediaRef: expect.any(String) } });
    expect(calls).toEqual([]);
    expect(
      await submitSaveLessonContent({ lessonId: LESSON, bodyMd: '# Texto', mediaRef: 'abc' }, api),
    ).toEqual({ status: 'success', message: 'Conteúdo da aula salvo.' });
    expect(calls[0]).toEqual(['saveLessonContent', LESSON, { bodyMd: '# Texto', mediaRef: 'abc' }]);
  });
});
