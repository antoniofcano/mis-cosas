// Cierre de sesión (final de una clase, una tanda de preguntas…) y utilidades del recomendador en la interfaz.

import { h } from './dom.js';
import { TITULACIONES, tlink, currentEje } from './titulacion.js';
import { cargarBanco, cargarCurso } from '../bancos/index.js';
import { estadoTema } from '../course/plan.js';
import { estadoAlumno } from '../course/motor.js';
import { randomSeed } from '../math/rng.js';
import { contar } from './movimiento.js';
import { icono as icono_ } from './iconos.js';
import { cuenta } from '../texto.js';
import { botonesSesion, pantallaActual } from './sesion.js';

/**
 * El estado del alumno para una titulación (motor de seguimiento, src/course/motor.js): carga los datos, llama al
 * motor y guarda el plan base si el motor ha hecho uno nuevo. Las pantallas leen `st` y nada más.
 * Devuelve también los datos compartidos, el banco del eje y `plan` = las actividades del día.
 */
export async function calcularPlan(progress, tit, ahora = Date.now(), { guardar = true } = {}) {
  const T = TITULACIONES[tit];
  const eje = currentEje(progress);
  // El banco del eje (sus preguntas para estudiar) y el curso con la práctica de cada clase de ese banco.
  const [curso, banco] = await Promise.all([cargarCurso(tit, eje), cargarBanco(eje, tit)]);
  const delEje = (x) => (x.tit ?? 'per') === tit && x.eje === banco.eje.id;
  const tc = progress.testEnCurso();
  const st = estadoAlumno({
    tit, estructura: T.estructura, curso, preguntas: banco.estudio, regs: progress.lecciones(), respuestas: progress.get().exams,
    tests: progress.tests().filter(delEje), testEnCurso: tc && delEje(tc) ? tc : null,
    settings: progress.settings(), minutosHoy: progress.minutosHoy(ahora), racha: progress.racha(ahora), planGuardado: progress.planEstudio(tit), ahora,
    // El examen final: la reserva del alumno (lo que no se estudia) y sus convocatorias.
    reserva: banco.reserva, pool: banco.final, reservadas: banco.reservadas,
  });
  if (guardar && st.plan?.nuevo) progress.setPlanEstudio(tit, st.plan.base); // sin guardar: para mirar otro día (el de mañana)
  return { ...st.datos, banco, plan: st.actividades, st };
}

/** Enlace a una actividad del plan (las tandas de preguntas llevan su semilla para poder recargarlas). */
export function hrefActividad(tit, a) {
  const query = a.ruta[0] === 'teoria' ? { s: String(randomSeed()), ...(a.query ?? {}) } : a.query;
  return tlink(tit, a.ruta, query);
}

/** Tipo de actividad → [icono de línea, nombre]. */
export const TIPO_TXT = {
  clase: ['clase', 'Clase'], chuleta: ['temario', 'Chuleta del tema'], preguntas: ['lapiz', 'Preguntas'], repaso: ['repaso', 'Repaso'], fallos: ['aviso', 'Repaso de fallos'],
  simulacro: ['examen', 'Simulacro de examen'], mezclado: ['repaso', 'Repaso mezclado'], 'examen-en-curso': ['reloj', 'Examen a medias'], final: ['examen', 'Examen final'],
};

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
  // Dentro de una sesión de estudio (src/ui/sesion.js): este paso queda hecho y lo primero es seguir con la sesión;
  // los botones propios de la vista (seguir con el tramo…) quedan como secundarios, salvo «Terminar por hoy».
  const ses = botonesSesion();
  if (ses) {
    const hoy = tlink(tit);
    botones = [...ses, ...(botones ?? []).filter((b) => b && b.getAttribute?.('href') !== hoy).map((b) => { b.classList.add('secondary'); return b; })];
  }
  return h('section.cierre',
    flojo ? h('div.fin-icono', icono_('repaso')) : marcaHecho(),
    h('h1', titulo),
    lineas.length ? h('div.lineas', lineas.map((l) => h('p', l))) : null,
    stats?.length ? cifras(stats, animar) : meta,
    // Lo ganado en esta sesión (clase vista, aciertos, avance del tema).
    logros.length ? h('ul.logros', logros.map((l) => h('li', { class: /^0 de /.test(l) ? 'neutro' : '' }, icono_(/^0 de /.test(l) ? 'lapiz' : 'ok'), h('span', l)))) : null,
    h('div.botones', botones ?? [
      siguiente ? h('a.btn.grande', { href: hrefActividad(tit, siguiente) }, `Seguir: ${siguiente.titulo} (${siguiente.minutos} min)`) : null,
      h('a.btn.secondary.grande', { href: tlink(tit) }, 'Terminar por hoy')]),
  );
}

/** Cifras de siempre en un cierre: los aciertos de «7 de 10» (si el título lo es), los minutos de hoy y la racha. */
export function cifrasCierre(progress, titulo = '') {
  const m = /^(\d+) de (\d+)$/.exec(titulo);
  const racha = progress.racha();
  return [m ? { n: Number(m[1]), txt: `de ${cuenta(m[2], 'acierto')}` } : null,
    { n: progress.minutosHoy(), txt: 'minutos hoy' },
    { n: racha, txt: racha === 1 ? 'día seguido' : 'días seguidos' }].filter(Boolean);
}

/** Coloca el cierre en `cont` cuando el plan recalculado esté listo (primero se pinta sin «Seguir»). */
export function pintarCierre(cont, progress, tit, o) {
  const extra = o.extra ? [o.extra] : []; // lo que va debajo del cierre (se conserva al repintar)
  const stats = cifrasCierre(progress, o.titulo);
  cont.replaceChildren(cierre({ ...o, tit, stats }), ...extra);
  const pantalla = pantallaActual();
  calcularPlan(progress, tit).then((d) => {
    // Si ya se ha ido a otra pantalla (p. ej. al paso siguiente de la sesión), este cierre no se vuelve a pintar.
    if (pantallaActual() !== pantalla) return;
    const logros = [...(o.logros ?? [])];
    // El avance del tema de la actividad, si se sabe.
    const b = o.ut != null ? d.estructura.bloques.find((x) => x.ut === o.ut) : null;
    if (b) {
      const e = d.st.temas.find((x) => x.b.ut === b.ut).e; // del motor
      if (e.clases.total) logros.push(`${b.titulo}: llevas ${e.clases.terminadas} de ${cuenta(e.clases.total, 'clase')}`);
    }
    // Lo fallado vuelve, y se dice cuándo (repaso espaciado).
    if (d.st.repaso.manana) logros.push(`Mañana repasas ${cuenta(d.st.repaso.manana, 'pregunta que has fallado', 'preguntas que has fallado')}: vuelven para que se te queden.`);
    if (cont.isConnected || cont.parentNode) cont.replaceChildren(cierre({ ...o, tit, siguiente: d.plan[0], stats, logros, animar: false }), ...extra);
  }).catch(() => {});
}
