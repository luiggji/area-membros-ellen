import { describe, expect, it } from 'vitest';

import {
  createMaterialRequestSchema,
  MATERIAL_KINDS,
  prepareMaterialUploadRequestSchema,
} from '../src/materials.js';
import { MATERIALS_BUCKET } from '../src/storage.js';

const MATERIAL_ID = '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e';

const metadata = {
  key: `${MATERIAL_ID}.pdf`,
  fileName: 'Modelo.pdf',
  title: 'Modelo de contrato',
  description: '',
  subject: 'Contratos',
  version: '1',
  license: '',
  revisedOn: null,
  courseId: null,
};

describe('Cofre de materiais', () => {
  it('envio: só tipos do bucket e até o limite', () => {
    const file = { fileName: 'a.pdf', mimeType: 'application/pdf', sizeBytes: 10 };
    expect(prepareMaterialUploadRequestSchema.safeParse(file).success).toBe(true);
    expect(
      prepareMaterialUploadRequestSchema.safeParse({ ...file, mimeType: 'text/html' }).success,
    ).toBe(false);
    expect(
      prepareMaterialUploadRequestSchema.safeParse({
        ...file,
        sizeBytes: MATERIALS_BUCKET.maxBytes + 1,
      }).success,
    ).toBe(false);
  });

  it('material: chave no formato do servidor, data de revisão ISO, assunto obrigatório', () => {
    expect(createMaterialRequestSchema.safeParse(metadata).success).toBe(true);
    expect(createMaterialRequestSchema.safeParse({ ...metadata, key: '../x.pdf' }).success).toBe(
      false,
    );
    expect(
      createMaterialRequestSchema.safeParse({ ...metadata, revisedOn: '03/11/2026' }).success,
    ).toBe(false);
    expect(createMaterialRequestSchema.safeParse({ ...metadata, subject: '' }).success).toBe(false);
  });

  it('todo tipo aceito pelo bucket tem um nome para o membro', () => {
    expect(Object.keys(MATERIAL_KINDS).sort()).toEqual(Object.keys(MATERIALS_BUCKET.types).sort());
  });
});
