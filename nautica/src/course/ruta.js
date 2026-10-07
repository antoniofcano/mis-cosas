// Ruta del curso: en qué orden se dan las clases. Funciones puras: el curso y el progreso entran como datos.
//
// - Cada clase declara en sus datos `requiere`: las clases del MISMO curso en las que se apoya (no las del PER, que van
//   en `refresco`, ni el apéndice de matemáticas, que va en `usadoEn`).
// - La ruta por defecto de cada titulación está en data/curso/ruta-<tit>.json (la genera tools/ruta.mjs a partir de
//   `requiere` y un ritmo, y después se retoca a mano): una lista de «tramos de ruta» que intercalan temas, para no
//   pasar semanas con un mismo tema. Se adjunta al curso al cargarlo (`curso.ruta`).
// - Hoy, el plan con fecha y el calendario siguen la ruta; Temario sigue agrupado por temas.
// - Una configuración del profesor (course/config-profe.js) puede cambiar `curso.ruta` para quien la importe.

import { estadoLeccion } from './engine.js';
import { posEstudio } from '../theory/blocks.js';

/** Clases de un curso, con su tema y su módulo (en el orden de los módulos). */
const todas = (curso) => (curso?.modulos ?? []).flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: l.ut ?? m.ut, modulo: m.titulo })));

/** Ids de una ruta, venga como tramos ({ ut, lecciones: [ids] }) o como lista plana de ids. */
export function idsRuta(ruta) {
  if (!Array.isArray(ruta)) return [];
  return ruta.flatMap((t) => (typeof t === 'string' ? [t] : Array.isArray(t?.lecciones) ? t.lecciones.filter((x) => typeof x === 'string') : []));
}

/**
 * Las clases del curso en el orden de la ruta (`curso.ruta`). Las que la ruta no nombra (una clase nueva que aún no
 * está en ella) van al final, por tema en el orden de estudio; los ids que no existen se ignoran; un id repetido cuenta
 * la primera vez. Sin ruta, el orden de estudio de los temas (el de antes de que hubiera ruta).
 */
export function ordenRuta(curso, estructura = null) {
  const ls = todas(curso);
  const porId = new Map(ls.map((l) => [l.id, l]));
  const vistos = new Set();
  const out = [];
  for (const id of idsRuta(curso?.ruta)) {
    if (!porId.has(id) || vistos.has(id)) continue;
    vistos.add(id);
    out.push(porId.get(id));
  }
  const resto = ls.filter((l) => !vistos.has(l.id));
  if (estructura) resto.sort((a, b) => posEstudio(estructura, a.ut) - posEstudio(estructura, b.ut)); // estable: dentro del tema, su orden
  return [...out, ...resto];
}

/** Agrupa una lista de clases en tramos: clases seguidas del mismo tema. → [{ ut, lecciones: [clase…] }] */
export function tramosDe(lecciones) {
  const out = [];
  for (const l of lecciones) {
    const ult = out.at(-1);
    if (ult && ult.ut === l.ut) ult.lecciones.push(l);
    else out.push({ ut: l.ut, lecciones: [l] });
  }
  return out;
}

/**
 * Los pasos del camino en el orden de la ruta: cada clase y, justo después de la última clase de un tema, sus tandas de
 * preguntas («ya has visto todo el tema: ahora, preguntas de examen»). Las tandas de un tema sin clases van antes de
 * la primera clase de un tema que le sigue en el orden de estudio (sin ruta, es el orden de antes: tema a tema).
 * → [{ tipo: 'clase', l, ut } | { tipo: 'tandas', ut }]
 */
export function pasosRuta(estructura, curso) {
  const ls = ordenRuta(curso, estructura);
  const ultima = new Map(ls.map((l) => [l.ut, l.id]));
  const pos = (ut) => posEstudio(estructura, ut);
  const sinClases = [...estructura.bloques].filter((b) => !ultima.has(b.ut)).map((b) => b.ut).sort((a, b) => pos(a) - pos(b));
  const out = [];
  for (const l of ls) {
    while (sinClases.length && pos(sinClases[0]) < pos(l.ut)) out.push({ tipo: 'tandas', ut: sinClases.shift() });
    out.push({ tipo: 'clase', l, ut: l.ut });
    if (ultima.get(l.ut) === l.id) out.push({ tipo: 'tandas', ut: l.ut });
  }
  for (const ut of sinClases) out.push({ tipo: 'tandas', ut });
  return out;
}

const terminada = (e) => e !== 'nueva' && e !== 'empezada';

/** Las clases en las que se apoya `l` (las de su `requiere` que existen en el curso). */
export function requisitos(l, curso) {
  const porId = new Map(todas(curso).map((x) => [x.id, x]));
  return (l?.requiere ?? []).map((id) => porId.get(id)).filter(Boolean);
}

/** Las clases en las que se apoya `l` que el alumno aún no ha terminado (para el aviso «Esta clase se apoya en…»). */
export function requisitosPendientes(l, curso, regs = {}, respuestas = {}, ahora = Date.now()) {
  return requisitos(l, curso).filter((x) => !terminada(estadoLeccion(x, regs[x.id], respuestas, ahora).estado));
}

/**
 * Comprueba el grafo de `requiere` de un curso: ids que existen, del mismo curso, sin repetir y sin ciclos.
 * → lista de problemas (vacía si todo cuadra).
 */
export function problemasGrafo(curso) {
  const ls = todas(curso);
  const porId = new Map(ls.map((l) => [l.id, l]));
  const mal = [];
  for (const l of ls) {
    const req = l.requiere ?? [];
    if (!Array.isArray(req)) { mal.push(`${l.id}: «requiere» no es una lista`); continue; }
    if (new Set(req).size !== req.length) mal.push(`${l.id}: «requiere» repite una clase`);
    for (const id of req) {
      if (id === l.id) mal.push(`${l.id}: se requiere a sí misma`);
      else if (!porId.has(id)) mal.push(`${l.id}: requiere ${id}, que no existe en este curso`);
    }
  }
  // Ciclos: recorrido en profundidad con colores.
  const color = new Map();
  const visita = (id, camino) => {
    color.set(id, 1);
    for (const r of porId.get(id)?.requiere ?? []) {
      if (!porId.has(r)) continue;
      if (color.get(r) === 1) { mal.push(`ciclo: ${[...camino, id, r].join(' → ')}`); continue; }
      if (!color.get(r)) visita(r, [...camino, id]);
    }
    color.set(id, 2);
  };
  for (const l of ls) if (!color.get(l.id)) visita(l.id, []);
  return mal;
}

/**
 * Clases de un orden (lista de ids) que van antes de alguna de las que requieren.
 * → [{ id, faltan: [ids que tendrían que ir antes] }] (vacía si el orden respeta `requiere`)
 */
export function violacionesRuta(ids, curso) {
  const porId = new Map(todas(curso).map((l) => [l.id, l]));
  const pos = new Map(ids.map((id, i) => [id, i]));
  const out = [];
  ids.forEach((id, i) => {
    const faltan = (porId.get(id)?.requiere ?? []).filter((r) => porId.has(r) && !(pos.get(r) < i));
    if (faltan.length) out.push({ id, faltan });
  });
  return out;
}

/** La siguiente clase de la ruta para el alumno: la primera a medias o, si no hay, la primera sin empezar (o null). */
export function siguienteEnRuta(estructura, curso, regs = {}, respuestas = {}, ahora = Date.now()) {
  const ls = ordenRuta(curso, estructura).map((l) => ({ l, e: estadoLeccion(l, regs[l.id], respuestas, ahora).estado }));
  return (ls.find((x) => x.e === 'empezada') ?? ls.find((x) => x.e === 'nueva'))?.l ?? null;
}

/**
 * Genera una ruta que intercala temas respetando `requiere` (lo usa tools/ruta.mjs; el resultado se retoca a mano).
 * Se van abriendo los temas en el orden de estudio, `ventana` a la vez; en cada turno se elige el tema abierto que
 * menos turnos lleva (ponderado por `pesos[ut]`, por defecto 1; a igualdad, el primero en el orden de estudio), nunca
 * el mismo del turno anterior si hay otro que pueda seguir, y se toman sus siguientes clases, hasta `ritmo`, mientras tengan lo que
 * requieren ya dado. Si al tema le quedaría una sola clase suelta, se suma al tramo.
 * @returns {{ ut: number, lecciones: string[] }[]}
 */
export function generarRuta(curso, estructura, { ritmo = 3, ventana = 2, pesos = {} } = {}) {
  const orden = [...estructura.bloques].sort((a, b) => posEstudio(estructura, a.ut) - posEstudio(estructura, b.ut)).map((b) => b.ut);
  const colas = new Map(orden.map((ut) => [ut, todas(curso).filter((l) => l.ut === ut)]));
  const porAbrir = orden.filter((ut) => colas.get(ut).length);
  const abiertos = [];
  const turnos = new Map();
  const dadas = new Set();
  const tramos = [];
  // Un tema que se abre tarde empieza con los turnos del que menos lleva: así no acapara los turnos siguientes.
  const abre = (ut) => {
    turnos.set(ut, abiertos.length ? Math.min(...abiertos.map((x) => (turnos.get(x) ?? 0) / (pesos[x] ?? 1))) * (pesos[ut] ?? 1) : 0);
    abiertos.push(ut);
  };
  const rellena = () => { while (abiertos.length < ventana && porAbrir.length) abre(porAbrir.shift()); };
  const puede = (l, extra) => (l.requiere ?? []).every((r) => dadas.has(r) || extra.includes(r));
  const toma = (ut) => {
    const cola = colas.get(ut);
    const out = [];
    for (const l of cola) {
      if (out.length >= ritmo || !puede(l, out.map((x) => x.id))) break;
      out.push(l);
    }
    const resto = cola.slice(out.length);
    if (out.length && resto.length === 1 && puede(resto[0], out.map((x) => x.id))) out.push(resto[0]);
    return out;
  };
  rellena();
  while (abiertos.length) {
    const ultimo = tramos.at(-1)?.ut;
    const candidatos = [...abiertos].sort((a, b) => ((a === ultimo) - (b === ultimo))
      || ((turnos.get(a) ?? 0) / (pesos[a] ?? 1) - (turnos.get(b) ?? 0) / (pesos[b] ?? 1)) || (orden.indexOf(a) - orden.indexOf(b)));
    let elegido = null;
    let clases = [];
    for (const ut of candidatos) { clases = toma(ut); if (clases.length) { elegido = ut; break; } }
    if (!elegido) {
      // Ningún tema abierto puede seguir (le falta algo de otro tema aún cerrado): se abre el siguiente.
      if (!porAbrir.length) throw new Error(`No se puede seguir la ruta: ${abiertos.map((ut) => colas.get(ut)[0]?.id).join(', ')} requieren clases que no llegan`);
      abre(porAbrir.shift());
      continue;
    }
    for (const l of clases) dadas.add(l.id);
    colas.set(elegido, colas.get(elegido).slice(clases.length));
    turnos.set(elegido, (turnos.get(elegido) ?? 0) + 1);
    if (ultimo === elegido) tramos.at(-1).lecciones.push(...clases.map((l) => l.id));
    else tramos.push({ ut: elegido, lecciones: clases.map((l) => l.id) });
    if (!colas.get(elegido).length) abiertos.splice(abiertos.indexOf(elegido), 1);
    rellena();
  }
  return tramos;
}
