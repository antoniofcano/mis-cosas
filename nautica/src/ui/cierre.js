// Cierre de sesión (final de una clase, una tanda de preguntas…) y utilidades del recomendador en la interfaz.

import { h } from './dom.js';
import { TITULACIONES, tlink } from './titulacion.js';
import { loadCourse, loadTheoryBank } from '../store/datasets.js';
import { planHoy, estadoTema } from '../course/plan.js';
import { randomSeed } from '../math/rng.js';
import { contar } from './movimiento.js';

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
  clase: ['🎓', 'Clase'], chuleta: ['📌', 'Chuleta del tema'], preguntas: ['✏️', 'Preguntas'], repaso: ['🔁', 'Repaso'], fallos: ['🎯', 'Repaso de fallos'],
  simulacro: ['📝', 'Simulacro de examen'], mezclado: ['🔀', 'Repaso mezclado'], 'examen-en-curso': ['⏱', 'Examen a medias'],
};

/**
 * Meta del día, siempre a la vista: minutos de hoy frente al objetivo, con barra gruesa y la cifra. La racha va al lado,
 * en positivo (nunca castiga: no hay vidas ni nada que se pierda).
 */
export function metaDiaria(progress) {
  const minutos = progress.minutosHoy();
  const objetivo = progress.settings().minutosDia ?? 20;
  const racha = progress.racha();
  const pct = Math.min(100, Math.round((100 * minutos) / Math.max(1, objetivo)));
  const hecho = minutos >= objetivo;
  return h('section.meta-diaria', { class: hecho ? 'hecho' : '' },
    h('p.meta-texto', h('strong', hecho ? '✅ Meta de hoy cumplida' : 'Meta de hoy'), ` · ${minutos} de ${objetivo} min`,
      racha >= 2 ? h('span.racha', ` · ${racha} días seguidos`) : null),
    h('div.bar.gruesa', { role: 'progressbar', 'aria-label': 'Meta de hoy', 'aria-valuemin': 0, 'aria-valuemax': objetivo, 'aria-valuenow': minutos }, h('span', { style: `width:${pct}%` })));
}

/**
 * Pantalla de cierre de una actividad.
 * @param {{ icono: string, titulo: string, lineas?: string[], siguiente?: object, tit: string }} o
 * @returns {HTMLElement}
 */
export function cierre({ icono, titulo, lineas = [], siguiente = null, tit, meta = null, logros = [], animar = true }) {
  // «7 de 10»: el primer número sube hasta su valor (confirma el resultado, una sola vez).
  const m = /^(\d+)( de \d+)$/.exec(titulo);
  let h1 = h('h1', titulo);
  if (m && animar) { const num = h('span'); h1 = h('h1', num, m[2]); contar(num, Number(m[1])); }
  return h('section.cierre',
    h('div.icono', { 'aria-hidden': 'true' }, icono),
    h1,
    lineas.length ? h('div.lineas', lineas.map((l) => h('p', l))) : null,
    // Lo ganado en esta sesión (aciertos, clase vista, avance del tema) y cómo va la meta del día.
    logros.length ? h('ul.logros', logros.map((l) => h('li', l))) : null,
    meta,
    h('div.botones',
      h('a.btn.grande', { href: tlink(tit) }, 'Terminar por hoy'),
      siguiente ? h('a.btn.secondary.grande', { href: hrefActividad(tit, siguiente) }, `Seguir: ${siguiente.titulo} (${siguiente.minutos} min)`) : null),
  );
}

/** Coloca el cierre en `cont` cuando el plan recalculado esté listo (primero se pinta sin «Seguir»). */
export function pintarCierre(cont, progress, tit, o) {
  const extra = o.extra ? [o.extra] : []; // lo que va debajo del cierre (se conserva al repintar)
  const meta = () => metaDiaria(progress);
  cont.replaceChildren(cierre({ ...o, tit, meta: meta() }), ...extra);
  calcularPlan(progress, tit).then((d) => {
    const logros = [...(o.logros ?? [])];
    // El avance del tema de la actividad, si se sabe.
    const b = o.ut != null ? d.estructura.bloques.find((x) => x.ut === o.ut) : null;
    if (b) {
      const e = estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora);
      if (e.clases.total) logros.push(`${b.titulo}: llevas ${e.clases.terminadas} de ${e.clases.total} clases`);
    }
    if (cont.isConnected || cont.parentNode) cont.replaceChildren(cierre({ ...o, tit, siguiente: d.plan[0], meta: meta(), logros, animar: false }), ...extra);
  }).catch(() => {});
}
