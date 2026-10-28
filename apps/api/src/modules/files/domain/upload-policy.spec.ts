import { MATERIALS_BUCKET } from '@caixa-forte/contracts';
import { describe, expect, it } from '@jest/globals';

import { checkUpload, downloadName, extensionOf, storageKey } from './upload-policy';

const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);
const ZIP = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const EXE = new Uint8Array([0x4d, 0x5a, 0x90, 0x00]);
const DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

const check = (fileName: string, mimeType: string, bytes: Uint8Array) =>
  checkUpload(MATERIALS_BUCKET, { fileName, mimeType, bytes });

describe('regra de upload de arquivos privados', () => {
  it('aceita PDF, Office moderno e imagem quando tipo, extensão e conteúdo batem', () => {
    expect(check('Contrato modelo.pdf', 'application/pdf', PDF)).toEqual({
      ok: true,
      extension: 'pdf',
    });
    expect(check('Planilha.DOCX', DOCX, ZIP)).toEqual({ ok: true, extension: 'docx' });
    expect(check('capa.png', 'image/png', PNG)).toEqual({ ok: true, extension: 'png' });
  });

  it('recusa executável renomeado, extensão de outro tipo e tipo fora da lista', () => {
    expect(check('virus.pdf', 'application/pdf', EXE)).toEqual({
      ok: false,
      reason: 'content_mismatch',
    });
    expect(check('arquivo.docx', 'application/pdf', PDF)).toEqual({
      ok: false,
      reason: 'extension_mismatch',
    });
    expect(check('script.html', 'text/html', PDF)).toEqual({
      ok: false,
      reason: 'type_not_allowed',
    });
    expect(check('sem-extensao', 'application/pdf', PDF)).toEqual({
      ok: false,
      reason: 'extension_mismatch',
    });
  });

  it('recusa vazio e acima do limite do bucket', () => {
    expect(check('a.pdf', 'application/pdf', new Uint8Array())).toEqual({
      ok: false,
      reason: 'empty',
    });
    const big = new Uint8Array(MATERIALS_BUCKET.maxBytes + 1);
    big.set(PDF);
    expect(check('a.pdf', 'application/pdf', big)).toEqual({ ok: false, reason: 'too_large' });
  });

  it('chave do objeto nunca usa o nome enviado; nome de download sem caracteres perigosos', () => {
    expect(storageKey('0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e', 'pdf')).toBe(
      '0b6f5c1e-3c1a-4c55-9d0e-1f2a3b4c5d6e.pdf',
    );
    expect(downloadName('../../etc/"passwd"\n.pdf', 'pdf')).toBe('.. .. etc passwd.pdf');
    expect(downloadName('.pdf', 'pdf')).toBe('arquivo.pdf');
    expect(extensionOf('Relatório Final.PDF ')).toBe('pdf');
  });
});
