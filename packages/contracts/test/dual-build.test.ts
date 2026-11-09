import { describe, expect, it } from 'vitest';

import pacote from '../package.json' with { type: 'json' };

/**
 * Este pacote é ESM, mas a API é CommonJS. Enquanto só havia emissão ESM, a API só conseguia
 * consumi-lo pelo `require()` de ESM nativo do Node (≥ 22.12) — e a função da Vercel, que roda
 * num empacotamento CJS, quebrava no boot com ERR_REQUIRE_ESM (#165).
 *
 * Os testes da API não pegam isso: o Jest dela mapeia `@caixa-forte/contracts` direto para o
 * fonte, então nunca exercita o artefato publicado. A guarda precisa morar aqui.
 */
describe('emissão dupla do pacote', () => {
  it('oferece ESM para import e CommonJS para require', () => {
    expect(pacote.exports['.']).toMatchObject({
      import: './dist/index.js',
      require: './dist/cjs/index.js',
    });
  });

  it('aponta o main para o CommonJS, para quem ignora o mapa de exports', () => {
    expect(pacote.main).toBe('./dist/cjs/index.js');
  });

  it('o build emite as duas saídas e marca a pasta CommonJS', () => {
    expect(pacote.scripts.build).toContain('tsconfig.build.json');
    expect(pacote.scripts.build).toContain('tsconfig.cjs.json');
    expect(pacote.scripts.build).toContain('mark-cjs-output.mjs');
  });
});
