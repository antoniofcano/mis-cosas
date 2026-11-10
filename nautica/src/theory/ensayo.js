// Ensayo general en papel (R-41): el examen con el material real (la carta de papel que da el tribunal, transportador,
// compás, lápiz, reloj y, si se permite, calculadora). La app solo da los enunciados y el reloj del tribunal; al
// terminar, las respuestas se pasan a una hoja de respuestas (todas de golpe, como la hoja oficial) y se corrige con
// las reglas reales (src/theory/engine.js, grade). Funciones puras (sin DOM).
//
// Partes que se ensayan:
//  - PY: el módulo de navegación (Teoría y Carta, 20 preguntas, 75 minutos: RD 875/2014) o el examen completo.
//  - PER: la navegación y la carta (temas 10 y 11, 9 preguntas) o el examen completo. La parte no tiene tiempo propio
//    en el examen (son 90 minutos para las 45): su reloj es el que les deja el presupuesto orientativo de la estrategia
//    (src/course/estrategia.js, presupuestoTiempo) y se dice así, como orientativo.
//
// Lo que NO hay en un ensayo (como en el examen): ni la mesa de cartas, ni la chuleta, ni las fórmulas, ni el paso a
// paso, ni el bloc, ni la calculadora de la app. `SIN_AYUDAS` lo deja escrito y tests/ensayo.test.js lo comprueba en
// la interfaz (src/ui/ensayo.js).

import { estructuraModulo, totalPreguntas } from './blocks.js';
import { buildSimulacro, grade } from './engine.js';
import { presupuestoTiempo } from '../course/estrategia.js';
import { cuenta } from '../texto.js';

/** Ensayos en papel que se recomienda hacer antes del examen. */
export const ENSAYOS_RECOMENDADOS = 2;

/** Lo que la app NO ofrece durante un ensayo. */
export const SIN_AYUDAS = Object.freeze({ mesaDeCartas: false, chuleta: false, formulas: false, pasoAPaso: false, bloc: false, calculadoraDeLaApp: false, glosas: false });

/** Los temas de la parte de navegación y carta del PER (Teoría de navegación y Carta). */
const UTS_CARTA_PER = [10, 11];

/** Las partes que se pueden ensayar en una titulación (la primera es la recomendada). */
export function partesEnsayo(T) {
  const E = T.estructura;
  const partes = [];
  if (E.modulos?.some((m) => m.id === 'navegacion')) {
    const m = estructuraModulo(E, 'navegacion');
    partes.push({ id: 'navegacion', titulo: 'Módulo de navegación', sub: `${cuenta(totalPreguntas(m), 'pregunta')} de Teoría y Carta · ${cuenta(m.duracionMin, 'minuto')}, como en el examen` });
  } else if (UTS_CARTA_PER.every((ut) => E.bloques.some((b) => b.ut === ut))) {
    const e = estructuraEnsayo(T, 'carta');
    partes.push({ id: 'carta', titulo: 'Navegación y carta', sub: `${cuenta(totalPreguntas(e), 'pregunta')} de Teoría de navegación y Carta · ${cuenta(e.duracionMin, 'minuto')} (orientativo)` });
  }
  partes.push({ id: 'completo', titulo: 'Examen completo', sub: `${cuenta(totalPreguntas(E), 'pregunta')} · ${cuenta(E.duracionMin, 'minuto')}, como en el examen` });
  return partes;
}

/** La parte pedida si existe; si no, la recomendada. */
export function parteValida(T, p) {
  const ps = partesEnsayo(T);
  return (ps.find((x) => x.id === p) ?? ps[0]).id;
}

/**
 * La estructura con la que se hace y se corrige una parte. `oficial`: su tiempo es el del examen (si no, orientativo).
 * `modulo` marca una parte suelta: sin nota global, mandan los límites de cada materia (como el aprobado por módulos).
 * @param {object} T  TITULACIONES[tit]
 * @param {string} parte  'navegacion' | 'carta' | 'completo'
 * @param {{ minTeoria?: number, repasoFraccion?: number }} [tiempo]  data/comun/estrategia.json → tiempo
 */
export function estructuraEnsayo(T, parte, tiempo = {}) {
  const E = T.estructura;
  if (parte === 'navegacion') {
    const m = estructuraModulo(E, 'navegacion');
    if (m) return { ...m, titulo: 'Módulo de navegación', parte, oficial: true };
  }
  if (parte === 'carta') {
    const bloques = E.bloques.filter((b) => UTS_CARTA_PER.includes(b.ut));
    // El tiempo: el que deja el presupuesto de la estrategia a la carta, más la teoría de navegación a su ritmo.
    const pres = presupuestoTiempo(T, tiempo).find((t) => t.filas.some((f) => f.parte === 'carta'));
    const carta = pres?.filas.find((f) => f.parte === 'carta');
    const nTeoria = bloques.filter((b) => b.ut !== T.cartaUt).reduce((s, b) => s + b.n, 0);
    const duracionMin = Math.max(1, Math.round((carta?.minutos ?? 0) + nTeoria * (tiempo.minTeoria ?? 1.2)));
    return {
      ...E, modulos: undefined, modulo: 'carta', parte, oficial: false, titulo: 'Navegación y carta', duracionMin, bloques,
      minAciertos: bloques.reduce((s, b) => s + (b.n - (b.maxErrores ?? b.n)), 0),
      ordenEstudio: (E.ordenEstudio ?? []).filter((ut) => UTS_CARTA_PER.includes(ut)),
    };
  }
  return { ...E, parte: 'completo', oficial: true };
}

/** Las preguntas del ensayo: como un simulacro de esa parte (semilla reproducible; primero las no vistas). */
export function buildEnsayo(estructura, banco, rng, { respuestas = null } = {}) {
  const t = buildSimulacro(estructura, banco, rng, { respuestas });
  return { ...t, tipo: 'ensayo', parte: estructura.parte, titulo: tituloEnsayo(estructura) };
}

export const tituloEnsayo = (estructura) => (estructura.parte === 'completo' ? 'Ensayo en papel · examen completo' : `Ensayo en papel · ${estructura.titulo.toLowerCase()}`);

/** Letras de las opciones de una pregunta, en orden (a, b, c, d). */
export const letrasDe = (q) => Object.keys(q?.opciones ?? {}).sort();

/**
 * Hoja de respuestas → respuestas por pregunta. La hoja va por número (1…n, el del cuadernillo): { [n]: letra|null }.
 * Una letra que no es de esa pregunta (o vacía) cuenta como en blanco.
 * @returns {{ respuestas: Record<string,string>, marcadas: number, enBlanco: number[] }}
 */
export function leerHoja(test, hoja = {}) {
  const respuestas = {};
  const enBlanco = [];
  test.preguntas.forEach((q, i) => {
    const l = String(hoja[i + 1] ?? '').trim().toLowerCase();
    if (l && letrasDe(q).includes(l)) respuestas[q.id] = l;
    else enBlanco.push(i + 1);
  });
  return { respuestas, marcadas: Object.keys(respuestas).length, enBlanco };
}

/** Corrige la hoja con las reglas reales del examen (o de la parte): grade + lo que se dejó en blanco. */
export function corregirHoja(estructura, test, hoja) {
  const { respuestas, marcadas, enBlanco } = leerHoja(test, hoja);
  return { ...grade(estructura, test, respuestas), respuestas, marcadas, enBlanco };
}

/** Ensayos en papel hechos (de una titulación y un eje: tests ya filtrados), del más antiguo al más reciente. */
export const ensayosHechos = (tests = []) => tests.filter((t) => t?.tipo === 'ensayo');

/**
 * Cuántos llevas frente a los recomendados, con la frase para la estrategia y la semana.
 * @returns {{ hechos: number, recomendados: number, faltan: number, texto: string, ultimo: object|null }}
 */
export function cuentaEnsayos(tests = [], recomendados = ENSAYOS_RECOMENDADOS) {
  const hs = ensayosHechos(tests);
  const n = hs.length;
  const faltan = Math.max(0, recomendados - n);
  const texto = !n ? `Antes del examen, haz al menos ${recomendados} ensayos en papel: el examen con la carta de papel, el transportador, el compás y el reloj, como el día de verdad.`
    : faltan ? `Llevas ${n} de ${recomendados} ensayos en papel. Haz ${faltan === 1 ? 'otro' : `${faltan} más`} antes del examen.`
      : `Llevas ${n} ensayos en papel: con el material real ya no te pilla nada por sorpresa.`;
  return { hechos: n, recomendados, faltan, texto, ultimo: hs.at(-1) ?? null };
}
