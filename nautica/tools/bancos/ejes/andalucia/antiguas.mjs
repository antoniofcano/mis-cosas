// Informe de la extracción de Andalucía 2015–2019 (fase F2; entran en la app en la fase F5).
//   npm run bancos -- andalucia --todas      (extrae 2015–2026 a .cache/bancos/andalucia/salida/, sin tocar data/ejes)
//   node tools/bancos/ejes/andalucia/antiguas.mjs   → tools/bancos/informes/andalucia-2015-2019.md
// Recuentos por convocatoria, lectura óptica (estados, margen entre la 1.ª y la 2.ª burbuja, acuerdo entre las hojas de
// los modelos A y B), correcciones aplicadas y modo de texto usado en cada cuadernillo. Solo cifras e ids: el texto de
// las preguntas está en la caché.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANCOS, CACHE, escribirTexto, hoy } from '../../lib/comun.mjs';

const ANTIGUA = /^and-(py-)?201[5-9]-/;
const leer = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'));
const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1).replace('.', ',')} %` : '—');
const dec = (x) => x.toFixed(2).replace('.', ',');

/** Estadísticas de 2015–2019 a partir de la caché de etapas. */
export function estadisticas({ cache = CACHE } = {}) {
  const dir = join(cache, 'andalucia', 'etapas');
  const out = {};
  for (const tit of ['per', 'py']) {
    const corr = leer(join(dir, `correcciones-${tit}.json`));
    const val = leer(join(dir, `validar-${tit}.json`));
    const norm = existsSync(join(dir, `normativa-${tit}.json`)) ? leer(join(dir, `normativa-${tit}.json`)) : corr;
    const ps = corr.preguntas.filter((p) => ANTIGUA.test(p.id));
    const normaDe = new Map(norm.preguntas.map((p) => [p.id, p.norma]));
    const porConv = new Map();
    const margenes = [];
    for (const p of ps) {
      const c = porConv.get(p.conv) ?? { conv: p.conv, fecha: p.fecha, preguntas: 0, apariciones: 0, anuladas: 0, multiples: 0, estados: {}, pares: 0, acuerdo: 0, revisar: 0 };
      c.preguntas++;
      c.apariciones += p.apareceEn.length;
      if (p.anulada) c.anuladas++;
      if (p.aceptadas.length > 1) c.multiples++;
      if (normaDe.get(p.id)?.estado === 'revisar') c.revisar++;
      for (const a of p.apareceEn) {
        const r = a.respuesta;
        c.estados[r.estado] = (c.estados[r.estado] ?? 0) + 1;
        if (r.estado === 'ok' || r.estado === 'dudosa') {
          const v = [...r.puntos].sort((x, y) => y - x);
          margenes.push({ ref: `${a.conv}/${a.modelo ?? a.orden}/${a.numero}`, relacion: v[0] > 0 ? v[1] / v[0] : 1, marca: v[0] });
        }
      }
      if (p.apareceEn.length === 2) {
        c.pares++;
        const [x, y] = p.apareceEn.map((a) => a.respuesta.letras.join('') || a.respuesta.estado);
        if (x === y) c.acuerdo++;
      }
      porConv.set(p.conv, c);
    }
    margenes.sort((a, b) => b.relacion - a.relacion);
    const ids = ps.map((p) => p.id);
    out[tit] = {
      preguntas: ps.length, convocatorias: [...porConv.values()].sort((a, b) => a.conv.localeCompare(b.conv)),
      margenes, conflictos: corr.conflictos.filter((c) => ANTIGUA.test(c.id)), dudas: corr.dudas.filter((c) => ANTIGUA.test(c.id)),
      errores: val.errores.filter((e) => ids.some((id) => e.startsWith(id))),
      anuladas: ps.filter((p) => p.anulada).map((p) => ({ id: p.id, notas: p.notasCorreccion })),
      multiples: ps.filter((p) => p.aceptadas.length > 1).map((p) => ({ id: p.id, aceptadas: p.aceptadas })),
      ids: [ids[0], ids.at(-1)],
    };
  }
  return out;
}

export function informe(e) {
  const L = ['# Andalucía 2015–2019 · extracción (solo caché)', ''];
  L.push(`Generado por \`node tools/bancos/ejes/andalucia/antiguas.mjs\` el ${hoy()}, tras \`npm run bancos -- andalucia --todas\`. Las 16 convocatorias de 2015–2019 (research_notes/…/andalucia_anteriores.md) se extraen de sus PDF oficiales (cuestionario de texto + hoja de lectura óptica escaneada) con el adaptador \`hoja-optica\`, a \`.cache/bancos/andalucia/salida/<tit>/preguntas.json\` junto con las de 2020–2026. **No se escriben en \`data/ejes/\`**: entran en la app en la fase F5.`, '');
  L.push('Ids con el esquema de Andalucía: `and-AAAA-cN-tNN` (teoría PER), `and-AAAA-cN-qNN` (carta PER), `and-py-AAAA-cN-gNN|nNN` (PY). Casos especiales:', '');
  L.push('- **1ª de 2018**: su página está en otra ruta (`…/investigacion-innovacion-deportiva/…`). El PY tuvo modelos A y B de cada módulo con **preguntas distintas** (no son permutaciones): el A es `and-py-2018-c1-…` y el B, una convocatoria aparte del banco, `and-py-2018-c1b-gNN|nNN` («1ª convocatoria 2018, PY modelo B» en config.json).');
  L.push('- **3ª de 2018**: solo PNB y PER (Cádiz y Sevilla); no hubo PY (`titulaciones: ["per"]` en config.json).');
  L.push('- **2015**: los cuadernillos no traen fecha y no se ha encontrado en fuente oficial: las preguntas van sin fecha (la etapa normativa las marca «revisar» con toda norma cuyo detector encaja). Las fechas del PY de 2018 (14-3, 12-6 y 23-11) son las de sus portadas, distintas de las del PER.');
  L.push('- Correcciones publicadas (ejes/andalucia/correcciones.json): las de las páginas de 2015–2016 y la nota del Tribunal de 21-01-2019 de la 4ª de 2018 (leída por OCR del PDF escaneado: anula la 39 de A y B; da por buenas a+b en A11/B12 y c+d en A13/B14). La otra nota de esa página («alegaciones contestadas») no se pudo descargar (el servidor no da Content-Length ni con peticiones por rangos).', '');
  for (const tit of ['per', 'py']) {
    const x = e[tit];
    const tot = x.convocatorias.reduce((s, c) => { for (const [k, n] of Object.entries(c.estados)) s[k] = (s[k] ?? 0) + n; return s; }, {});
    const lecturas = Object.values(tot).reduce((s, n) => s + n, 0);
    const pares = x.convocatorias.reduce((s, c) => s + c.pares, 0);
    const acuerdo = x.convocatorias.reduce((s, c) => s + c.acuerdo, 0);
    L.push(`## ${tit.toUpperCase()}`, '');
    L.push(`- **${x.preguntas} preguntas** de ${x.convocatorias.length} convocatorias (${x.ids[0]} … ${x.ids[1]}); ${x.anuladas.length} anuladas, ${x.multiples.length} con varias respuestas aceptadas.`);
    L.push(`- Lectura óptica: ${lecturas} filas leídas: ${Object.entries(tot).map(([k, n]) => `${n} ${k}`).join(', ')}.${pares ? ` Modelos A y B: **${acuerdo}/${pares}** preguntas con la misma respuesta en las dos hojas (${pct(acuerdo, pares)}).` : ' Un solo modelo por convocatoria: no hay segunda hoja con la que cruzar.'}`);
    L.push(`- Conflictos entre apariciones: ${x.conflictos.length}; lecturas dudosas o sin respuesta: ${x.dudas.length}; errores de validación: ${x.errores.length}.`);
    L.push(`- Burbujas con menos margen (2.ª/1.ª; «dudosa» desde 0,35): ${x.margenes.slice(0, 6).map((m) => `${m.ref} ${dec(m.relacion)}`).join('; ')}.`, '');
    L.push('| Convocatoria | Fecha | Preguntas | Apariciones | Anuladas | Varias válidas | Lecturas (estado) | A=B | Norma a revisar |', '|---|---|---|---|---|---|---|---|---|');
    for (const c of x.convocatorias) L.push(`| ${c.conv} | ${c.fecha ?? '—'} | ${c.preguntas} | ${c.apariciones} | ${c.anuladas} | ${c.multiples} | ${Object.entries(c.estados).map(([k, n]) => `${n} ${k}`).join(', ')} | ${c.pares ? `${c.acuerdo}/${c.pares}` : '—'} | ${c.revisar} |`);
    L.push('');
    if (x.anuladas.length || x.multiples.length) {
      L.push('Anuladas y con varias respuestas:', '');
      for (const a of x.anuladas) L.push(`- ${a.id}: anulada${a.notas?.length ? ` — ${a.notas.join(' ').replace(/\s*\[https?:[^\]]+\]/g, '').slice(0, 160)}` : ' (fila en blanco en la hoja)'}`);
      for (const m of x.multiples) L.push(`- ${m.id}: aceptadas ${m.aceptadas.join(' y ')}`);
      L.push('');
    }
    if (x.dudas.length) L.push('Lecturas dudosas:', '', ...x.dudas.map((d) => `- ${d.id}: ${d.motivo} (${d.detalle.join('; ')})`), '');
  }
  L.push('## Arreglos del proceso necesarios para 2015–2019', '');
  L.push('- **Texto en columnas (2015)**: pdftotext en modo normal separa las letras «a) b) c) d)» de sus textos. El adaptador lee en modo normal y, si no salen las n preguntas con sus cuatro opciones, prueba `-raw` y `-layout` y se queda la mejor lectura (2015: `-raw` en 11 de los 12 cuadernillos).');
  L.push('- **Cabecera de página de 2015** (códigos de certificación «ER-…/2011», «CÓDIGO nnnnnnnn» y el nombre del centro que maquetó los cuadernillos, con las letras separadas en `-raw`): ruido.');
  L.push('- **Escaneos girados**: un giro del 1,5 % desplaza medio paso de fila el bloque 1–25 respecto de las marcas de sincronismo (antes del arreglo: PER 1/2017 con 12 respuestas distintas entre las hojas A y B y 17 lecturas dudosas; PER 3/2015 con 26 y 22). `hoja_optica.py` mide el giro en las marcas, predice el desfase de cada bloque y lo afina con la plantilla impresa; también corrige la deriva horizontal de las columnas.');
  L.push('- **Hoja de 2015–2016 (otro impresor, casillas rectangulares) y lápiz claro**: el lápiz se busca como gris (oscuro y sin color), sin confundirlo con los números impresos en magenta oscuro, y el paso de burbuja se busca entre el 92 % y el 102 % del nominal (PY 2/2015: el peine se corría sobre los números y salían 10 filas en blanco).');
  L.push('- Tras los arreglos, la prueba de oro de 2020–2026 sigue en el 100 % (informes/andalucia-oro.md).', '');
  return `${L.join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const e = estadisticas();
  escribirTexto(join(BANCOS, 'informes', 'andalucia-2015-2019.md'), informe(e));
  for (const t of ['per', 'py']) console.log(t, e[t].preguntas, 'preguntas', e[t].convocatorias.length, 'convocatorias', e[t].conflictos.length, 'conflictos', e[t].dudas.length, 'dudas');
}
