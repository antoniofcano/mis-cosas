// Práctica de cada clase para un eje nuevo: a qué clases del curso nacional (data/curso/<tit>.json) pertenece cada
// pregunta del banco del eje, usando la práctica del eje de referencia (Andalucía) como guía.
//   node tools/bancos/practica.mjs <eje> [--escribir]   → propone data/ejes/<eje>/<tit>/practica.json (con --escribir, lo
//                                                         escribe) e imprime el informe por clase.
// Para cada pregunta (que se pueda estudiar: ni anulada, ni retirada, ni de una convocatoria reservada para el examen
// final) y cada clase de su tema se suma:
//   - concepto: si la pregunta de referencia cuya explicación se adaptó (q.concepto) está en la práctica de la clase;
//   - vecinas: el parecido de las 5 preguntas de referencia más parecidas del mismo tema que están en la práctica de la
//     clase (las que el profe ya colocó allí);
//   - cobertura: qué parte de las palabras clave del enunciado y de la respuesta salen en la clase (las del motor,
//     src/course/engine.js), pesando más las propias de la clase dentro de su tema (las que salen en pocas clases).
// Cada pregunta va a su mejor clase (y a la segunda si puntúa casi igual y la clase la cubre). Después, a cada clase con
// menos preguntas que su homóloga de referencia se le añaden las que mejor cubre de entre las de su tema, siempre que la
// clase las explique (cubierta) o sea su segunda mejor clase. Las de carta van por el tipo de ejercicio de su solución
// programada, y las resueltas de cada clase de carta forman su resueltos.json.
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parecido } from '../../src/bancos/equivalentes.js';
import { cubierta, palabrasClave, textoDePaso } from '../../src/course/engine.js';
import { SOLUCIONES } from '../../src/bancos/soluciones.js';
import { TITULACIONES } from '../../src/theory/blocks.js';
import { RAIZ, escribirTexto, leerJSON } from './lib/comun.mjs';

const REFERENCIA = 'andalucia';

/** Texto de una clase: título, objetivos, pasos, chuleta y términos. */
export function textoClase(l) {
  return [l.titulo, ...(l.objetivos ?? []), ...(l.pasos ?? []).map(textoDePaso), JSON.stringify(l.chuleta ?? ''), ...(l.terminos ?? []).map((t) => (typeof t === 'string' ? t : `${t.termino ?? ''} ${t.definicion ?? ''}`))].join(' ');
}

/** Reglas y anexos citados: «Regla 18», «regla 24.a.i», «Anexo IV» → ['r18', 'aIV']. */
export const reglas = (t) => [...String(t).matchAll(/\breglas?\s+(\d{1,2})/gi)].map((m) => `r${Number(m[1])}`)
  .concat([...String(t).matchAll(/\banexo\s+(I{1,3}V?|IV|V)\b/gi)].map((m) => `a${m[1].toUpperCase()}`));
const cuenta = (xs) => xs.reduce((m, x) => m.set(x, (m.get(x) ?? 0) + 1), new Map());

const cobertura = (q, visto) => {
  const v = new Set(palabrasClave(visto));
  const ws = [...palabrasClave(q.enunciado), ...palabrasClave(q.opciones?.[q.correcta] ?? '')];
  return ws.length ? ws.filter((w) => v.has(w)).length / ws.length : 0;
};

/**
 * Clases de carta por tipo de ejercicio, de los resueltos de referencia ({ leccion: { ejercicios } | { ids } }): las
 * que lo nombran en `ejercicios`, las que listan preguntas resueltas de ese tipo en `ids` y las que las llevan en su
 * práctica. Ordenadas de más a menos preguntas de ese tipo.
 */
function clasesPorEjercicio(resueltos, preguntasRef, practicaRef) {
  const cuenta = new Map(); // ejercicio → Map(leccion → n)
  const suma = (e, l, n) => { if (!cuenta.has(e)) cuenta.set(e, new Map()); cuenta.get(e).set(l, (cuenta.get(e).get(l) ?? 0) + n); };
  // También las de carta resueltas que la referencia pone en la práctica de cada clase.
  for (const [l, ids] of Object.entries(practicaRef)) for (const id of ids) if (SOLUCIONES[id]?.ejercicio) suma(SOLUCIONES[id].ejercicio, l, 1);
  for (const [l, r] of Object.entries(resueltos)) {
    if (r.ids) { for (const id of r.ids) if (SOLUCIONES[id]?.ejercicio) suma(SOLUCIONES[id].ejercicio, l, 1); continue; }
    for (const e of r.ejercicios ?? []) {
      const n = preguntasRef.filter((q) => SOLUCIONES[q.id]?.ejercicio === e && !(r.excepto ?? []).includes(q.id)).length;
      suma(e, l, Math.max(1, n));
    }
  }
  // Solo las clases con al menos la mitad de las preguntas de ese tipo que la que más tiene (las demás son casos sueltos).
  return new Map([...cuenta].map(([e, m]) => {
    const orden = [...m].sort((a, b) => b[1] - a[1]);
    return [e, orden.filter(([, n]) => n >= orden[0][1] / 2).map(([l]) => l)];
  }));
}

export function proponer(eje, tit) {
  const ficha = leerJSON(join(RAIZ, 'data', 'ejes', eje, 'eje.json'));
  const curso = leerJSON(join(RAIZ, 'data', 'curso', `${tit}.json`));
  const qs = leerJSON(join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json')).preguntas;
  const ref = leerJSON(join(RAIZ, 'data', 'ejes', REFERENCIA, tit, 'preguntas.json')).preguntas;
  const practicaRef = leerJSON(join(RAIZ, 'data', 'ejes', REFERENCIA, tit, 'practica.json'));
  const resueltosRef = leerJSON(join(RAIZ, 'data', 'ejes', REFERENCIA, tit, 'resueltos.json'), {});
  const reservadas = new Set(ficha.reserva?.[tit] ?? []);
  const estudiable = (q) => !q.anulada && q.correcta && q.norma?.estado !== 'retirada' && !(q.apareceEn ?? []).some((a) => reservadas.has(a.conv)) && !reservadas.has(q.conv);
  const clasesDeRef = new Map();
  for (const [l, ids] of Object.entries(practicaRef)) for (const id of ids) { if (!clasesDeRef.has(id)) clasesDeRef.set(id, new Set()); clasesDeRef.get(id).add(l); }
  const lecciones = curso.modulos.flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: m.ut, texto: textoClase(l) })));
  const porUt = new Map();
  for (const l of lecciones) { if (!porUt.has(l.ut)) porUt.set(l.ut, []); porUt.get(l.ut).push(l); }
  const porEjercicio = clasesPorEjercicio(resueltosRef, ref, practicaRef);
  const refPorUt = new Map();
  for (const r of ref) { if (!refPorUt.has(r.ut)) refPorUt.set(r.ut, []); refPorUt.get(r.ut).push(r); }

  // Palabras propias de cada clase dentro de su tema: pesan más las que salen en pocas clases del tema (idf).
  const idf = new Map();
  for (const [ut, ls] of porUt) {
    const df = new Map();
    for (const l of ls) { l.claves = new Set(palabrasClave(l.texto)); for (const w of l.claves) df.set(w, (df.get(w) ?? 0) + 1); }
    idf.set(ut, (w) => Math.log((ls.length + 1) / ((df.get(w) ?? 0) + 0.5)));
  }
  const propia = (q, l) => {
    const ws = [...new Set([...palabrasClave(q.enunciado), ...palabrasClave(q.opciones?.[q.correcta] ?? '')])];
    const peso = idf.get(l.ut);
    const total = ws.reduce((s, w) => s + peso(w), 0);
    return total ? ws.filter((w) => l.claves.has(w)).reduce((s, w) => s + peso(w), 0) / total : 0;
  };
  for (const l of lecciones) l.reglas = cuenta(reglas(l.texto));
  const cartaUt = TITULACIONES[tit].cartaUt;
  const puntos = new Map(); // id → [{ l, p }] ordenado
  for (const q of qs.filter(estudiable)) {
    // Las de la unidad de carta que no se hacen sobre la carta (mareas, estima analítica) pueden ir también a las clases
    // de la teoría de navegación (la unidad anterior).
    const deCartaSinCarta = q.ut === cartaUt && !q.requiere.includes('carta');
    const ls = [...(porUt.get(q.ut) ?? []), ...(deCartaSinCarta ? porUt.get(cartaUt - 1) ?? [] : [])];
    const vecinas = [...(refPorUt.get(q.ut) ?? []), ...(deCartaSinCarta ? refPorUt.get(cartaUt - 1) ?? [] : [])]
      .map((r) => ({ r, s: parecido(q, r) })).sort((a, b) => b.s - a.s).slice(0, 5);
    // Tipo de ejercicio: el de su solución o, si no la tiene, el de la pregunta de referencia más parecida que la tenga.
    const vecinaResuelta = vecinas.find((v) => v.s >= 0.3 && SOLUCIONES[v.r.id]?.ejercicio);
    const ej = SOLUCIONES[q.id]?.ejercicio ?? (q.ut === cartaUt ? SOLUCIONES[vecinaResuelta?.r.id]?.ejercicio : undefined);
    // Las preguntas que citan una regla o un anexo (RIPA) van a la clase que más la cita.
    const reglasQ = [...new Set(reglas(`${q.enunciado} ${Object.values(q.opciones).join(' ')}`))];
    const citas = (l) => reglasQ.reduce((n, r) => n + (l.reglas.get(r) ?? 0), 0);
    const maxCitas = Math.max(0, ...ls.map(citas));
    // Las de carta resueltas por la app van solo a las clases de su tipo de ejercicio.
    const deSuTipo = ej && porEjercicio.get(ej)?.length ? new Set(porEjercicio.get(ej)) : null;
    const p = ls.filter((l) => !deSuTipo || deSuTipo.has(l.id)).map((l) => {
      let s = 0;
      if (maxCitas) s += 2 * citas(l) / maxCitas;
      // Las de marea con anuario, a la clase de mareas.
      if (q.requiere.includes('anuario') && /marea/i.test(l.titulo)) s += 3;
      if (q.concepto && clasesDeRef.get(q.concepto)?.has(l.id)) s += 1.5;
      for (const v of vecinas) if (clasesDeRef.get(v.r.id)?.has(l.id)) s += v.s;
      s += 0.5 * cobertura(q, l.texto) + 1.5 * propia(q, l);
      if (deSuTipo) s += 2 / (1 + porEjercicio.get(ej).indexOf(l.id)); // la clase con más preguntas de su tipo, primero
      return { l, p: s, cubre: cubierta(q, l.texto) };
    }).sort((a, b) => b.p - a.p);
    puntos.set(q.id, { q, p });
  }
  const practica = Object.fromEntries(lecciones.map((l) => [l.id, []]));
  for (const { q, p } of puntos.values()) {
    if (!p.length) continue;
    practica[p[0].l.id].push(q.id);
    if (p[1] && p[1].p >= 0.9 * p[0].p && p[1].cubre) practica[p[1].l.id].push(q.id);
  }
  // Mínimo: tantas como la clase homóloga de referencia (si el tema da para ello y la clase las explica).
  const faltan = {};
  const veces = new Map();
  for (const ids of Object.values(practica)) for (const id of ids) veces.set(id, (veces.get(id) ?? 0) + 1);
  for (const l of lecciones) {
    const minimo = (practicaRef[l.id] ?? []).length;
    if (practica[l.id].length >= minimo) continue;
    const ya = new Set(practica[l.id]);
    // Candidatas: las que la clase explica (cubierta) o para las que es su segunda mejor clase del tema.
    const extra = [...puntos.values()]
      .map(({ q, p }) => ({ q, x: p.find((y) => y.l.id === l.id), rango: p.findIndex((y) => y.l.id === l.id) }))
      // Como mucho en dos clases, y solo en una de sus tres mejores.
      .filter(({ q, x, rango }) => x && rango <= 2 && (x.cubre || rango === 1) && !ya.has(q.id) && (veces.get(q.id) ?? 0) < 2)
      .sort((a, b) => b.x.p - a.x.p)
      .slice(0, minimo - practica[l.id].length);
    practica[l.id].push(...extra.map(({ q }) => q.id));
    for (const { q } of extra) veces.set(q.id, (veces.get(q.id) ?? 0) + 1);
    if (practica[l.id].length < minimo) faltan[l.id] = { tiene: practica[l.id].length, referencia: minimo };
  }
  // En el orden del banco.
  const orden = new Map(qs.map((q, i) => [q.id, i]));
  for (const l of Object.keys(practica)) practica[l] = [...new Set(practica[l])].sort((a, b) => orden.get(a) - orden.get(b));
  // Resueltos: en cada clase de la unidad de carta, sus preguntas de práctica que la app resuelve (lista exacta).
  const resueltos = {};
  for (const l of lecciones.filter((x) => x.ut === cartaUt)) {
    const ids = practica[l.id].filter((id) => SOLUCIONES[id]);
    if (ids.length) resueltos[l.id] = { ids };
  }
  const estudio = qs.filter(estudiable);
  const porTema = (xs) => xs.reduce((m, q) => m.set(q.ut, (m.get(q.ut) ?? 0) + 1), new Map());
  return {
    practica, resueltos, faltan, estudio: estudio.length, referencia: ref.length, temas: { eje: porTema(estudio), referencia: porTema(ref) },
    lecciones: lecciones.map((l) => ({ id: l.id, ut: l.ut, titulo: l.titulo, n: practica[l.id].length, referencia: (practicaRef[l.id] ?? []).length })),
  };
}

export const textoPractica = (p) => `{\n${Object.entries(p).map(([l, ids]) => `${JSON.stringify(l)}:${JSON.stringify(ids)}`).join(',\n')}\n}\n`;

/** Informe de la práctica (tools/bancos/informes/<eje>-practica.md): preguntas por clase frente a la referencia y por
 * qué no llegan las que no llegan. */
export function informePractica(eje, porTit) {
  const l = [`# Práctica por clase · ${eje}`, '', `Generado por \`node tools/bancos/practica.mjs ${eje} --escribir\`. Referencia: la práctica de ${REFERENCIA}.`,
    'Solo entran preguntas de estudio (ni anuladas, ni retiradas, ni de convocatorias reservadas para el examen final).', ''];
  for (const [tit, r] of Object.entries(porTit)) {
    const cortas = r.lecciones.filter((x) => r.faltan[x.id]);
    l.push(`## ${tit.toUpperCase()}`, '', `Preguntas de estudio: ${r.estudio} (referencia: ${r.referencia}). Por tema: ${[...r.temas.eje].sort((a, b) => a[0] - b[0]).map(([ut, n]) => `UT${ut} ${n} (ref ${r.temas.referencia.get(ut) ?? 0})`).join(' · ')}.`, '');
    if (cortas.length) {
      l.push(`${cortas.length} clases no llegan a las preguntas de su homóloga: el tema no tiene tantas preguntas de estudio que la clase explique `
        + '(el banco de este eje es más pequeño en ese tema, o sus preguntas tratan sobre todo lo de otras clases). Se dejan con las que le corresponden de verdad, sin rellenar con preguntas de otras clases.', '');
    }
    l.push('| Clase | Preguntas | Referencia | |', '|---|---:|---:|---|');
    for (const x of r.lecciones) l.push(`| ${x.id} ${x.titulo} | ${x.n} | ${x.referencia} | ${r.faltan[x.id] ? 'no llega' : ''} |`);
    l.push('');
  }
  return l.join('\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [eje, opcion] = process.argv.slice(2);
  const ficha = leerJSON(join(RAIZ, 'data', 'ejes', eje, 'eje.json'));
  const porTit = {};
  for (const tit of Object.keys(ficha.examen)) {
    const r = proponer(eje, tit);
    porTit[tit] = r;
    for (const l of r.lecciones) console.log(`${l.id.padEnd(10)} ${String(l.n).padStart(3)} (ref ${String(l.referencia).padStart(2)})${r.faltan[l.id] ? '  ← faltan' : ''}  ${l.titulo}`);
    if (opcion === '--escribir') {
      escribirTexto(join(RAIZ, 'data', 'ejes', eje, tit, 'practica.json'), textoPractica(r.practica));
      if (Object.keys(r.resueltos).length) escribirTexto(join(RAIZ, 'data', 'ejes', eje, tit, 'resueltos.json'), `${JSON.stringify(r.resueltos, null, 1)}\n`);
    }
  }
  if (opcion === '--escribir') escribirTexto(join(RAIZ, 'tools', 'bancos', 'informes', `${eje}-practica.md`), informePractica(eje, porTit));
}
