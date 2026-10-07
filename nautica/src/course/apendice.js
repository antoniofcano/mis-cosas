// Apéndice «Las cuentas del patrón» (data/curso/apendice-matematicas.json): clases cortas de matemáticas para los
// ejercicios de carta. No es un tema del examen: va aparte del curso (data/curso/<tit>.json) y nunca entra en los
// temas, el plan ni «¿Estás listo?» (el motor solo recorre el curso). Funciones puras: el apéndice entra como datos.
//
// Cada clase: { id, titulo, tits: ['per', 'py'], minutos, objetivos, pasos, chuleta,
//               usadoEn: { lecciones: [ids de clases del curso], ejercicios: [ids de tipos de ejercicio] } }
// `usadoEn` dice dónde hace falta esa cuenta por primera vez: de ahí salen los enlaces «Repasa: …».

import { estadoLeccion } from './engine.js';

export const RUTA_APENDICE = 'data/curso/apendice-matematicas.json';
/** ¿Se enlaza ya desde la interfaz (Biblioteca, «Repasa: …»)? Mientras no, solo se llega por su dirección. */
export const APENDICE_PUBLICADO = false;

/** Clases del apéndice de una titulación, en orden (PER: 1–3; PY: todas). */
export function leccionesApendice(apendice, tit) {
  return (apendice?.lecciones ?? []).filter((l) => (l.tits ?? []).includes(tit)).map((l) => ({ ...l, apendice: true, ut: null, practica: [] }));
}

/** Una clase del apéndice por su id, si es de la titulación. */
export const leccionApendice = (apendice, tit, id) => leccionesApendice(apendice, tit).find((l) => l.id === id) ?? null;

/**
 * Clases del apéndice que repasan lo que necesita una clase del curso o un tipo de ejercicio (enlaces «Repasa: …»).
 * @param {{ leccion?: string, ejercicio?: string }} donde
 */
export function repasosPara(apendice, tit, { leccion = null, ejercicio = null } = {}) {
  return leccionesApendice(apendice, tit).filter((l) => (leccion && l.usadoEn?.lecciones?.includes(leccion)) || (ejercicio && l.usadoEn?.ejercicios?.includes(ejercicio)));
}

/** Estado de cada clase del apéndice para la lista (vista, empezada, nueva), con el mismo motor que las clases. */
export function estadoApendice(apendice, tit, regs = {}, ahora = Date.now()) {
  const ls = leccionesApendice(apendice, tit).map((l) => ({ l, estado: estadoLeccion(l, regs[l.id], {}, ahora).estado }));
  return { lecciones: ls, vistas: ls.filter((x) => x.estado !== 'nueva' && x.estado !== 'empezada').length, total: ls.length };
}
