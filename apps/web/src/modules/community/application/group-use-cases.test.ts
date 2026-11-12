import { describe, expect, it } from 'vitest';

import {
  GROUP_MESSAGES,
  type GroupApiResult,
  type GroupsApi,
  submitCreateGroup,
  submitUpdateGroup,
} from './group-use-cases';

const GROUP = '3f2a1b0c-9d8e-4f7a-8b6c-5d4e3f2a1b0c';

function fakeApi(result: GroupApiResult = { ok: true }) {
  const calls: unknown[][] = [];
  const api: GroupsApi = {
    create: async (body) => {
      calls.push(['create', body]);
      return result;
    },
    update: async (id, body) => {
      calls.push(['update', id, body]);
      return result;
    },
  };
  return { api, calls };
}

describe('criar grupo (CF-092)', () => {
  it('cria em rascunho e diz que ainda não aparece para os membros', async () => {
    const { api, calls } = fakeApi();
    const state = await submitCreateGroup(
      { slug: 'advocacia-solo', name: 'Advocacia Solo', description: 'Quem atua sozinho.' },
      api,
    );
    expect(state).toMatchObject({
      status: 'success',
      message: 'Grupo “Advocacia Solo” salvo como rascunho. Ainda não aparece para os membros.',
    });
    expect(calls).toEqual([
      [
        'create',
        { slug: 'advocacia-solo', name: 'Advocacia Solo', description: 'Quem atua sozinho.' },
      ],
    ]);
  });

  it('identificador fora do formato não chega à API', async () => {
    const { api, calls } = fakeApi();
    expect(await submitCreateGroup({ slug: 'Advocacia Solo', name: 'Grupo' }, api)).toMatchObject({
      status: 'error',
      fieldErrors: { slug: 'Use letras minúsculas, números e hífen (ex.: advocacia-solo).' },
    });
    expect(calls).toEqual([]);
  });

  it('nome vazio não chega à API e devolve o que foi digitado', async () => {
    const { api, calls } = fakeApi();
    const state = await submitCreateGroup({ slug: 'grupo-novo', name: ' ' }, api);
    expect(state).toMatchObject({
      status: 'error',
      fieldErrors: { name: 'Nome com pelo menos 2 caracteres.' },
      values: { slug: 'grupo-novo', name: ' ', description: '' },
    });
    expect(calls).toEqual([]);
  });
});

describe('publicar e ocultar grupo (CF-092)', () => {
  it('publicar confirma que os membros já veem', async () => {
    const { api, calls } = fakeApi();
    const state = await submitUpdateGroup(
      { groupId: GROUP, name: 'Gestão e Finanças', description: '', status: 'published' },
      api,
    );
    expect(state).toMatchObject({
      status: 'success',
      message: 'Grupo “Gestão e Finanças” publicado. Os membros já veem.',
    });
    expect(calls).toEqual([
      ['update', GROUP, { name: 'Gestão e Finanças', description: '', status: 'published' }],
    ]);
  });

  it('ocultar confirma que saiu da lista', async () => {
    const { api } = fakeApi();
    expect(
      await submitUpdateGroup(
        { groupId: GROUP, name: 'Tecnologia e IA', description: '', status: 'hidden' },
        api,
      ),
    ).toMatchObject({
      status: 'success',
      message: 'Grupo “Tecnologia e IA” ocultado. Saiu da lista dos membros.',
    });
  });

  it('situação inventada não chega à API', async () => {
    const { api, calls } = fakeApi();
    expect(
      await submitUpdateGroup(
        { groupId: GROUP, name: 'Grupo', description: '', status: 'arquivado' },
        api,
      ),
    ).toMatchObject({
      status: 'error',
      fieldErrors: { status: 'Escolha rascunho, publicado ou oculto.' },
    });
    expect(calls).toEqual([]);
  });
});

describe('respostas da API viram mensagem para Ellen', () => {
  it('identificador já usado (409)', async () => {
    const { api } = fakeApi({ ok: false, status: 409 });
    expect(
      await submitCreateGroup({ slug: 'advocacia-solo', name: 'Outro grupo' }, api),
    ).toMatchObject({
      status: 'error',
      message: GROUP_MESSAGES.slugTaken,
      values: { slug: 'advocacia-solo', name: 'Outro grupo' },
    });
  });

  it('grupo apagado por outra aba (404)', async () => {
    const { api } = fakeApi({ ok: false, status: 404 });
    expect(
      await submitUpdateGroup(
        { groupId: GROUP, name: 'Grupo', description: '', status: 'draft' },
        api,
      ),
    ).toMatchObject({ status: 'error', message: GROUP_MESSAGES.notFound });
  });

  it('sessão sem permissão ou sem MFA (401/403)', async () => {
    for (const status of [401, 403]) {
      const { api } = fakeApi({ ok: false, status });
      expect(await submitCreateGroup({ slug: 'grupo', name: 'Grupo' }, api)).toMatchObject({
        status: 'error',
        message: GROUP_MESSAGES.forbidden,
      });
    }
  });

  it('falha genérica não finge sucesso', async () => {
    const { api } = fakeApi({ ok: false, status: 500 });
    expect(await submitCreateGroup({ slug: 'grupo', name: 'Grupo' }, api)).toMatchObject({
      status: 'error',
      message: GROUP_MESSAGES.failed,
    });
  });

  it('erro por campo vindo da API aparece no campo', async () => {
    const { api } = fakeApi({
      ok: false,
      status: 422,
      fields: { slug: 'Identificador inválido.' },
    });
    expect(await submitCreateGroup({ slug: 'grupo', name: 'Grupo' }, api)).toMatchObject({
      status: 'error',
      fieldErrors: { slug: 'Identificador inválido.' },
    });
  });
});
