import { describe, expect, it } from 'vitest';

import { type UploadDeps, uploadMaterial } from './upload-material';

const KEY = '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e.pdf';
const pdf = () =>
  new File([new Uint8Array([0x25, 0x50, 0x44, 0x46])], 'Modelo.pdf', { type: 'application/pdf' });
const form = {
  title: 'Modelo de contrato',
  subject: 'Contratos',
  version: '1',
  description: '',
  license: '',
};

function deps(over: Partial<UploadDeps> = {}) {
  const calls: unknown[][] = [];
  const value: UploadDeps = {
    prepare: async (file) => {
      calls.push(['prepare', file]);
      return { ok: true, data: { key: KEY, uploadUrl: 'https://storage.test/envio' } };
    },
    put: async (url, _file, type) => {
      calls.push(['put', url, type]);
      return true;
    },
    create: async (body) => {
      calls.push(['create', body]);
      return { ok: true, data: { id: 'id' } };
    },
    ...over,
  };
  return { value, calls };
}

describe('envio de material pela owner', () => {
  it('confere, pede o link, envia direto ao bucket e cria em rascunho', async () => {
    const { value, calls } = deps();
    expect(await uploadMaterial(value, pdf(), form)).toEqual({
      status: 'success',
      message: 'Material “Modelo de contrato” enviado em rascunho.',
    });
    expect(calls.map((c) => c[0])).toEqual(['prepare', 'put', 'create']);
    expect(calls[2]![1]).toMatchObject({
      key: KEY,
      fileName: 'Modelo.pdf',
      revisedOn: null,
      courseId: null,
    });
  });

  it('formulário inválido ou sem arquivo: nada é enviado', async () => {
    const { value, calls } = deps();
    expect(await uploadMaterial(value, null, { ...form, subject: '' })).toMatchObject({
      status: 'error',
      fieldErrors: { file: 'Escolha um arquivo.', subject: expect.any(String) },
    });
    expect(calls).toEqual([]);
  });

  it('recusa do 1º passo vira erro no campo do arquivo; conteúdo falso também', async () => {
    const typeRefused = deps({
      prepare: async () => ({
        ok: false,
        status: 400,
        fields: { mimeType: 'Tipo de arquivo não aceito.' },
      }),
    });
    expect(await uploadMaterial(typeRefused.value, pdf(), form)).toEqual({
      status: 'error',
      fieldErrors: { file: 'Tipo de arquivo não aceito.' },
    });
    const fake = deps({
      create: async () => ({ ok: false, status: 400, code: 'upload_content_mismatch' }),
    });
    expect(await uploadMaterial(fake.value, pdf(), form)).toEqual({
      status: 'error',
      fieldErrors: { file: 'O conteúdo do arquivo não é do tipo informado. Nada foi publicado.' },
    });
  });

  it('envio ao bucket falhou: não cria o material', async () => {
    const { value, calls } = deps({ put: async () => false });
    expect(await uploadMaterial(value, pdf(), form)).toMatchObject({ status: 'error' });
    expect(calls.some((c) => c[0] === 'create')).toBe(false);
  });
});
