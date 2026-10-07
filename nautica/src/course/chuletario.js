// Chuleta de la práctica (data/comun/chuletario.json): qué fórmulas, signos y conversiones se enseñan según lo que se
// practica, y dónde está permitida. Funciones puras (sin DOM).
//
// Regla de oro: la chuleta es una ayuda para PRACTICAR. Nunca sale en un simulacro, en un examen real ni en el examen
// final, ni en ningún modo que no esté en la lista de práctica (lo nuevo, por defecto, queda fuera).

/** Modos en los que se puede abrir la chuleta. */
export const MODOS_PRACTICA = Object.freeze([
  'ejercicio', // #/ej/<tipo>: ejercicio de carta generado
  'pregunta', // #/q/<id>: una pregunta real de carta, para practicarla y verla resuelta
  'clase', // una clase (tarjetas y sus ejercicios intercalados)
  'practica-clase', // la práctica del final de una clase
  'tanda', // tanda de 10 preguntas de un tema (también «Mis fallos» del tema)
  'mezcla', // repaso mezclado de varios temas
  'repaso', // «Repasar mis fallos»
  'rapido', // «Tengo 5 minutos»
]);

/** Modos de examen: aquí nunca hay chuleta. */
export const MODOS_EXAMEN = Object.freeze(['simulacro', 'real', 'final']);

/** ¿Se puede mostrar la chuleta en este modo? Solo en los de práctica, nunca en uno de examen. */
export const chuletaPermitida = (modo) => MODOS_PRACTICA.includes(modo) && !MODOS_EXAMEN.includes(modo);

/**
 * ¿Esta dirección es la de un examen? (simulacro, convocatoria real o examen final, ahora o con otra ruta futura).
 * Segunda barrera: aunque una vista pidiera la chuleta por error, en un examen no se abre.
 */
export function esRutaDeExamen(hash = '') {
  const ruta = String(hash).replace(/^#\/?/, '').split('?')[0].toLowerCase();
  const partes = ruta.split('/').filter(Boolean);
  return partes.includes('test') || partes.includes('simulacro') || partes.includes('final') || partes.some((p) => /^examen-?final$/.test(p));
}

/**
 * Fichas de fórmulas para un contexto, sin repetir y en orden: primero las del tipo de ejercicio (lo más concreto),
 * después las del tema.
 * @param {{ fichas: object, temas: object, ejercicios: object }} chuletario
 * @param {{ tit?: string, ut?: number, ejercicios?: string[] }} ctx
 * @returns {{ id: string, titulo: string, lineas: string[] }[]}
 */
export function fichasPara(chuletario, { tit, ut, ejercicios = [] } = {}) {
  if (!chuletario?.fichas) return [];
  const ids = [
    ...ejercicios.flatMap((e) => chuletario.ejercicios?.[e] ?? []),
    // Con ejercicios concretos (una clase de carta, un ejercicio) bastan los suyos; si no hay, las del tema.
    ...(ejercicios.some((e) => chuletario.ejercicios?.[e]?.length) ? [] : (chuletario.temas?.[tit]?.[String(ut)] ?? [])),
  ];
  return [...new Set(ids)].filter((id) => chuletario.fichas[id]).map((id) => ({ id, ...chuletario.fichas[id] }));
}

/**
 * Chuletas de las clases que vienen a cuento (van debajo de las fórmulas): la de la clase en curso; si no, las de las
 * clases que practican ese ejercicio de carta; si no, las de las clases del tema.
 * @param {object} curso  data/curso/<tit>.json
 * @param {{ leccion?: string, ejercicios?: string[], ut?: number }} ctx
 * @returns {{ id: string, titulo: string, lineas: string[] }[]}
 */
export function chuletasDeClases(curso, { leccion, ejercicios = [], ut } = {}) {
  const clases = (curso?.modulos ?? []).flatMap((m) => m.lecciones.map((l) => ({ ...l, ut: l.ut ?? m.ut })));
  const con = (ls) => ls.filter((l) => l.chuleta?.length).map((l) => ({ id: l.id, titulo: l.titulo, lineas: l.chuleta }));
  if (leccion) return con(clases.filter((l) => l.id === leccion));
  if (ejercicios.length) {
    const deEj = con(clases.filter((l) => (l.carta ?? []).some((e) => ejercicios.includes(e))));
    if (deEj.length) return deEj;
  }
  return ut != null ? con(clases.filter((l) => l.ut === ut)) : [];
}
