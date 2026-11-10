// Correcciones de tema del alumno (docs/BANCOS.md, «Correcciones del alumno»): «esta pregunta no es de este tema».
// El alumno elige el tema correcto de su titulación (y, si quiere, la clase) y la pregunta pasa a contar ahí EN SU
// ESTUDIO, al momento. Son datos suyos (van con su progreso y se sincronizan, docs/SYNC.md): aquí no se toca ningún
// fichero del banco ni el banco que el motor tiene cargado y comparte; se devuelve una VISTA del banco con copias de
// las preguntas corregidas.
//
// Qué cambia en la vista (lo que se usa para estudiar):
//   estudio, practica, porId   la pregunta corregida es una copia con `ut` y `ut_titulo` nuevos, `utBanco` (el tema del
//                              banco) y `temaCorregido: true`. Tandas por tema, Temario, repaso, mezcla, «5 minutos»,
//                              plan, «¿Estás listo?» e ideas por tema la cuentan en el tema elegido.
//   practicaDe(clase)          sale de la práctica de las clases de otro tema (o de las que no son la clase elegida) y
//                              entra en la de la clase elegida.
// Qué NO cambia (el examen sigue siendo el oficial):
//   todas, examenes, final, listas, convocatorias(), reserva y `oficial` ({ porId, estudio } con las preguntas del banco
//   tal cual). Los exámenes de convocatoria, el examen final y los simulacros se arman y se corrigen con el tema oficial
//   (el bloque del examen en que salió la pregunta): el reparto por temas y los límites de fallos son los del tribunal.
//
// Funciones puras.

/**
 * Las correcciones que valen para un banco: de preguntas suyas, a un tema que existe en la titulación y que cambian
 * algo (otro tema, o una clase). Una clase que no existe o que no es del tema elegido se ignora (queda solo el tema).
 * @param {Record<string, { ut: number, clase?: string, de?: number, t?: string }>} correcciones  progress.correcciones()
 * @param {{ porId: Map<string, object> }} banco
 * @param {{ bloques: { ut: number }[] }} estructura
 * @param {Map<string, number>} [clases]  id de clase → tema (del curso de la titulación)
 * @returns {Map<string, { ut: number, clase: string|null, de: number, t: string|null }>}
 */
export function correccionesValidas(correcciones, banco, estructura, clases = new Map()) {
  const out = new Map();
  if (!correcciones || typeof correcciones !== 'object') return out;
  const temas = new Set(estructura.bloques.map((b) => b.ut));
  for (const [id, c] of Object.entries(correcciones)) {
    const q = banco.porId.get(id);
    if (!q || !c || typeof c !== 'object' || !temas.has(c.ut)) continue;
    const de = q.utBanco ?? q.ut;
    const clase = typeof c.clase === 'string' && clases.get(c.clase) === c.ut ? c.clase : null;
    if (c.ut === de && !clase) continue; // el banco ya la tiene en ese tema: no hay nada que corregir
    out.set(id, { ut: c.ut, clase, de, t: typeof c.t === 'string' ? c.t : null });
  }
  return out;
}

/** Firma de un conjunto de correcciones válidas (para no rehacer la vista si no han cambiado). */
export const firmaCorrecciones = (validas) => [...validas].map(([id, c]) => `${id}>${c.ut}${c.clase ? `@${c.clase}` : ''}`).sort().join('|');

/** Tema de cada clase de un curso: Map id → ut. */
export function temasDeClases(curso) {
  return new Map((curso?.modulos ?? []).flatMap((m) => (m.lecciones ?? []).map((l) => [l.id, l.ut ?? m.ut])));
}

/**
 * El banco como lo estudia el alumno: una vista con sus correcciones aplicadas. No modifica `banco` ni sus preguntas.
 * Sin correcciones válidas devuelve el mismo banco.
 * @param {object} banco  el de src/bancos (cargarBanco)
 * @param {ReturnType<typeof correccionesValidas>} validas
 * @param {{ estructura: object, clases?: Map<string, number> }} o
 */
export function aplicarCorrecciones(banco, validas, { estructura, clases = new Map() }) {
  if (!validas?.size) return banco;
  // Título del tema como lo escribe este banco (el de otra pregunta suya de ese tema); si no, el de la estructura.
  const titulos = new Map();
  for (const q of banco.todas) if (!titulos.has(q.ut) && q.ut_titulo) titulos.set(q.ut, q.ut_titulo);
  const titulo = (ut) => titulos.get(ut) ?? estructura.bloques.find((b) => b.ut === ut)?.titulo ?? null;
  const copias = new Map();
  const corrige = (q) => {
    const c = validas.get(q.id);
    if (!c || c.ut === q.ut) return q;
    if (!copias.has(q.id)) copias.set(q.id, { ...q, ut: c.ut, ut_titulo: titulo(c.ut), utBanco: q.ut, temaCorregido: true });
    return copias.get(q.id);
  };
  const estudio = banco.estudio.map(corrige);
  const practica = banco.practica === banco.estudio ? estudio : banco.practica.map(corrige);
  const enPractica = new Set(practica.map((q) => q.id));
  const porId = new Map(banco.porId);
  for (const q of estudio) if (q.temaCorregido) porId.set(q.id, q);
  /** Práctica de una clase: fuera las corregidas a otro tema o a otra clase; dentro las que el alumno puso en esta. */
  const practicaDe = (leccionId) => {
    const utClase = clases.get(leccionId);
    const base = banco.practicaDe(leccionId).filter((id) => {
      const c = validas.get(id);
      if (!c) return true;
      return c.clase ? c.clase === leccionId : utClase == null || utClase === c.ut;
    });
    const suyas = [...validas].filter(([id, c]) => c.clase === leccionId && enPractica.has(id) && !base.includes(id)).map(([id]) => id);
    return suyas.length ? [...base, ...suyas] : base;
  };
  return {
    ...banco, estudio, practica, porId, practicaDe,
    oficial: banco.oficial ?? { porId: banco.porId, estudio: banco.estudio },
    correcciones: validas,
    correccionDe: (id) => validas.get(id) ?? null,
  };
}

/**
 * Texto para avisar al autor de una o varias correcciones (una línea por pregunta, sin el enunciado: basta el id, y así
 * nunca se copia una pregunta reservada). `titulo(tit, ut)` → nombre del tema; `tituloClase(id)` → el de la clase.
 * @param {{ id: string, eje?: string, tit?: string, de: number, ut: number, clase?: string|null }[]} lista
 */
export function textoCorrecciones(lista, { titulo = (tit, ut) => `tema ${ut}`, tituloClase = (id) => id } = {}) {
  return lista.map((c) => {
    const banco = [c.eje, c.tit ? String(c.tit).toUpperCase() : null].filter(Boolean).join(' · ');
    const cambio = c.de === c.ut ? `sigue en el tema ${c.ut} (${titulo(c.tit, c.ut)})` : `tema actual ${c.de} (${titulo(c.tit, c.de)}) → propuesto ${c.ut} (${titulo(c.tit, c.ut)})`;
    return `- \`${c.id}\`${banco ? ` (${banco})` : ''}: ${cambio}${c.clase ? ` · clase propuesta: ${c.clase} (${tituloClase(c.clase)})` : ''}`;
  }).join('\n');
}
