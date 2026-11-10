// Errores típicos que más «ponen» los tribunales (R-45, repaso exprés de la víspera): de las opciones erróneas de las
// preguntas con resolución programada de cada banco (eje y titulación), cuántas encajan con un único error típico
// (src/exams/diagnostico.js, la misma cuenta de tools/diagnostico-cobertura.mjs). Se guarda ya calculado en
// data/comun/errores-frecuentes.json para que la app no resuelva el banco entero al abrir la víspera.
//
// Solo cuentan las preguntas que se estudian (`banco.estudio`: sin las reservadas para el examen final, docs/CUARENTENA.md):
// el resultado es un recuento de tipos de error, nunca una pregunta ni una opción.
//
//   node tools/errores-frecuentes.mjs            escribe data/comun/errores-frecuentes.json
//   node tools/errores-frecuentes.mjs --check    comprueba que el fichero está al día (sale con 1 si no)
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createChart } from '../src/chart/chart.js';
import { SOLUCIONES } from '../src/bancos/soluciones.js';
import { resolverVariantes, variantesQueLlevanA } from '../src/exams/diagnostico.js';
import { ERRORES } from '../src/exams/taxonomia.js';
import { bancosNode, ejes, titsDeEje, RAIZ } from './bancos/leer.mjs';

export const RUTA = 'data/comun/errores-frecuentes.json';
/** Errores que se guardan por banco (los que más distractores explican). */
export const POR_BANCO = 8;

/** { 'eje/tit': [{ id, n }] } con `n` = opciones erróneas que ese error explica (como único error posible). */
export async function calcularErroresFrecuentes() {
  const chart = createChart(JSON.parse(readFileSync(new URL('../data/chart-105.json', import.meta.url))));
  const bancos = bancosNode();
  const out = {};
  for (const e of ejes()) {
    for (const tit of titsDeEje(e.id)) {
      const banco = await bancos.cargarBanco(e.id, tit);
      const estudio = new Set(banco.estudio.map((q) => q.id));
      const cuenta = new Map();
      for (const q of banco.todas) {
        const sol = SOLUCIONES[q.id];
        if (!sol || !estudio.has(q.id) || q.anulada || !q.correcta) continue;
        const r = resolverVariantes(q, sol, chart);
        if (!r) continue;
        for (const x of Object.keys(q.opciones ?? {})) {
          if (x === q.correcta || (q.aceptadas ?? []).includes(x) || (r.base.pick.choice === q.correcta && r.base.pick.repetidas.includes(x))) continue;
          const tipos = [...new Set(variantesQueLlevanA(q, r, x).map((v) => v.tipo))];
          if (tipos.length === 1 && ERRORES[tipos[0]]) cuenta.set(tipos[0], (cuenta.get(tipos[0]) ?? 0) + 1);
        }
      }
      out[`${e.id}/${tit}`] = [...cuenta].map(([id, n]) => ({ id, n })).sort((a, b) => b.n - a.n || a.id.localeCompare(b.id)).slice(0, POR_BANCO);
    }
  }
  return out;
}

export const documento = (porBanco) => ({
  meta: {
    descripcion: 'Errores típicos que más explican las opciones erróneas de las preguntas de carta y cuentas de cada banco (eje/titulación): n = opciones erróneas que encajan con ese único error. Sale de tools/errores-frecuentes.mjs (no se edita a mano) y solo cuenta las preguntas que se estudian, no las reservadas.',
    nombres: 'src/exams/taxonomia.js (ERRORES)',
  },
  porBanco,
});

/** JSON con cada error en una línea ({ id, n }): el fichero se lee y se revisa mejor. */
export const serializar = (doc) => `${JSON.stringify(doc, null, 1).replace(/\{\n\s+"id": ("[^"]+"),\n\s+"n": (\d+)\n\s+\}/g, '{ "id": $1, "n": $2 }')}\n`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const nuevo = serializar(documento(await calcularErroresFrecuentes()));
  const ruta = `${RAIZ}/${RUTA}`;
  if (process.argv.includes('--check')) {
    let actual = '';
    try { actual = readFileSync(ruta, 'utf8'); } catch { /* no existe */ }
    if (actual !== nuevo) { console.error(`${RUTA} no está al día: node tools/errores-frecuentes.mjs`); process.exit(1); }
    console.log(`${RUTA} al día`);
  } else {
    writeFileSync(ruta, nuevo);
    console.log(`escrito ${RUTA}`);
  }
}
