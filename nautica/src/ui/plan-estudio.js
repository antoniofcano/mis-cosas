// Plan de estudio con fecha en la interfaz: mantiene el plan base guardado al día con la fecha y los minutos de
// Ajustes y devuelve su seguimiento.

import { h } from './dom.js';
import { icono } from './iconos.js';
import { crearPlan, temasDePocoPeso } from '../course/calendario.js';

/**
 * El plan con fecha y su seguimiento, tal como lo calcula el motor (calcularPlan → st.plan).
 * @returns {{ plan, seg, alt } | null} null si no hay fecha de examen (o ya pasó).
 */
export function planConSeguimiento(progress, tit, datos) {
  const p = datos.st?.plan;
  return p ? { plan: p.base, seg: p.seg, alt: p.alt } : null;
}

/** Rehace el plan base desde hoy (acepta lo que se haya quedado atrás y lo vuelve a repartir). */
export function rehacerPlan(progress, tit, datos) {
  const s = progress.settings();
  const d = { ...datos, esencial: !!s[`planEsencial_${tit}`], chuletasLeidas: s[`chuletasLeidas_${tit}`] ?? [] };
  progress.setPlanEstudio(tit, crearPlan(d, { fechaExamen: s[`examen_${tit}`] || null, minutosDia: s.minutosDia ?? 20, diasEstudio: s.diasEstudio ?? 'todos', ahora: datos.ahora }));
}

/**
 * Si no da tiempo, las alternativas de un toque: subir los minutos y, si la titulación tiene temas de poco peso,
 * el plan esencial (con lo que ahorra y los minutos con los que se llega). `ps` = planConSeguimiento.
 */
export function botonSubirMinutos(progress, ps, alCambiar, tit) {
  const { seg, alt } = ps;
  if (seg.estado !== 'no-llega') return null;
  const m = seg.futuro.minutosNecesarios;
  const md = ps.plan.minutosDia;
  return h('div.alternativas',
    h('button.secondary.subir-minutos', { type: 'button', onclick: () => { progress.setSetting('minutosDia', m); alCambiar(); } }, `Subir a ${m} minutos al día`),
    alt ? h('button.secondary.plan-esencial', { type: 'button', onclick: () => { progress.setSetting(`planEsencial_${tit}`, true); alCambiar(); } },
      `Plan esencial: ${alt.llega ? `llegas con tus ${md} minutos` : `llegas con ${alt.minutosNecesarios} minutos`}`) : null,
    alt ? h('p.muted.small', `El plan esencial estudia enteros los temas que más pesan en el examen; en los de poco peso cambia las clases por la chuleta del tema y sus preguntas (ahorras unas ${Math.round(alt.ahorro / 60)} horas).`) : null);
}

/** Aviso del plan esencial activo, con la vuelta al completo. */
export function avisoEsencial(progress, tit, estructura, alCambiar) {
  if (!progress.settings()[`planEsencial_${tit}`]) return null;
  const temas = estructura.bloques.filter((b) => temasDePocoPeso(estructura).includes(b.ut)).map((b) => b.titulo);
  return h('p.muted.small.aviso-esencial', `Plan esencial: ${temas.join(', ')} por chuleta y preguntas. `,
    h('button.linklike.descartar', { type: 'button', onclick: () => { progress.setSetting(`planEsencial_${tit}`, false); alCambiar(); } }, 'Volver al plan completo'));
}

/**
 * Icono y clase de la línea del plan según su estado. Tono neutro: ir por detrás no es una alarma (se recupera en
 * los próximos días); solo «no llegas» se marca, porque pide decidir algo.
 */
export const marcaEstado = (estado) => [h('span.marca-estado', icono(estado === 'al-dia' || estado === 'terminado' ? 'ok' : 'reloj'), ' '), estado === 'no-llega' ? 'warn' : ''];
