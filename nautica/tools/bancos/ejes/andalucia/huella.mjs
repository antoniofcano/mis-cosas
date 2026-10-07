// Huella de las preguntas de Andalucía 2015–2019 (fase F5), la misma que la de la migración (tools/bancos/migrar-andalucia.mjs:
// enunciado, opciones, correcta, anulada y tema). tests/bancos.test.js comprueba con ella que ninguna cambia, igual que con
// tools/bancos/andalucia-huella.json las 1530 de 2020–2026.
//   node tools/bancos/ejes/andalucia/huella.mjs   → tools/bancos/andalucia-huella-2015-2019.json
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANCOS, RAIZ, escribirTexto, leerJSON } from '../../lib/comun.mjs';
import { huella } from '../../migrar-andalucia.mjs';

/** ¿Es una pregunta de las convocatorias de 2015–2019? */
export const deF5 = (id) => /^and-(py-)?201[5-9]-c\d+b?-/.test(id);

export function huellas() {
  const out = {};
  for (const tit of ['per', 'py']) for (const q of leerJSON(join(RAIZ, 'data', 'ejes', 'andalucia', tit, 'preguntas.json')).preguntas) if (deF5(q.id)) out[q.id] = huella(q);
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const h = huellas();
  escribirTexto(join(BANCOS, 'andalucia-huella-2015-2019.json'), `{\n${Object.entries(h).map(([id, x]) => `${JSON.stringify(id)}:${JSON.stringify(x)}`).join(',\n')}\n}\n`);
  console.log(Object.keys(h).length, 'huellas');
}
