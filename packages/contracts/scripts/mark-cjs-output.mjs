// O pacote é "type": "module", então os .js de dist/cjs seriam lidos como ESM. Este marcador
// diz ao Node que aquela pasta é CommonJS (#165). Roda no fim do build, depois das duas emissões.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const destino = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist', 'cjs');

mkdirSync(destino, { recursive: true });
writeFileSync(join(destino, 'package.json'), `${JSON.stringify({ type: 'commonjs' }, null, 2)}\n`);

console.log('dist/cjs marcado como CommonJS');
