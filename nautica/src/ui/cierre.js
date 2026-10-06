// Cierre de sesión (final de una clase, una tanda de preguntas…) y utilidades del recomendador en la interfaz.

import { h } from './dom.js';
import { TITULACIONES, tlink } from './titulacion.js';
import { loadCourse, loadTheoryBank } from '../store/datasets.js';
import { planHoy, estadoTema } from '../course/plan.js';
import { randomSeed } from '../math/rng.js';
import { contar } from './movimiento.js';
import { icono as icono_ } from './iconos.js';

/** Datos del recomendador para una titulación y su plan de hoy (recalculado con el progreso actual). */
export async function calcularPlan(progress, tit, ahora = Date.now()) {
  const T = TITULACIONES[tit];
  const [curso, bank] = await Promise.all([loadCourse(tit), loadTheoryBank(tit)]);
  const tc = progress.testEnCurso();
  const o = {
    estructura: T.estructura, curso, preguntas: bank.preguntas, regs: progress.lecciones(), respuestas: progress.get().exams,
    tests: progress.tests().filter((t) => (t.tit ?? 'per') === tit), testEnCurso: tc && tc.tit === tit ? tc : null,
    fechaExamen: progress.settings()[`examen_${tit}`] || null, ultimoMezclado: progress.settings()[`mezclado_${tit}`] || null, segTarjeta: progress.settings().segTarjeta, ahora,
  };
  return { ...o, bank, plan: planHoy(o) };
}

/** Enlace a una actividad del plan (las tandas de preguntas llevan su semilla para poder recargarlas). */
export function hrefActividad(tit, a) {
  const query = a.ruta[0] === 'teoria' ? { s: String(randomSeed()), ...(a.query ?? {}) } : a.query;
  return tlink(tit, a.ruta, query);
}

/** Tipo de actividad → [icono de línea, nombre]. */
export const TIPO_TXT = {
  clase: ['clase', 'Clase'], chuleta: ['temario', 'Chuleta del tema'], preguntas: ['lapiz', 'Preguntas'], repaso: ['repaso', 'Repaso'], fallos: ['aviso', 'Repaso de fallos'],
  simulacro: ['examen', 'Simulacro de examen'], mezclado: ['repaso', 'Repaso mezclado'], 'examen-en-curso': ['reloj', 'Examen a medias'],
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

/** Marca de «hecho» que se dibuja (círculo verde con el visto). */
function marcaHecho() {
  const d = document.createElement('div');
  d.className = 'fin-tick';
  d.setAttribute('aria-hidden', 'true');
  d.innerHTML = '<svg width="52" height="52" viewBox="0 0 52 52"><path d="M13 27l9 9 17-19"/></svg>';
  return d;
}

/** Cifras del cierre (aciertos, minutos de hoy, días seguidos): cada una sube hasta su valor. */
function cifras(stats, animar) {
  return h('div.stats', stats.map(({ n, txt }) => {
    const b = h('b');
    if (animar) contar(b, n); else b.textContent = String(n);
    return h('div.stat', b, h('span', txt));
  }));
}

/**
 * Pantalla de cierre de una actividad, como en la maqueta: marca de hecho (o de «a repasar»), título, cifras que suben,
 * lo ganado y los botones.
 * @param {{ icono: string, titulo: string, lineas?: string[], siguiente?: object, tit: string, stats?: {n:number, txt:string}[],
 *   logros?: string[], botones?: Node[], animar?: boolean }} o  icono '💪' = resultado flojo; cualquier otro, hecho.
 */
export function cierre({ icono, titulo, lineas = [], siguiente = null, tit, logros = [], animar = true, stats = null, botones = null, meta = null }) {
  const flojo = icono === '💪';
  return h('section.cierre',
    flojo ? h('div.fin-icono', icono_('repaso')) : marcaHecho(),
    h('h1', titulo),
    lineas.length ? h('div.lineas', lineas.map((l) => h('p', l))) : null,
    stats?.length ? cifras(stats, animar) : meta,
    // Lo ganado en esta sesión (clase vista, aciertos, avance del tema).
    logros.length ? h('ul.logros', logros.map((l) => h('li', icono_('ok'), h('span', l)))) : null,
    h('div.botones', botones ?? [
      siguiente ? h('a.btn.grande', { href: hrefActividad(tit, siguiente) }, `Seguir: ${siguiente.titulo} (${siguiente.minutos} min)`) : null,
      h('a.btn.secondary.grande', { href: tlink(tit) }, 'Terminar por hoy')]),
  );
}

/** Cifras de siempre en un cierre: los aciertos de «7 de 10» (si el título lo es), los minutos de hoy y la racha. */
export function cifrasCierre(progress, titulo = '') {
  const m = /^(\d+) de (\d+)$/.exec(titulo);
  const racha = progress.racha();
  return [m ? { n: Number(m[1]), txt: `de ${m[2]} aciertos` } : null,
    { n: progress.minutosHoy(), txt: 'minutos hoy' },
    { n: racha, txt: racha === 1 ? 'día seguido' : 'días seguidos' }].filter(Boolean);
}

/** Coloca el cierre en `cont` cuando el plan recalculado esté listo (primero se pinta sin «Seguir»). */
export function pintarCierre(cont, progress, tit, o) {
  const extra = o.extra ? [o.extra] : []; // lo que va debajo del cierre (se conserva al repintar)
  const stats = cifrasCierre(progress, o.titulo);
  cont.replaceChildren(cierre({ ...o, tit, stats }), ...extra);
  calcularPlan(progress, tit).then((d) => {
    const logros = [...(o.logros ?? [])];
    // El avance del tema de la actividad, si se sabe.
    const b = o.ut != null ? d.estructura.bloques.find((x) => x.ut === o.ut) : null;
    if (b) {
      const e = estadoTema(b, d.curso, d.preguntas, d.regs, d.respuestas, d.ahora);
      if (e.clases.total) logros.push(`${b.titulo}: llevas ${e.clases.terminadas} de ${e.clases.total} clases`);
    }
    if (cont.isConnected || cont.parentNode) cont.replaceChildren(cierre({ ...o, tit, siguiente: d.plan[0], stats, logros, animar: false }), ...extra);
  }).catch(() => {});
}
