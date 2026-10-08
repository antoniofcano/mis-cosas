// Informe de discrepancias: las respuestas oficiales que la norma o las matemáticas desmienten (campo `discrepancia`
// de explicaciones.json), por tribunal y titulación. Excluye las reservadas para el examen final y las anuladas.
//   node tools/discrepancias.mjs --escribir   regenera docs/DISCREPANCIAS.md
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, ejes, titsDeEje } from './bancos/leer.mjs';
import { reservas } from './cuarentena.mjs';

const NOMBRE = { andalucia: 'Andalucía', dgmm: 'Dirección General de la Marina Mercante', baleares: 'Illes Balears' };
const leer = (r) => JSON.parse(readFileSync(join(RAIZ, r), 'utf8'));
const una = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

export async function informe() {
  const { reservadas } = await reservas();
  const sal = [];
  let total = 0;
  for (const e of ejes()) {
    const bloques = [];
    for (const tit of titsDeEje(e.id)) {
      const pre = leer(`data/ejes/${e.id}/${tit}/preguntas.json`);
      const arr = Array.isArray(pre) ? pre : pre.preguntas;
      const ex = leer(`data/ejes/${e.id}/${tit}/explicaciones.json`);
      const m = ex.explicaciones ?? ex;
      const filas = arr.filter((q) => m[q.id]?.discrepancia && !q.anulada && !reservadas.has(q.id))
        .sort((a, b) => a.id.localeCompare(b.id));
      if (!filas.length) continue;
      bloques.push(`### ${tit === 'per' ? 'PER' : 'Patrón de Yate'} (${filas.length})\n`);
      for (const q of filas) {
        const d = m[q.id];
        bloques.push(`**${q.id}** · ${una(q.convocatoria)}  \n${una(q.enunciado)}  \nOficial: **${q.correcta})** ${una(q.opciones?.[q.correcta])}  \n${una(d.discrepancia)}${d.defendible ? `  \n_Opción defendible: ${d.defendible})_` : ''}\n`);
      }
      total += filas.length;
    }
    if (bloques.length) sal.push(`## ${NOMBRE[e.id] ?? e.id}\n\n${bloques.join('\n')}`);
  }
  return { total, texto: `# Discrepancias entre la plantilla oficial y la norma\n\nGenerado con \`node tools/discrepancias.mjs --escribir\`. ${total} preguntas de convocatorias publicadas cuya respuesta oficial no coincide con la legislación vigente o con las matemáticas. La respuesta oficial no se modifica en los datos: en el examen real vale la del tribunal. Excluye las anuladas y las reservadas para el examen final. Las fuentes de cada banco están en \`docs/BANCOS.md\`.\n\n${sal.join('\n')}` };
}

if (process.argv[1].endsWith('discrepancias.mjs') && process.argv.includes('--escribir')) {
  const { total, texto } = await informe();
  writeFileSync(join(RAIZ, 'docs/DISCREPANCIAS.md'), texto);
  console.log(`docs/DISCREPANCIAS.md: ${total} preguntas`);
}
