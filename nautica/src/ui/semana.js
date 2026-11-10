// «La semana antes» en la interfaz (src/course/semana.js tiene la lógica): calcula el modo y el plan con los datos del
// alumno (el resultado de calcularPlan), guarda el ajuste `semana_<tit>` (compartido entre aparatos) y pinta las piezas
// que comparten Hoy, la vista #/<tit>/semana y el resumen de la sesión.

import { h, setChildren } from './dom.js';
import { TITULACIONES, tlink } from './titulacion.js';
import { leerSesion } from './sesion.js';
import { componerSesion, deducirFase } from '../course/sesion.js';
import { mazos, tarjetasPorRepasar } from '../course/tarjetas.js';
import {
  claveSemana, leerAjuste, estadoModo, ideasPriorizadas, temasPriorizados, planSemana, sesionDeSemana, apuntarHecho,
  salirDelModo, volverAlModo, activarManual, responderComoFue, textoTrasExamen, RESPUESTAS_FUE, DIAS_MODO,
} from '../course/semana.js';
import { cuenta, diaISO, fechaLarga } from '../texto.js';

/** El ajuste del modo, normalizado. */
export const ajusteSemana = (progress, tit) => leerAjuste(progress.settings()[claveSemana(tit)]);
const guardar = (progress, tit, a) => progress.setSetting(claveSemana(tit), a);

/** El mazo de tarjetas para cuando no toca repasar ninguna: el que menos sabe (a igualdad, el primero). */
function mazoSugerido(tit, respuestas) {
  const ms = mazos(tit);
  const sabidas = (m) => m.cartas.filter((c) => respuestas[c.clave]?.ok === true).length / Math.max(1, m.cartas.length);
  const m = [...ms].sort((a, b) => sabidas(a) - sabidas(b))[0];
  return m ? { id: m.id, titulo: m.titulo } : null;
}

/**
 * El modo y el plan de la semana del alumno.
 * @param {object} d  el resultado de calcularPlan (src/ui/cierre.js)
 * @returns {{ estado, ajuste, ideas, temas, plan: object|null, comp: object|null }}
 */
export function calcularSemana(progress, tit, d, ahora = Date.now()) {
  const T = TITULACIONES[tit];
  const { st } = d;
  const ajuste = ajusteSemana(progress, tit);
  const estado = estadoModo({ ajuste, fechaExamen: st.fechaExamen, orientativa: st.orientativa, ahora });
  const base = { estructura: T.estructura, preguntas: d.banco.practica, respuestas: d.respuestas, reservadas: d.banco.reservadas };
  const ideas = ideasPriorizadas({ ic: d.indiceConceptos, ...base });
  const temas = temasPriorizados(base);
  if (!estado.activo) return { estado, ajuste, ideas, temas, plan: null, comp: null };
  const hoy = diaISO(ahora);
  const plan = planSemana({
    estructura: T.estructura, dias: estado.dias, hoy, fecha: estado.fecha, minutosDia: st.dia.objetivo, ideas, temas,
    fallosHoy: st.repaso.hoy, tarjetasHoy: tarjetasPorRepasar(mazos(tit), d.respuestas, hoy).length, mazo: mazoSugerido(tit, d.respuestas),
    cartaUt: T.cartaUt ?? null, tests: d.tests, hechos: ajuste.hechos, finalSugerido: !!(st.final?.desbloqueado && st.final?.sugerir),
  });
  return { estado, ajuste, ideas, temas, plan, comp: sesionDeSemana(plan) };
}

/** La sesión que arranca «Seguir» en Hoy y en la Travesía: la del plan de la semana si el modo está activo. */
export function composicionDeHoy(progress, tit, d) {
  return calcularSemana(progress, tit, d).comp ?? componerSesion(d.st, deducirFase(d.st).id);
}

/**
 * Si la sesión de hoy era la de un día de la semana y ya está hecha (con algún paso hecho), apunta el día como hecho.
 * Devuelve true si ha cambiado algo.
 */
export function apuntarSemana(progress, tit, ahora = Date.now()) {
  const s = leerSesion(progress, tit, ahora);
  if (!s?.semana || s.estado !== 'hecha' || !s.pasos.some((p) => p.estado === 'hecho')) return false;
  const a = ajusteSemana(progress, tit);
  if (a.hechos[s.dia] === s.semana) return false;
  guardar(progress, tit, apuntarHecho(a, s.dia, s.semana));
  return true;
}

const repintar = () => dispatchEvent(new HashChangeEvent('hashchange'));

/** Salir del modo (con confirmación: es fácil de deshacer, pero no se quiere por un toque sin querer). */
export function botonSalir(progress, tit, estado, { clase = 'button.linklike.semana-salir' } = {}) {
  return h(clase, { type: 'button', onclick: () => {
    if (!confirm('¿Salir del modo «la semana antes»? Hoy volverá a proponerte la sesión de siempre. Puedes volver cuando quieras.')) return;
    guardar(progress, tit, salirDelModo(ajusteSemana(progress, tit), estado));
    repintar();
  } }, 'Salir del modo semana');
}

/** Volver al modo tras haber salido. */
export function botonVolver(progress, tit, { clase = 'button.linklike' } = {}) {
  return h(clase, { type: 'button', onclick: () => { guardar(progress, tit, volverAlModo(ajusteSemana(progress, tit))); repintar(); } }, 'Volver al modo semana del examen');
}

/** Activar a mano: quedan `dias` días. */
export function activarSemana(progress, tit, dias) {
  guardar(progress, tit, activarManual(ajusteSemana(progress, tit), dias, Date.now()));
}

/**
 * «¿Cómo te fue el examen?»: cuatro respuestas y «Ahora no» (que también cuenta: no se vuelve a preguntar). Tras
 * contestar, una línea breve. Sin obligar a nada.
 */
export function tarjetaComoFue(progress, tit, { fecha }) {
  const T = TITULACIONES[tit];
  const caja = h('section.semana-fue', { 'aria-labelledby': `semana-fue-${tit}` });
  const responder = (r) => {
    guardar(progress, tit, responderComoFue(ajusteSemana(progress, tit), fecha, r));
    setChildren(caja, h('p.semana-fue-gracias', { role: 'status' }, textoTrasExamen(r)),
      r === 'suspenso' ? h('p', h('a', { href: '#/ajustes?campo=fecha' }, 'Poner la fecha del próximo examen')) : null);
  };
  setChildren(caja,
    h('h2', { id: `semana-fue-${tit}` }, `¿Cómo te fue el examen de ${T.sigla}?`),
    h('p.muted.small', `Era el ${fechaLarga(fecha, { diaSemana: false })}. Contestar es voluntario: solo sirve para que Hoy te proponga lo que toca ahora.`),
    h('div.semana-fue-botones', { role: 'group', 'aria-label': 'Cómo te fue' },
      ['aprobado', 'suspenso', 'no-se'].map((r) => h('button.secondary', { type: 'button', onclick: () => responder(r) }, RESPUESTAS_FUE[r])),
      h('button.linklike', { type: 'button', onclick: () => responder('omitido') }, 'Ahora no')));
  return caja;
}

/** Selector para activar el modo a mano: cuántos días quedan (1–7). */
export function activarAMano(progress, tit, { alActivar = repintar } = {}) {
  const sel = h('select#semana-dias', DIAS_SEMANA_OPC.map((n) => h('option', { value: String(n), selected: n === DIAS_MODO }, n === 1 ? 'Mañana' : `Dentro de ${cuenta(n, 'día')}`)));
  return h('form.semana-activar', { onsubmit: (ev) => { ev.preventDefault(); activarSemana(progress, tit, Number(sel.value)); alActivar(); } },
    h('label', { for: 'semana-dias' }, '¿Cuándo es tu examen?'),
    h('div.semana-activar-fila', sel, h('button', { type: 'submit' }, 'Empezar la semana')));
}
const DIAS_SEMANA_OPC = Array.from({ length: DIAS_MODO }, (_, i) => i + 1);

/** Enlace a la vista de la semana. */
export const enlaceSemana = (tit, texto = 'Ver la semana') => h('a.semana-ver', { href: tlink(tit, ['semana']) }, texto, h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›'));
