// Las hojas de estilo cierran todas sus llaves. Una llave sin cerrar no rompe nada visible al momento: deja todo lo que
// va detrás dentro del bloque anterior (en #140, un `@media print` abierto dejó los estilos de pantalla del ensayo en
// papel solo para imprimir).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

test('cada hoja de estilo cierra todas sus llaves y nunca cierra de más', () => {
  for (const f of readdirSync(new URL('../styles/', import.meta.url)).filter((x) => x.endsWith('.css'))) {
    const s = readFileSync(new URL(`../styles/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/"[^"\n]*"|'[^'\n]*'/g, '""');
    let d = 0;
    s.split('\n').forEach((l, i) => {
      for (const ch of l) { d += ch === '{' ? 1 : ch === '}' ? -1 : 0; assert.ok(d >= 0, `${f}:${i + 1} cierra una llave de más`); }
    });
    assert.equal(d, 0, `${f}: quedan ${d} llaves sin cerrar`);
  }
});
