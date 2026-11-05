import { describe, expect, it } from '@jest/globals';

import { FileStorage } from '../../files/application/file-storage';
import { MemberAccess } from '../../membership/application/ports';
import {
  createMaterial,
  deleteMaterial,
  downloadMaterial,
  MaterialRow,
  MaterialStore,
  memberMaterials,
} from './materials';

const ID = '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e';
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d]);
const row: MaterialRow = {
  id: ID,
  title: 'Modelo de contrato',
  description: null,
  subject: 'Contratos',
  version: '2',
  license: 'Uso pessoal do assinante',
  revisedOn: '2026-10-20',
  course: null,
  storageKey: `${ID}.pdf`,
  fileName: 'Modelo.pdf',
  mimeType: 'application/pdf',
  sizeBytes: 2048,
  status: 'published',
  publishedAt: '2026-10-21T12:00:00.000Z',
};
const ACCESS: MemberAccess = { source: 'manual', subscriptionStatus: null, validUntil: null };

function deps(
  stored: { head: Uint8Array } | null = { head: PDF },
  created: 'ok' | 'course' = 'ok',
) {
  const calls: unknown[][] = [];
  const store: MaterialStore = {
    list: async (scope) =>
      scope === 'published' ? [row] : [row, { ...row, id: 'r', status: 'draft' }],
    create: async (material) => {
      calls.push(['create', material]);
      return created === 'ok' ? { id: ID } : 'course_not_found';
    },
    setStatus: async () => true,
    softDelete: async (id) => (id === ID ? { storageKey: row.storageKey, title: row.title } : null),
  };
  const storage: FileStorage = {
    uploadUrl: async () => 'https://storage.test/envio',
    inspect: async () =>
      stored ? { sizeBytes: 2048, mimeType: 'application/pdf', head: stored.head } : null,
    signedUrl: async () => 'https://storage.test/assinado',
    remove: async (key) => {
      calls.push(['remove', key]);
    },
  };
  return { store, storage, calls };
}

describe('Cofre de materiais', () => {
  it('membro vê os publicados com tipo e extensão; baixar só com acesso', async () => {
    const { store } = deps();
    const withAccess = await memberMaterials(
      { store, access: { accessOf: async () => ACCESS } },
      'm',
    );
    expect(withAccess.canDownload).toBe(true);
    expect(withAccess.materials[0]).toMatchObject({ kind: 'PDF', extension: 'pdf', version: '2' });
    expect(withAccess.materials[0]).not.toHaveProperty('storageKey');
    const without = await memberMaterials({ store, access: { accessOf: async () => null } }, 'm');
    expect(without.canDownload).toBe(false);
  });

  it('download: link de 60 s só para material publicado', async () => {
    const d = deps();
    const now = new Date('2026-10-28T12:00:00.000Z');
    expect(await downloadMaterial(d, ID, now)).toEqual({
      url: 'https://storage.test/assinado',
      expiresAt: '2026-10-28T12:01:00.000Z',
    });
    expect(await downloadMaterial(d, 'outro', now)).toBeNull();
  });

  const input = {
    key: `${ID}.pdf`,
    fileName: 'Modelo.pdf',
    title: 'Modelo de contrato',
    description: '',
    subject: 'Contratos',
    version: '1',
    license: '',
    revisedOn: null,
    courseId: null,
  };

  it('cria em rascunho com tamanho e tipo do arquivo que chegou de verdade', async () => {
    const d = deps();
    expect(await createMaterial(d, input)).toEqual({ id: ID });
    expect(d.calls[0]).toEqual([
      'create',
      expect.objectContaining({ sizeBytes: 2048, mimeType: 'application/pdf', license: null }),
    ]);
  });

  it('arquivo falso ou curso inexistente: nada criado e o arquivo sai do bucket', async () => {
    const fake = deps({ head: new Uint8Array([0x4d, 0x5a]) });
    expect(await createMaterial(fake, input)).toEqual({ rejected: 'content_mismatch' });
    expect(fake.calls).toEqual([['remove', `${ID}.pdf`]]);

    const noCourse = deps(undefined, 'course');
    expect(await createMaterial(noCourse, { ...input, courseId: ID })).toBe('course_not_found');
    expect(noCourse.calls.at(-1)).toEqual(['remove', `${ID}.pdf`]);
  });

  it('exclusão lógica tira o arquivo do bucket; inexistente: null', async () => {
    const d = deps();
    expect(await deleteMaterial(d, ID, new Date())).toEqual({
      title: 'Modelo de contrato',
      fileRemoved: true,
    });
    expect(d.calls).toEqual([['remove', `${ID}.pdf`]]);
    expect(await deleteMaterial(d, 'outro', new Date())).toBeNull();
  });

  it('Storage fora do ar na exclusão: excluído mesmo assim, com a pendência registrada', async () => {
    const d = deps();
    d.storage.remove = async () => {
      throw new Error('storage: falha ao remover (StorageApiError)');
    };
    expect(await deleteMaterial(d, ID, new Date())).toEqual({
      title: 'Modelo de contrato',
      fileRemoved: false,
    });
  });
});
