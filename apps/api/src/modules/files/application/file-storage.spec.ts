import { describe, expect, it } from '@jest/globals';

import { FileStorage, materialDownload, storeMaterial } from './file-storage';

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31]);

function fakeStorage() {
  const calls: unknown[][] = [];
  const storage: FileStorage = {
    put: async (...args) => {
      calls.push(['put', ...args]);
    },
    signedUrl: async (...args) => {
      calls.push(['signedUrl', ...args]);
      return 'https://storage.test/assinado';
    },
    remove: async () => undefined,
  };
  return { storage, calls };
}

describe('arquivos privados', () => {
  it('guarda com chave gerada no servidor; recusado não chega ao storage', async () => {
    const { storage, calls } = fakeStorage();
    expect(
      await storeMaterial(
        storage,
        { fileName: '../segredo.pdf', mimeType: 'application/pdf', bytes: PDF },
        () => 'id-1',
      ),
    ).toEqual({ key: 'id-1.pdf', extension: 'pdf', sizeBytes: 6, mimeType: 'application/pdf' });
    expect(calls).toEqual([['put', 'id-1.pdf', PDF, 'application/pdf']]);

    const refused = fakeStorage();
    expect(
      await storeMaterial(
        refused.storage,
        { fileName: 'x.pdf', mimeType: 'application/pdf', bytes: new Uint8Array([0x4d, 0x5a]) },
        () => 'id-2',
      ),
    ).toEqual({ rejected: 'content_mismatch' });
    expect(refused.calls).toEqual([]);
  });

  it('download por link assinado de 60 s com nome saneado', async () => {
    const { storage, calls } = fakeStorage();
    const now = new Date('2026-10-28T12:00:00.000Z');
    expect(
      await materialDownload(
        storage,
        { key: 'id-1.pdf', fileName: 'Modelo "final".pdf', extension: 'pdf' },
        now,
      ),
    ).toEqual({ url: 'https://storage.test/assinado', expiresAt: '2026-10-28T12:01:00.000Z' });
    expect(calls).toEqual([['signedUrl', 'id-1.pdf', 60, 'Modelo final.pdf']]);
  });
});
