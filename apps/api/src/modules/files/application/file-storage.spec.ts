import { describe, expect, it } from '@jest/globals';

import {
  confirmMaterialUpload,
  FileStorage,
  materialDownload,
  prepareMaterialUpload,
  StoredObject,
} from './file-storage';

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);

function fakeStorage(stored: StoredObject | null = null) {
  const calls: unknown[][] = [];
  const storage: FileStorage = {
    uploadUrl: async (key) => {
      calls.push(['uploadUrl', key]);
      return `https://storage.test/envio/${key}`;
    },
    inspect: async () => stored,
    signedUrl: async (...args) => {
      calls.push(['signedUrl', ...args]);
      return 'https://storage.test/assinado';
    },
    remove: async (key) => {
      calls.push(['remove', key]);
    },
  };
  return { storage, calls };
}

describe('envio de material em dois passos', () => {
  it('1º passo: chave gerada no servidor; tipo fora da lista nem pede link', async () => {
    const ok = fakeStorage();
    expect(
      await prepareMaterialUpload(
        ok.storage,
        { fileName: '../segredo.pdf', mimeType: 'application/pdf', sizeBytes: 10 },
        () => 'id-1',
      ),
    ).toEqual({ key: 'id-1.pdf', uploadUrl: 'https://storage.test/envio/id-1.pdf' });

    const refused = fakeStorage();
    expect(
      await prepareMaterialUpload(
        refused.storage,
        { fileName: 'a.html', mimeType: 'text/html', sizeBytes: 10 },
        () => 'id-2',
      ),
    ).toEqual({ rejected: 'type_not_allowed' });
    expect(refused.calls).toEqual([]);
  });

  it('2º passo: confere o arquivo que chegou; conteúdo falso é apagado', async () => {
    const good = fakeStorage({ sizeBytes: 6, mimeType: 'application/pdf', head: PDF });
    expect(await confirmMaterialUpload(good.storage, 'id-1.pdf', 'Modelo.pdf')).toEqual({
      ok: true,
      sizeBytes: 6,
      mimeType: 'application/pdf',
    });

    const fake = fakeStorage({
      sizeBytes: 4,
      mimeType: 'application/pdf',
      head: new Uint8Array([0x4d, 0x5a, 0x90, 0x00]),
    });
    expect(await confirmMaterialUpload(fake.storage, 'id-2.pdf', 'virus.pdf')).toEqual({
      rejected: 'content_mismatch',
    });
    expect(fake.calls).toEqual([['remove', 'id-2.pdf']]);
  });

  it('2º passo: nada enviado ou nome de outro tipo que a chave reservada', async () => {
    expect(await confirmMaterialUpload(fakeStorage().storage, 'id-1.pdf', 'a.pdf')).toEqual({
      rejected: 'missing',
    });
    expect(await confirmMaterialUpload(fakeStorage().storage, 'id-1.pdf', 'a.docx')).toEqual({
      rejected: 'key_mismatch',
    });
  });

  it('download por link assinado de 60 s com nome saneado', async () => {
    const { storage, calls } = fakeStorage();
    const now = new Date('2026-10-28T12:00:00.000Z');
    expect(
      await materialDownload(storage, { key: 'id-1.pdf', fileName: 'Modelo "final".pdf' }, now),
    ).toEqual({ url: 'https://storage.test/assinado', expiresAt: '2026-10-28T12:01:00.000Z' });
    expect(calls).toEqual([['signedUrl', 'id-1.pdf', 60, 'Modelo final.pdf']]);
  });
});
