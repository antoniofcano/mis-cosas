// Informe de la extracción de Andalucía 2015–2019 (fase F2; entran en la app en la fase F5).
//   npm run bancos -- andalucia --todas      (extrae 2015–2026 a .cache/bancos/andalucia/salida/, sin tocar data/ejes)
//   node tools/bancos/ejes/andalucia/antiguas.mjs   → tools/bancos/informes/andalucia-2015-2019.md
// Recuentos por convocatoria, lectura óptica (estados, margen entre la 1.ª y la 2.ª burbuja, fuerza de la marca sobre el
// umbral de su hoja, acuerdo entre las hojas de los modelos A y B), correcciones publicadas frente a lo que marca la
// hoja, cruce con las preguntas que se repiten en otras convocatorias (2015–2026) y emparejamientos dudosos.
// Solo cifras e ids (y fragmentos de enunciado de las variantes): el texto de las preguntas está en la caché.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { BANCOS, CACHE, escribirTexto, hoy } from '../../lib/comun.mjs';
import { clave, jaccard, tokens } from '../../lib/texto.mjs';

const ANTIGUA = /^and-(py-)?201[5-9]-/;
const leer = (ruta) => JSON.parse(readFileSync(ruta, 'utf8'));
const pct = (n, d) => (d ? `${((100 * n) / d).toFixed(1).replace('.', ',')} %` : '—');
const dec = (x) => x.toFixed(2).replace('.', ',');

/** Tramos de la relación 2.ª/1.ª burbuja y de la fuerza de la marca (1.ª burbuja / umbral de su hoja). */
export const TRAMOS_RELACION = [[0, 0.1, '< 0,10'], [0.1, 0.2, '0,10–0,20'], [0.2, 0.35, '0,20–0,35'], [0.35, Infinity, '≥ 0,35 (dudosa)']];
export const TRAMOS_FUERZA = [[0, 1.5, '< 1,5'], [1.5, 2, '1,5–2'], [2, 3, '2–3'], [3, Infinity, '≥ 3']];
const tramo = (tramos, x) => tramos.find(([a, b]) => x >= a && x < b)[2];

/** Referencia legible de una aparición: conv/modelo/número. */
const ref = (a) => `${a.conv}/${a.modelo ?? a.orden}/${a.numero}`;

/**
 * Confianza de la lectura óptica de una lista de preguntas (con apareceEn[].respuesta de la hoja-optica).
 * relacion = 2.ª burbuja / 1.ª (0 = una sola marca limpia); fuerza = 1.ª burbuja / umbral de marca de su hoja
 * (1 = justo en el umbral). Las vacías y múltiples se listan con su pregunta para ver si casan con anulada/aceptadas.
 */
export function confianza(ps) {
  const relacion = Object.fromEntries(TRAMOS_RELACION.map((t) => [t[2], 0]));
  const fuerza = Object.fromEntries(TRAMOS_FUERZA.map((t) => [t[2], 0]));
  const leidas = [];
  const vacias = [];
  const multiples = [];
  for (const p of ps) {
    for (const a of p.apareceEn) {
      const r = a.respuesta;
      const v = [...(r.puntos ?? [])].sort((x, y) => y - x);
      if (r.estado === 'ok' || r.estado === 'dudosa') {
        const rel = v[0] > 0 ? Math.max(v[1], 0) / v[0] : 1;
        const fz = r.umbral ? v[0] / r.umbral : null;
        relacion[tramo(TRAMOS_RELACION, rel)]++;
        if (fz != null) fuerza[tramo(TRAMOS_FUERZA, fz)]++;
        leidas.push({ ref: ref(a), relacion: rel, fuerza: fz });
      } else if (r.estado === 'vacia') {
        vacias.push({ ref: ref(a), id: p.id, fuerza: r.umbral ? v[0] / r.umbral : null, anulada: p.anulada });
      } else if (r.estado === 'multiple') {
        multiples.push({ ref: ref(a), id: p.id, letras: r.letrasOriginales ?? r.letras, aceptadas: p.aceptadas, anulada: p.anulada });
      }
    }
  }
  const conFuerza = leidas.filter((l) => l.fuerza != null).sort((a, b) => a.fuerza - b.fuerza);
  return {
    leidas: leidas.length, relacion, fuerza,
    peorRelacion: [...leidas].sort((a, b) => b.relacion - a.relacion).slice(0, 6),
    peorFuerza: conFuerza.slice(0, 6),
    fuerzaMediana: conFuerza.length ? conFuerza[Math.floor(conFuerza.length / 2)].fuerza : null,
    vacias, multiples,
  };
}

/** Modelos A y B: preguntas con las dos hojas, acuerdo, y cuántas cambian de número o barajan las opciones en el B. */
export function cruceModelos(ps) {
  let pares = 0;
  let acuerdo = 0;
  let otroNumero = 0;
  let barajadas = 0;
  const desacuerdos = [];
  for (const p of ps) {
    if (p.apareceEn.length !== 2) continue;
    pares++;
    const [x, y] = p.apareceEn.map((a) => a.respuesta.letras.join('') || a.respuesta.estado);
    if (x === y) acuerdo++; else desacuerdos.push({ id: p.id, a: x, b: y });
    const b = p.apareceEn[1];
    if (b.numero !== p.apareceEn[0].numero) otroNumero++;
    if (b.mapa && Object.entries(b.mapa).some(([k, v]) => k !== v)) barajadas++;
  }
  return { pares, acuerdo, otroNumero, barajadas, desacuerdos };
}

/** Correcciones publicadas de 2015–2019 frente a lo que marca la hoja escaneada (¿ya estaban en la plantilla?). */
export function correccionesFrenteHoja(ps, correcciones, tit) {
  const out = [];
  const deTit = (x) => (tit === 'py') === x.conv.startsWith('and-py-');
  for (const c of correcciones.filter((x) => ANTIGUA.test(`${x.conv}-`) && (!tit || deTit(x)))) {
    const igual = (m) => String(m ?? '').toLowerCase() === String(c.modelo ?? '').toLowerCase();
    let p = null;
    let a = null;
    for (const q of ps) {
      a = q.apareceEn.find((x) => x.conv === c.conv && igual(x.modelo) && x.numero === c.numero);
      if (a) { p = q; break; }
    }
    if (!p) { out.push({ ...c, letras: c.letras ?? [], id: null, hoja: null, veredicto: 'sin pregunta' }); continue; }
    const hoja = (a.respuesta.letrasOriginales ?? a.respuesta.letras).join('');
    let veredicto;
    if (c.accion === 'anular') veredicto = a.respuesta.estado === 'vacia' ? 'la hoja ya la deja en blanco' : `la hoja marca «${hoja}»: la anulación solo está en la página`;
    else if (c.accion === 'respuesta') veredicto = hoja === c.letras.join('') ? 'la hoja ya trae la respuesta corregida' : `la hoja marca «${hoja || a.respuesta.estado}»: se corrige`;
    else if (c.accion === 'aceptar') veredicto = hoja === c.letras.join('') ? 'la hoja ya marca las dos' : `la hoja marca «${hoja || a.respuesta.estado}»`;
    else veredicto = c.accion;
    out.push({ conv: c.conv, modelo: c.modelo, numero: c.numero, accion: c.accion, letras: c.letras ?? [], id: p.id, hoja, veredicto, final: p.anulada ? 'anulada' : p.aceptadas.join('+') });
  }
  return out;
}

/** Tramo en que difieren dos enunciados (sin el principio ni el final comunes), en palabras canónicas. */
export function diferenciaEnunciados(a, b) {
  const x = tokens(a);
  const y = tokens(b);
  let i = 0;
  while (i < x.length && i < y.length && x[i] === y[i]) i++;
  let j = 0;
  while (j < x.length - i && j < y.length - i && x[x.length - 1 - j] === y[y.length - 1 - j]) j++;
  return [x.slice(i, x.length - j).join(' '), y.slice(i, y.length - j).join(' ')];
}

/** Revisión a mano de las variantes con respuesta distinta (clave «id~id»). */
export const VEREDICTOS = {
  'and-2017-c3-t34~and-2018-c1-t34': 'coherente: brisa «de la mar hacia tierra» = virazón; «de la tierra a mar» = terral',
  'and-py-2017-c2-g17~and-py-2023-c2-g12': 'coherente: polar de vanguardia más frío → oclusión cálida; de retaguardia más frío → oclusión fría',
  'and-py-2019-c1-g15~and-py-2023-c2-g12': 'coherente: polar de vanguardia más frío → oclusión cálida; de retaguardia más frío → oclusión fría',
  'and-py-2019-c3-g14~and-py-2024-c2-g13': 'coherente: vanguardia «menos frío» que la retaguardia → oclusión fría; «más frío» → oclusión cálida',
};

/**
 * Preguntas de 2015–2019 que se repiten en otra convocatoria (2015–2026): mismo conjunto de opciones y enunciado con
 * Jaccard de palabras ≥ 0,90 (el criterio «unir» de la etapa repetidas). Si la respuesta (por el texto de la opción)
 * coincide, las dos lecturas ópticas, independientes, se confirman. Se separan las idénticas de las variantes (enunciado
 * con alguna palabra distinta, a menudo invertido a propósito).
 */
export function cruzarRepeticiones(todas) {
  const ps = todas.filter((p) => !p.anulada && p.aceptadas.length);
  const grupos = new Map();
  for (const p of ps) {
    const k = Object.values(p.opciones).map(clave).sort().join('|');
    if (!grupos.has(k)) grupos.set(k, []);
    grupos.get(k).push(p);
  }
  const resp = (p) => p.aceptadas.map((l) => clave(p.opciones[l])).sort().join(' + ');
  const res = { identicas: { pares: 0, acuerdo: 0 }, variantes: { pares: 0, acuerdo: 0 }, preguntas: new Set(), distintas: [] };
  for (const g of grupos.values()) {
    for (let i = 0; i < g.length; i++) {
      for (let j = i + 1; j < g.length; j++) {
        const [a, b] = [g[i], g[j]].sort((x, y) => x.id.localeCompare(y.id));
        if (a.conv === b.conv || !(ANTIGUA.test(a.id) || ANTIGUA.test(b.id))) continue;
        if (jaccard(a.enunciado, b.enunciado) < 0.9) continue;
        const tipo = clave(a.enunciado) === clave(b.enunciado) ? 'identicas' : 'variantes';
        res[tipo].pares++;
        for (const p of [a, b]) if (ANTIGUA.test(p.id)) res.preguntas.add(p.id);
        if (resp(a) === resp(b)) { res[tipo].acuerdo++; continue; }
        const par = `${a.id}~${b.id}`;
        res.distintas.push({ par, tipo, a: a.id, b: b.id, ra: a.aceptadas.join('+'), rb: b.aceptadas.join('+'), dif: diferenciaEnunciados(a.enunciado, b.enunciado), veredicto: VEREDICTOS[par] ?? 'sin revisar' });
      }
    }
  }
  res.preguntas = res.preguntas.size;
  return res;
}

/** Estadísticas de 2015–2019 a partir de la caché de etapas y de salida. */
export function estadisticas({ cache = CACHE } = {}) {
  const dir = join(cache, 'andalucia', 'etapas');
  const correcciones = leer(join(BANCOS, 'ejes', 'andalucia', 'correcciones.json')).correcciones;
  const out = {};
  for (const tit of ['per', 'py']) {
    const corr = leer(join(dir, `correcciones-${tit}.json`));
    const val = leer(join(dir, `validar-${tit}.json`));
    const norm = existsSync(join(dir, `normativa-${tit}.json`)) ? leer(join(dir, `normativa-${tit}.json`)) : corr;
    const clas = existsSync(join(dir, `clasificar-${tit}.json`)) ? leer(join(dir, `clasificar-${tit}.json`)) : { atipicas: [] };
    const rep = existsSync(join(dir, `repetidas-${tit}.json`)) ? leer(join(dir, `repetidas-${tit}.json`)) : { ambiguas: [], emparejadas: [] };
    const rutaSalida = join(cache, 'andalucia', 'salida', tit, 'preguntas.json');
    const salida = existsSync(rutaSalida) ? leer(rutaSalida).preguntas : corr.preguntas;
    const ps = corr.preguntas.filter((p) => ANTIGUA.test(p.id));
    const normaDe = new Map(norm.preguntas.map((p) => [p.id, p.norma]));
    const porConv = new Map();
    for (const p of ps) {
      const c = porConv.get(p.conv) ?? { conv: p.conv, fecha: p.fecha, preguntas: 0, apariciones: 0, anuladas: 0, multiples: 0, estados: {}, pares: 0, acuerdo: 0, revisar: 0 };
      c.preguntas++;
      c.apariciones += p.apareceEn.length;
      if (p.anulada) c.anuladas++;
      if (p.aceptadas.length > 1) c.multiples++;
      if (normaDe.get(p.id)?.estado === 'revisar') c.revisar++;
      for (const a of p.apareceEn) c.estados[a.respuesta.estado] = (c.estados[a.respuesta.estado] ?? 0) + 1;
      if (p.apareceEn.length === 2) {
        c.pares++;
        const [x, y] = p.apareceEn.map((a) => a.respuesta.letras.join('') || a.respuesta.estado);
        if (x === y) c.acuerdo++;
      }
      porConv.set(p.conv, c);
    }
    const ids = ps.map((p) => p.id);
    const antiguaRef = (s) => /^and-(py-)?201[5-9]-/.test(s);
    out[tit] = {
      preguntas: ps.length, convocatorias: [...porConv.values()].sort((a, b) => a.conv.localeCompare(b.conv)),
      conflictos: corr.conflictos.filter((c) => ANTIGUA.test(c.id)), dudas: corr.dudas.filter((c) => ANTIGUA.test(c.id)),
      errores: val.errores.filter((e) => ids.some((id) => e.startsWith(id))),
      avisos: val.avisos.filter((e) => ids.some((id) => e.startsWith(id))),
      anuladas: ps.filter((p) => p.anulada).map((p) => ({ id: p.id, notas: p.notasCorreccion })),
      multiples: ps.filter((p) => p.aceptadas.length > 1).map((p) => ({ id: p.id, aceptadas: p.aceptadas })),
      ids: [ids[0], ids.at(-1)],
      confianza: confianza(ps),
      modelos: cruceModelos(ps),
      correcciones: correccionesFrenteHoja(ps, correcciones, tit),
      repeticiones: cruzarRepeticiones(salida),
      ambiguas: (rep.ambiguas ?? []).filter((x) => antiguaRef(x.a) || antiguaRef(x.b)),
      emparejadas: (rep.emparejadas ?? []).filter((x) => antiguaRef(x.a) || antiguaRef(x.b)),
      atipicas: (clas.atipicas ?? []).filter((x) => ANTIGUA.test(x.id)),
    };
  }
  return out;
}

const lista = (o) => Object.entries(o).map(([k, n]) => `${k}: ${n}`).join('; ');

export function informe(e) {
  const L = ['# Andalucía 2015–2019 · extracción (solo caché)', ''];
  L.push(`Generado por \`node tools/bancos/ejes/andalucia/antiguas.mjs\` el ${hoy()}, tras \`npm run bancos -- andalucia --todas\`. Las 16 convocatorias de 2015–2019 (research_notes/…/andalucia_anteriores.md) se extraen de sus PDF oficiales (cuestionario de texto + hoja de lectura óptica escaneada) con el adaptador \`hoja-optica\`, a \`.cache/bancos/andalucia/salida/<tit>/preguntas.json\` junto con las de 2020–2026. **No se escriben en \`data/ejes/\`**: entran en la app en la fase F5.`, '');
  L.push('Ids con el esquema de Andalucía: `and-AAAA-cN-tNN` (teoría PER), `and-AAAA-cN-qNN` (carta PER), `and-py-AAAA-cN-gNN|nNN` (PY). Casos especiales:', '');
  L.push('- **1ª de 2018**: su página está en otra ruta (`…/investigacion-innovacion-deportiva/…`). El PY tuvo modelos A y B de cada módulo con **preguntas distintas** (no son permutaciones): el A es `and-py-2018-c1-…` y el B, una convocatoria aparte del banco, `and-py-2018-c1b-gNN|nNN` («1ª convocatoria 2018, PY modelo B» en config.json).');
  L.push('- **3ª de 2018**: solo PNB y PER (Cádiz y Sevilla); no hubo PY (`titulaciones: ["per"]` en config.json).');
  L.push('- **2015**: los cuadernillos no traen fecha y no se ha encontrado en fuente oficial: las preguntas van sin fecha (la etapa normativa las marca «revisar» con toda norma cuyo detector encaja; la etapa validar da un aviso «sin fecha» por pregunta). Las fechas del PY de 2018 (14-3, 12-6 y 23-11) son las de sus portadas, distintas de las del PER.');
  L.push('- Correcciones publicadas (ejes/andalucia/correcciones.json): todas las erratas y anulaciones de las páginas de 2015–2016 que recoge andalucia_anteriores.md (salvo las del PER reducido, que no se extrae) y la nota del Tribunal de 21-01-2019 de la 4ª de 2018 (leída por OCR del PDF escaneado: anula la 39 de A y B; da por buenas a+b en A11/B12 y c+d en A13/B14). En 2017, en la 1ª–3ª de 2018 y en 2019 las páginas no publican correcciones de PER ni de PY. La otra nota de la 4ª de 2018 («alegaciones contestadas») no se pudo descargar (el servidor no da Content-Length ni con peticiones por rangos).', '');

  L.push('## Resumen', '');
  L.push('| | PER | PY |', '|---|---|---|');
  const fila = (nombre, f) => L.push(`| ${nombre} | ${f(e.per)} | ${f(e.py)} |`);
  fila('Convocatorias', (x) => x.convocatorias.length);
  fila('Preguntas', (x) => x.preguntas);
  fila('Anuladas / con varias válidas', (x) => `${x.anuladas.length} / ${x.multiples.length}`);
  fila('Filas de hoja leídas', (x) => x.convocatorias.reduce((s, c) => s + c.apariciones, 0));
  fila('Modelos A y B con la misma respuesta', (x) => (x.modelos.pares ? `**${x.modelos.acuerdo}/${x.modelos.pares}** (${pct(x.modelos.acuerdo, x.modelos.pares)})` : '— (un solo modelo)'));
  fila('Repetidas en otra convocatoria con la misma respuesta', (x) => `${x.repeticiones.identicas.acuerdo + x.repeticiones.variantes.acuerdo}/${x.repeticiones.identicas.pares + x.repeticiones.variantes.pares} pares (${x.repeticiones.preguntas} preguntas)`);
  fila('Lecturas dudosas (2.ª/1.ª ≥ 0,35)', (x) => x.confianza.relacion['≥ 0,35 (dudosa)']);
  fila('Marcas por debajo de 1,5 × umbral', (x) => x.confianza.fuerza['< 1,5']);
  fila('Conflictos / dudas / errores de validación', (x) => `${x.conflictos.length} / ${x.dudas.length} / ${x.errores.length}`);
  L.push('');
  L.push(`**Confianza de la lectura óptica: alta.** En el PER cada pregunta se lee dos veces, en hojas escaneadas por separado (modelos A y B, con la letra traducida por el texto de la opción), y las ${e.per.modelos.pares} coinciden. En el PY (una sola hoja) no hay segunda lectura, pero ninguna fila es dudosa, la marca más débil queda a ${dec(e.py.confianza.peorFuerza[0]?.fuerza ?? 0)} veces el umbral de su hoja y las ${e.py.repeticiones.identicas.pares + e.py.repeticiones.variantes.pares} repeticiones en otras convocatorias (leídas en otras hojas, o tomadas del banco vivo de 2020–2026) dan la misma respuesta salvo variantes con el enunciado invertido a propósito. Cada fila «vacía» es una pregunta anulada y cada «múltiple», una con dos respuestas aceptadas por el Tribunal.`, '');

  for (const tit of ['per', 'py']) {
    const x = e[tit];
    const c = x.confianza;
    const tot = x.convocatorias.reduce((s, k) => { for (const [st, n] of Object.entries(k.estados)) s[st] = (s[st] ?? 0) + n; return s; }, {});
    L.push(`## ${tit.toUpperCase()}`, '');
    L.push(`- **${x.preguntas} preguntas** de ${x.convocatorias.length} convocatorias (${x.ids[0]} … ${x.ids[1]}); ${x.anuladas.length} anuladas, ${x.multiples.length} con varias respuestas aceptadas.`);
    L.push(`- Lectura óptica: ${Object.values(tot).reduce((s, n) => s + n, 0)} filas leídas: ${Object.entries(tot).map(([k, n]) => `${n} ${k}`).join(', ')}.${x.modelos.pares ? ` Modelos A y B: **${x.modelos.acuerdo}/${x.modelos.pares}** preguntas con la misma respuesta en las dos hojas (${pct(x.modelos.acuerdo, x.modelos.pares)}); son dos escaneos distintos y en ${x.modelos.otroNumero} el B pone la pregunta en otro número${x.modelos.barajadas ? ` (en ${x.modelos.barajadas} baraja además las opciones)` : ' (las opciones van en el mismo orden)'}, así que el acuerdo no es la misma fila leída dos veces.` : ' Un solo modelo por convocatoria: no hay segunda hoja con la que cruzar.'}`);
    L.push(`- Conflictos entre apariciones: ${x.conflictos.length}; lecturas dudosas o sin respuesta: ${x.dudas.length}; errores de validación: ${x.errores.length}; avisos de validación: ${x.avisos.length}${x.avisos.length && x.avisos.every((a) => /sin fecha/.test(a)) ? ' (todos «sin fecha», de 2015)' : ''}.`, '');
    L.push('| Convocatoria | Fecha | Preguntas | Apariciones | Anuladas | Varias válidas | Lecturas (estado) | A=B | Norma a revisar |', '|---|---|---|---|---|---|---|---|---|');
    for (const k of x.convocatorias) L.push(`| ${k.conv} | ${k.fecha ?? '—'} | ${k.preguntas} | ${k.apariciones} | ${k.anuladas} | ${k.multiples} | ${Object.entries(k.estados).map(([s, n]) => `${n} ${s}`).join(', ')} | ${k.pares ? `${k.acuerdo}/${k.pares}` : '—'} | ${k.revisar} |`);
    L.push('');

    L.push('### Confianza de la lectura óptica', '');
    L.push(`- Relación 2.ª burbuja / 1.ª en las ${c.leidas} filas con una marca (0 = marca limpia; «dudosa» desde 0,35): ${lista(c.relacion)}. Las de menos margen: ${c.peorRelacion.map((m) => `${m.ref} ${dec(m.relacion)}`).join('; ')}.`);
    L.push(`- Fuerza de la marca (1.ª burbuja / umbral de marca de su hoja; por debajo de 1 sería «vacía»): ${lista(c.fuerza)}; mediana ${c.fuerzaMediana != null ? dec(c.fuerzaMediana) : '—'}. Las más débiles: ${c.peorFuerza.map((m) => `${m.ref} ${dec(m.fuerza)}`).join('; ')}.`);
    if (c.vacias.length) L.push(`- Filas vacías: ${c.vacias.map((v) => `${v.ref} (máx. ${v.fuerza != null ? dec(v.fuerza) : '—'} × umbral; ${v.id} ${v.anulada ? 'anulada' : '**no anulada**'})`).join('; ')}.`);
    if (c.multiples.length) L.push(`- Filas con dos marcas: ${c.multiples.map((m) => `${m.ref} «${m.letras.join('')}» (${m.id}: aceptadas ${m.aceptadas.join('+') || '—'})`).join('; ')}.`);
    if (x.modelos.desacuerdos.length) L.push(`- Desacuerdos entre A y B: ${x.modelos.desacuerdos.map((d) => `${d.id} (A ${d.a}, B ${d.b})`).join('; ')}.`);
    L.push('');

    if (x.correcciones.length) {
      L.push('### Correcciones publicadas frente a la hoja', '');
      L.push('| Convocatoria | Modelo | Nº | Corrección | Pregunta | Hoja escaneada | Resultado en el banco |', '|---|---|---|---|---|---|---|');
      for (const k of x.correcciones) L.push(`| ${k.conv} | ${k.modelo ?? '—'} | ${k.numero} | ${k.accion}${k.letras.length ? ` ${k.letras.join('+')}` : ''} | ${k.id ?? '—'} | ${k.veredicto} | ${k.final ?? '—'} |`);
      L.push('');
    }

    const r = x.repeticiones;
    L.push('### Cruce con las repeticiones en otras convocatorias', '');
    L.push(`Preguntas de 2015–2019 que reaparecen en otra convocatoria de 2015–2026 (mismas opciones y enunciado con Jaccard ≥ 0,90): ${r.preguntas}. Idénticas: ${r.identicas.acuerdo}/${r.identicas.pares} pares con la misma respuesta (por el texto de la opción). Variantes (alguna palabra distinta): ${r.variantes.acuerdo}/${r.variantes.pares}.`, '');
    if (r.distintas.length) {
      L.push('| Par | Tipo | Respuestas | Diferencia en el enunciado | Revisión |', '|---|---|---|---|---|');
      for (const d of r.distintas) L.push(`| ${d.a} / ${d.b} | ${d.tipo === 'identicas' ? 'idéntica' : 'variante'} | ${d.ra} / ${d.rb} | «${d.dif[0]}» / «${d.dif[1]}» | ${d.veredicto} |`);
      L.push('');
    }

    if (x.ambiguas.length || x.emparejadas.length) {
      L.push('### Emparejamiento de los modelos A y B', '');
      for (const m of x.emparejadas) {
        const [da, db] = diferenciaEnunciados(m.enunciadoA, m.enunciadoB);
        L.push(`- Emparejadas por posición (texto casi igual, sim. ${dec(m.similitud)}): ${m.a} ↔ ${m.b}. ${da || db ? `Enunciado: «${da}» / «${db}».` : 'Mismo enunciado; una opción cambia alguna palabra (errata de uno de los modelos).'}`);
      }
      for (const m of x.ambiguas) L.push(`- No unidas (ambiguas, sim. ${dec(m.similitud)}): ${m.a} / ${m.b} — «${diferenciaEnunciados(m.enunciadoA, m.enunciadoB).join('» / «')}»: son dos preguntas distintas.`);
      L.push('');
    }

    if (x.atipicas.length) {
      L.push('### Tema dudoso (clasificar)', '');
      L.push(`El tema sale de la posición en el cuadernillo; estas suman palabras clave de otro tema. No se cambian: se revisan en la fase F5. ${x.atipicas.map((a) => `${a.id} (UT ${a.ut} → ${a.sugerido.join(', ')})`).join('; ')}.`, '');
    }

    if (x.anuladas.length || x.multiples.length) {
      L.push('### Anuladas y con varias respuestas', '');
      for (const a of x.anuladas) L.push(`- ${a.id}: anulada${a.notas?.length ? ` — ${a.notas.join(' ').replace(/\s*\[https?:[^\]]+\]/g, '').slice(0, 160)}` : ' (fila en blanco en la hoja)'}`);
      for (const m of x.multiples) L.push(`- ${m.id}: aceptadas ${m.aceptadas.join(' y ')}`);
      L.push('');
    }
    if (x.dudas.length) L.push('### Lecturas dudosas', '', ...x.dudas.map((d) => `- ${d.id}: ${d.motivo} (${d.detalle.join('; ')})`), '');
  }
  L.push('## Arreglos del proceso necesarios para 2015–2019', '');
  L.push('- **Texto en columnas (2015)**: pdftotext en modo normal separa las letras «a) b) c) d)» de sus textos. El adaptador lee en modo normal y, si no salen las n preguntas con sus cuatro opciones, prueba `-raw` y `-layout` y se queda la mejor lectura (2015: `-raw` en 11 de los 12 cuadernillos).');
  L.push('- **Cabecera de página de 2015** (códigos de certificación «ER-…/2011», «CÓDIGO nnnnnnnn» y el nombre del centro que maquetó los cuadernillos, con las letras separadas en `-raw`): ruido.');
  L.push('- **Escaneos girados**: un giro del 1,5 % desplaza medio paso de fila el bloque 1–25 respecto de las marcas de sincronismo (antes del arreglo: PER 1/2017 con 12 respuestas distintas entre las hojas A y B y 17 lecturas dudosas; PER 3/2015 con 26 y 22). `hoja_optica.py` mide el giro en las marcas, predice el desfase de cada bloque y lo afina con la plantilla impresa; también corrige la deriva horizontal de las columnas.');
  L.push('- **Hoja de 2015–2016 (otro impresor, casillas rectangulares) y lápiz claro**: el lápiz se busca como gris (oscuro y sin color), sin confundirlo con los números impresos en magenta oscuro, y el paso de burbuja se busca entre el 92 % y el 102 % del nominal (PY 2/2015: el peine se corría sobre los números y salían 10 filas en blanco).');
  L.push('- **Umbral de cada hoja en la salida**: el adaptador guarda en cada lectura el umbral de marca de su hoja (`respuesta.umbral`) para medir la fuerza de cada marca en este informe.');
  L.push('- Tras los arreglos, la prueba de oro de 2020–2026 sigue en el 100 % (informes/andalucia-oro.md).', '');
  L.push('## Pendiente', '');
  L.push('- Fecha de las tres convocatorias de 2015 (sin fecha en cuadernillos ni páginas): hasta tenerla, la etapa normativa marca sus preguntas con toda norma cuyo detector encaja.');
  L.push('- Nota de «alegaciones contestadas» de la 4ª de 2018: no descargable; si se consigue, comprobar que no cambia más respuestas.');
  L.push('- Entrada en la app (fase F5): revisar las preguntas «norma a revisar» de la tabla y las de tema dudoso antes de pasar estas convocatorias a `data/ejes/andalucia/`.', '');
  return `${L.join('\n')}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const e = estadisticas();
  escribirTexto(join(BANCOS, 'informes', 'andalucia-2015-2019.md'), informe(e));
  for (const t of ['per', 'py']) console.log(t, e[t].preguntas, 'preguntas', e[t].convocatorias.length, 'convocatorias', e[t].conflictos.length, 'conflictos', e[t].dudas.length, 'dudas', 'A=B', `${e[t].modelos.acuerdo}/${e[t].modelos.pares}`, 'repeticiones', JSON.stringify(e[t].repeticiones.identicas), JSON.stringify(e[t].repeticiones.variantes), e[t].repeticiones.distintas.length, 'distintas');
}
