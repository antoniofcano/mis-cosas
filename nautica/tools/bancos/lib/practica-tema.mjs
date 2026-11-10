// La práctica de una clase solo lleva preguntas de SU tema (docs/BANCOS.md, «Práctica y tema»). El tema de una pregunta
// (`ut`) es el bloque del examen oficial en que salió; la clase es nuestra. Si estudiando una clase de Nomenclatura sale
// una pregunta del bloque de Seguridad, el alumno la ve fuera de sitio: eso es un error nuestro de clasificación.
//
// Este módulo lo usan los generadores de la práctica (tools/bancos/practica.mjs y tools/bancos/ejes/baleares/practica.mjs),
// la herramienta que recoloca la práctica ya escrita (tools/bancos/practica-tema.mjs) y tests/practica-tema.test.js.
//
//   recolocar(ctx, practica)  → { practica, movimientos }: cada pregunta que está en una clase de otro tema sale de ella
//                               y va a una clase de su tema, elegida así:
//       ya-en-su-tema  ya estaba además en una clase de su tema: solo se quita de la otra;
//       idea           una clase de su tema donde se enseña su idea (campo `clases` del concepto en el catálogo, la
//                      principal y luego la secundaria); con varias, la que ya tiene más preguntas de esa idea;
//       hermanas       la clase de su tema donde ya están otras preguntas de su misma idea principal (al menos 3 y
//                      la mitad de las que tienen clase en el tema);
//       parecido       la clase de su tema cuyas preguntas más se le parecen (las 5 más parecidas entre las ya
//                      asignadas a clases de su tema votan con su parecido), si la más parecida llega a MIN_PARECIDO;
//       sin-clase      ninguna clase de su tema la explica: sale de la práctica de las clases y se queda solo en el tema
//                      (sigue saliendo en las tandas por tema, el repaso y los exámenes).
//   Excepciones (tools/bancos/practica-excepciones.json): preguntas cuyo TEMA es lo dudoso (su idea vive entera en el
//   otro tema: el tribunal la puso en un bloque que no es el de su contenido). No se fuerzan a una clase que no las
//   explica: se quedan donde están, listadas una a una con su motivo, hasta que el dueño decida su tema.
import { join } from 'node:path';
import { parecido } from '../../../src/bancos/equivalentes.js';
import { RAIZ, leerJSON } from './comun.mjs';

export const MIN_PARECIDO = 0.3; // parecido mínimo de la vecina más parecida para fiarse del criterio «parecido»
export const RUTA_EXCEPCIONES = join(RAIZ, 'tools', 'bancos', 'practica-excepciones.json');

/** Excepciones de un eje y una titulación: { id: { clase, motivo } }. */
export function excepcionesDe(eje, tit) {
  return leerJSON(RUTA_EXCEPCIONES, {})[eje]?.[tit] ?? {};
}

/** Tema de cada clase del curso de una titulación: Map id → ut (en el orden del curso). */
export function temasDeClases(tit) {
  const curso = leerJSON(join(RAIZ, 'data', 'curso', `${tit}.json`));
  return new Map(curso.modulos.flatMap((m) => m.lecciones.map((l) => [l.id, l.ut ?? m.ut])));
}

/** Catálogo de conceptos: Map id → concepto. */
export function catalogoConceptos() {
  const m = new Map();
  for (const g of leerJSON(join(RAIZ, 'data', 'conceptos', 'index.json'), { grupos: [] }).grupos ?? []) {
    for (const c of leerJSON(join(RAIZ, 'data', 'conceptos', `${g}.json`), { conceptos: [] }).conceptos ?? []) m.set(c.id, c);
  }
  return m;
}

/** Lo que hace falta para recolocar la práctica de un eje y una titulación. */
export function contexto(eje, tit) {
  const qs = leerJSON(join(RAIZ, 'data', 'ejes', eje, tit, 'preguntas.json')).preguntas;
  return {
    eje, tit, qs, porId: new Map(qs.map((q) => [q.id, q])),
    etiquetas: leerJSON(join(RAIZ, 'data', 'ejes', eje, tit, 'conceptos.json'), {}),
    catalogo: catalogoConceptos(), clases: temasDeClases(tit), excepciones: excepcionesDe(eje, tit),
  };
}

/** Preguntas de la práctica que están en una clase de otro tema: [{ id, ut, clases: [ids de clase de otro tema] }]. */
export function fueraDeTema(ctx, practica, { conExcepciones = false } = {}) {
  const fuera = new Map();
  for (const [clase, ids] of Object.entries(practica)) {
    const utClase = ctx.clases.get(clase);
    for (const id of ids) {
      const q = ctx.porId.get(id);
      if (!q || utClase == null || q.ut === utClase) continue;
      if (!conExcepciones && ctx.excepciones[id]?.clase === clase) continue;
      if (!fuera.has(id)) fuera.set(id, { id, ut: q.ut, clases: [] });
      fuera.get(id).clases.push(clase);
    }
  }
  return [...fuera.values()];
}

/**
 * Clase de su tema para una pregunta, o null. `enClase`: Map id → clases de SU tema en que está cada pregunta ya
 * colocada (las que se están recolocando no cuentan).
 * @returns {{ clase: string|null, criterio: 'idea'|'hermanas'|'parecido'|'sin-clase', detalle: string }}
 */
export function elegirClase(q, ctx, enClase) {
  const delTema = [...ctx.clases].filter(([, ut]) => ut === q.ut).map(([id]) => id);
  const cs = (ctx.etiquetas[q.id] ?? []).filter((c) => ctx.catalogo.has(c));
  const principal = cs[0] ?? null;
  // Clases de su tema donde ya hay preguntas de su idea principal.
  const hermanas = new Map();
  if (principal) {
    for (const [id, clases] of enClase) {
      if (id === q.id || ctx.etiquetas[id]?.[0] !== principal) continue;
      for (const l of clases) if (delTema.includes(l)) hermanas.set(l, (hermanas.get(l) ?? 0) + 1);
    }
  }
  // 1. idea: una clase de su tema donde se enseña su idea (catálogo).
  for (const c of cs) {
    const suyas = (ctx.catalogo.get(c).clases ?? []).filter((l) => delTema.includes(l));
    if (!suyas.length) continue;
    const clase = [...suyas].sort((a, b) => (hermanas.get(b) ?? 0) - (hermanas.get(a) ?? 0))[0];
    return { clase, criterio: 'idea', detalle: `${c} se enseña en ${suyas.join(', ')}` };
  }
  // 2. hermanas: donde ya están las demás preguntas de su idea.
  const total = [...hermanas.values()].reduce((s, n) => s + n, 0);
  const [mejorH, nH] = [...hermanas].sort((a, b) => b[1] - a[1])[0] ?? [];
  if (mejorH && nH >= 3 && nH / total >= 0.5) return { clase: mejorH, criterio: 'hermanas', detalle: `${nH} de las ${total} preguntas de ${principal} con clase en su tema están ahí` };
  // 3. parecido con las preguntas ya asignadas a las clases de su tema.
  const vecinas = [];
  for (const [id, clases] of enClase) {
    const r = ctx.porId.get(id);
    if (!r || r.ut !== q.ut || id === q.id) continue;
    vecinas.push({ clases, s: parecido(q, r) });
  }
  vecinas.sort((a, b) => b.s - a.s);
  if (vecinas[0]?.s >= MIN_PARECIDO) {
    const votos = new Map();
    for (const v of vecinas.slice(0, 5)) for (const l of v.clases) votos.set(l, (votos.get(l) ?? 0) + v.s / v.clases.length);
    const [clase, s] = [...votos].sort((a, b) => b[1] - a[1])[0];
    return { clase, criterio: 'parecido', detalle: `parecido ${vecinas[0].s.toFixed(2)} con sus vecinas de ${clase} (voto ${s.toFixed(2)})` };
  }
  return { clase: null, criterio: 'sin-clase', detalle: principal ? `ninguna clase de su tema enseña ${principal} ni tiene preguntas parecidas` : 'sin idea etiquetada y sin preguntas parecidas en las clases de su tema' };
}

/**
 * Recoloca la práctica: ninguna pregunta queda en una clase de otro tema (salvo las excepciones).
 * @param {ReturnType<typeof contexto>} ctx
 * @param {Record<string, string[]>} practica  { clase: [ids] } (no se modifica)
 * @returns {{ practica: Record<string, string[]>, movimientos: { id, ut, de: string[], a: string|null, criterio, detalle }[] }}
 */
export function recolocar(ctx, practica) {
  const fuera = fueraDeTema(ctx, practica);
  const quitar = new Map(fuera.map((f) => [f.id, new Set(f.clases)]));
  const nueva = Object.fromEntries(Object.entries(practica).map(([l, ids]) => [l, ids.filter((id) => !quitar.get(id)?.has(l))]));
  // Dónde está cada pregunta dentro de su tema (sin contar las que hay que recolocar y no tienen otra clase).
  const enClase = new Map();
  for (const [l, ids] of Object.entries(nueva)) {
    for (const id of ids) {
      if (ctx.porId.get(id)?.ut !== ctx.clases.get(l)) continue;
      if (!enClase.has(id)) enClase.set(id, []);
      enClase.get(id).push(l);
    }
  }
  const movimientos = [];
  const decididas = [];
  for (const f of fuera) {
    const q = ctx.porId.get(f.id);
    if (enClase.has(f.id)) { movimientos.push({ id: f.id, ut: f.ut, de: f.clases, a: enClase.get(f.id)[0], criterio: 'ya-en-su-tema', detalle: `ya estaba también en ${enClase.get(f.id).join(', ')}` }); continue; }
    // Se decide con la práctica de partida (el orden en que se recorren no cambia el resultado).
    decididas.push({ f, ...elegirClase(q, ctx, enClase) });
  }
  // Excepciones de una clase que se quedaría sin práctica («clase-corta»): siguen en ella y, además, van a la clase de
  // su tema que las explique (si aún no están en ninguna).
  for (const [id, e] of Object.entries(ctx.excepciones)) {
    const q = ctx.porId.get(id);
    if (e.tipo !== 'clase-corta' || !q || !practica[e.clase]?.includes(id) || enClase.has(id)) continue;
    const d = elegirClase(q, ctx, enClase);
    if (d.clase) decididas.push({ f: { id, ut: q.ut, clases: [] }, ...d, ademas: true });
  }
  const orden = new Map(ctx.qs.map((q, i) => [q.id, i]));
  for (const d of decididas) {
    if (d.clase) { nueva[d.clase] ??= []; nueva[d.clase].push(d.f.id); }
    movimientos.push({ id: d.f.id, ut: d.f.ut, de: d.f.clases, a: d.clase, criterio: d.criterio, detalle: d.detalle, ...(d.ademas ? { ademas: true } : {}) });
  }
  for (const l of new Set(decididas.map((d) => d.clase).filter(Boolean))) nueva[l] = [...new Set(nueva[l])].sort((a, b) => orden.get(a) - orden.get(b));
  return { practica: nueva, movimientos };
}
