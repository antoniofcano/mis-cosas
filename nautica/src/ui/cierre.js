// Cierre de sesión (final de una clase, una tanda de preguntas…) y utilidades del recomendador en la interfaz.

import { h } from './dom.js';
import { TITULACIONES, tlink } from './titulacion.js';
import { loadCourse, loadTheoryBank } from '../store/datasets.js';
import { planHoy } from '../course/plan.js';
import { randomSeed } from '../math/rng.js';

/** Datos del recomendador para una titulación y su plan de hoy (recalculado con el progreso actual). */
export async function calcularPlan(progress, tit, ahora = Date.now()) {
  const T = TITULACIONES[tit];
  const [curso, bank] = await Promise.all([loadCourse(tit), loadTheoryBank(tit)]);
  const tc = progress.testEnCurso();
  const o = {
    estructura: T.estructura, curso, preguntas: bank.preguntas, regs: progress.lecciones(), respuestas: progress.get().exams,
    tests: progress.tests().filter((t) => (t.tit ?? 'per') === tit), testEnCurso: tc && tc.tit === tit ? tc : null,
    fechaExamen: progress.settings()[`examen_${tit}`] || null, ultimoMezclado: progress.settings()[`mezclado_${tit}`] || null, ahora,
  };
  return { ...o, bank, plan: planHoy(o) };
}

/** Enlace a una actividad del plan (las tandas de preguntas llevan su semilla para poder recargarlas). */
export function hrefActividad(tit, a) {
  const query = a.ruta[0] === 'teoria' ? { s: String(randomSeed()), ...(a.query ?? {}) } : a.query;
  return tlink(tit, a.ruta, query);
}

export const TIPO_TXT = {
  clase: ['🎓', 'Clase'], preguntas: ['✏️', 'Preguntas'], repaso: ['🔁', 'Repaso'], fallos: ['🎯', 'Repaso de fallos'],
  simulacro: ['📝', 'Simulacro de examen'], mezclado: ['🔀', 'Repaso mezclado'], 'examen-en-curso': ['⏱', 'Examen a medias'],
};

/**
 * Pantalla de cierre de una actividad.
 * @param {{ icono: string, titulo: string, lineas?: string[], siguiente?: object, tit: string }} o
 * @returns {HTMLElement}
 */
export function cierre({ icono, titulo, lineas = [], siguiente = null, tit }) {
  return h('section.cierre',
    h('div.icono', { 'aria-hidden': 'true' }, icono),
    h('h1', titulo),
    lineas.length ? h('div.lineas', lineas.map((l) => h('p', l))) : null,
    h('div.botones',
      h('a.btn.grande', { href: tlink(tit) }, 'Terminar por hoy'),
      siguiente ? h('a.btn.secondary.grande', { href: hrefActividad(tit, siguiente) }, `Seguir: ${siguiente.titulo} (${siguiente.minutos} min)`) : null),
  );
}

/** Coloca el cierre en `cont` cuando el plan recalculado esté listo (primero se pinta sin «Seguir»). */
export function pintarCierre(cont, progress, tit, o) {
  cont.replaceChildren(cierre({ ...o, tit }));
  calcularPlan(progress, tit).then(({ plan }) => { if (cont.isConnected || cont.parentNode) cont.replaceChildren(cierre({ ...o, tit, siguiente: plan[0] })); }).catch(() => {});
}
