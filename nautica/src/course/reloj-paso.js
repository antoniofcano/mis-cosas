// Reloj del paso a paso y de las preguntas de carta de la práctica (R-64): entrenar la soltura. Funciones puras (sin DOM);
// la interfaz está en src/ui/reloj-paso.js y el tiempo que cuenta, en src/ui/reloj-visible.js (solo con la pestaña visible).
//
// El OBJETIVO por problema no se inventa: es el tiempo que la app ya calcula para «Tu velocidad en carta» (R-42,
// `tiempoDisponible` de src/course/estrategia.js): el tiempo del examen de la titulación repartido con el presupuesto
// orientativo de data/comun/estrategia.json (teoría a 1,2 min por pregunta, una décima parte para el repaso, el resto para
// las de carta). Es una ESTIMACIÓN, no una norma, y el texto lo dice. Si una titulación no tuviera carta en su presupuesto,
// se usa la media del examen (duración entre preguntas) y se dice también.

import { tiempoDisponible } from './estrategia.js';
import { estadoTiempo, mmssCorto } from './velocidad.js';

/**
 * El objetivo por problema de carta de una titulación.
 * @param {object} T  TITULACIONES[tit]
 * @param {object} [cfgTiempo]  data/comun/estrategia.json → tiempo
 * @returns {{ s: number, origen: 'presupuesto'|'media', tramo: string|null, texto: string } | null}
 */
export function objetivoPorProblema(T, cfgTiempo = {}) {
  if (!T?.estructura) return null;
  const d = tiempoDisponible(T, cfgTiempo);
  const s = d.cartaS ?? d.mediaS;
  if (!(s > 0)) return null;
  const origen = d.cartaS != null ? 'presupuesto' : 'media';
  const tramo = d.tramo ?? null;
  const texto = origen === 'presupuesto'
    ? `Objetivo ${mmssCorto(s)} por problema: estimación con el reparto orientativo del tiempo de tu examen${tramo ? ` (${tramo})` : ''}, no una norma.`
    : `Objetivo ${mmssCorto(s)} por problema: estimación, la media del tiempo de tu examen por pregunta, no una norma.`;
  return { s, origen, tramo, texto };
}

/** Fracción del objetivo gastada (puede pasar de 1); null sin objetivo. */
export const fraccionObjetivo = (s, objetivoS) => (objetivoS > 0 ? Math.max(0, s) / objetivoS : null);

/** Estados del reloj, con el mismo criterio que «Tu velocidad en carta»: hasta el 75 %, hasta el 100 % y más. */
export const ESTADOS_RELOJ = { bien: 'vas bien', justo: 'vas justo', pasas: 'te pasas' };

/** 'bien' | 'justo' | 'pasas' según los segundos y el objetivo; null sin objetivo. */
export function estadoReloj(s, objetivoS) {
  const e = estadoTiempo(s, objetivoS);
  return e === 'cabe' ? 'bien' : e === 'justo' ? 'justo' : e === 'se-pasa' ? 'pasas' : null;
}

/** «paso 1 · 0:48 ✓» (✓ si salió bien; sin marca si no). */
export const textoPasoHecho = (n, s, ok = false) => `paso ${n} · ${mmssCorto(s)}${ok ? ' ✓' : ''}`;

/**
 * Tiempo de cada paso: se le dice el total corrido en cada paso hecho y devuelve lo que ha tardado en ese paso (el total
 * menos el del paso anterior). Si el total retrocede (reloj reiniciado), cuenta 0.
 */
export function cronoPasos() {
  let anterior = 0;
  return {
    marca(totalS) { const d = Math.max(0, totalS - anterior); anterior = Math.max(anterior, totalS); return d; },
    reinicia() { anterior = 0; },
  };
}
