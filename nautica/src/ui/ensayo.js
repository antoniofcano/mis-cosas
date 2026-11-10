// Ensayo general en papel (R-41), la parte que corre con el reloj: el cuadernillo en pantalla (solo los enunciados,
// numerados), el reloj del tribunal y, al terminar, la hoja de respuestas. La lógica, sin DOM, en src/theory/ensayo.js;
// la vista del examen (src/ui/views/theory.js, testView) lo arranca y corrige; la preparación y el cuadernillo
// imprimible, en src/ui/views/ensayo.js.
//
// Como el examen: aquí no hay mesa de cartas, ni bloc, ni calculadora de la app, ni glosas, ni nada de la práctica
// (src/theory/ensayo.js, SIN_AYUDAS; tests/ensayo.test.js comprueba que este fichero no importa ninguna de esas piezas).
// El reloj solo corre con la pestaña visible (el criterio de la vista del examen).

import { h, setChildren } from './dom.js';
import { urlFigura } from '../bancos/index.js';
import { barraActividad, avisoBreve } from './actividad.js';
import { icono, conIcono } from './iconos.js';
import { cuenta } from '../texto.js';
import { letrasDe, leerHoja } from '../theory/ensayo.js';

const GUARDAR_CADA_MS = 10000;

/** «mm:ss» de unos milisegundos (sin negativos). */
export const mmss = (ms) => {
  const r = Math.max(0, ms);
  return `${String(Math.floor(r / 60000)).padStart(2, '0')}:${String(Math.floor((r % 60000) / 1000)).padStart(2, '0')}`;
};

/**
 * Una pregunta como en el cuadernillo de papel: número, enunciado común y contexto, enunciado, figuras y opciones con su
 * letra. Sin nada que tocar (se contesta en el papel). Sirve para la pantalla y para imprimir.
 */
export function preguntaPapel(q, n, { comunPrevio = null } = {}) {
  return h('article.ep-pregunta', { 'aria-labelledby': `ep-q${n}` },
    q.enunciado_comun && q.enunciado_comun !== comunPrevio ? h('p.ep-comun', q.enunciado_comun) : null,
    q.contexto ? h('pre.ep-contexto', q.contexto) : null,
    h('p.ep-enunciado', { id: `ep-q${n}` }, h('span.ep-num', `${n}.`), ' ', q.enunciado),
    (q.figuras ?? []).map((f) => h('img.ep-fig', { src: urlFigura(q, f), alt: /tabla-mareas/.test(f) ? 'Tabla de corrección de la altura de la marea' : `Figura de la pregunta ${n}`, loading: 'lazy' })),
    h('ul.ep-opciones', letrasDe(q).map((k) => {
      const fig = q.opciones_figuras?.[k];
      return h('li', h('span.ep-letra', `${k})`), ' ', q.opciones[k], fig ? h('img.ep-fig.opt', { src: urlFigura(q, fig), alt: `Figura de la opción ${k}`, loading: 'lazy' }) : null);
    })));
}

/** Todas las preguntas del cuadernillo, numeradas (el enunciado común solo la primera vez que sale). */
export function cuadernillo(preguntas) {
  let comun = null;
  return h('div.ep-cuadernillo', preguntas.map((q, i) => {
    const el = preguntaPapel(q, i + 1, { comunPrevio: comun });
    comun = q.enunciado_comun ?? null;
    return el;
  }));
}

/**
 * Hoja de respuestas en blanco para imprimir: una fila por número con las cuatro casillas (a b c d).
 * @param {object[]} preguntas
 */
export function hojaEnBlanco(preguntas) {
  return h('table.ep-hoja-papel',
    h('caption', 'Hoja de respuestas'),
    h('thead', h('tr', h('th', { scope: 'col' }, 'N.º'), ['a', 'b', 'c', 'd'].map((l) => h('th', { scope: 'col' }, l)))),
    h('tbody', preguntas.map((q, i) => h('tr', h('th', { scope: 'row' }, String(i + 1)), ['a', 'b', 'c', 'd'].map((l) => h('td', letrasDe(q).includes(l) ? h('span.ep-casilla', { 'aria-label': `${i + 1} ${l}` }) : '—'))))));
}

/**
 * Hoja de respuestas en pantalla: todas las preguntas, una fila por número con sus letras (tocar una la marca; tocarla
 * otra vez la borra). Se rellena de golpe al terminar, como la hoja oficial.
 * @param {{ preguntas: object[], hoja: Record<string,string>, onCambio: (hoja) => void }} o
 */
export function hojaRespuestasEl({ preguntas, hoja, onCambio }) {
  const estado = { ...hoja };
  const cuenta_ = h('p.ep-hoja-cuenta', { 'aria-live': 'polite' });
  const pintaCuenta = () => { cuenta_.textContent = `${Object.values(estado).filter(Boolean).length} de ${cuenta(preguntas.length, 'marcada')}`; };
  const filas = preguntas.map((q, i) => {
    const n = i + 1;
    const botones = letrasDe(q).map((l) => h('button.ep-letra-btn', { type: 'button', 'aria-pressed': String(estado[n] === l), 'aria-label': `Pregunta ${n}: ${l}`,
      onclick: (ev) => {
        estado[n] = estado[n] === l ? null : l;
        for (const b of ev.currentTarget.parentElement.querySelectorAll('button')) b.setAttribute('aria-pressed', String(b.textContent === estado[n]));
        pintaCuenta();
        onCambio({ ...estado });
      } }, l));
    return h('li.ep-hoja-fila', h('span.ep-hoja-num', { 'aria-hidden': 'true' }, String(n)), h('span.ep-hoja-letras', { role: 'group', 'aria-label': `Pregunta ${n}` }, botones));
  });
  pintaCuenta();
  return { el: h('div.ep-hoja', cuenta_, h('ol.ep-hoja-lista', filas)), estado: () => ({ ...estado }) };
}

/**
 * El ensayo en marcha: cuadernillo + reloj y, después, la hoja de respuestas.
 * @param {object} o
 * @param {HTMLElement} o.el  contenedor de la vista
 * @param {object} o.test  { titulo, preguntas }
 * @param {object} o.estado  el examen a medias (progress.testEnCurso()): fase 'papel' | 'hoja', respuestas (la hoja),
 *   consumidoMs, porTiempo
 * @param {number} o.duracionMin
 * @param {object} o.progress
 * @param {() => void} o.alSalir  ir a Hoy
 * @param {(r: { hoja, consumidoMs, porTiempo }) => void} o.onCorregir
 */
export function correrEnsayo({ el, test, estado, duracionMin, progress, alSalir, onCorregir }) {
  const n = test.preguntas.length;
  const limite = duracionMin * 60000;
  let fase = estado.fase === 'hoja' ? 'hoja' : 'papel';
  let hoja = { ...(estado.respuestas ?? {}) };
  let consumido = estado.consumidoMs ?? 0;
  let porTiempo = !!estado.porTiempo;
  let ultimo = Date.now();
  let ultimoGuardado = Date.now();
  let activo = fase === 'papel';
  let terminado = false;
  const reloj = h('span.reloj', { role: 'timer', 'aria-label': 'Tiempo que queda' });
  const barra = barraActividad({ texto: test.titulo, onSalir: salir, derecha: reloj });
  const cuerpo = h('div.ensayo-cuerpo');

  const guardar = () => { if (!terminado) progress.saveTestEnCurso({ ...estado, respuestas: hoja, consumidoMs: estado.impreso ? (estado.consumidoMs ?? null) : Math.round(consumido), fase, porTiempo }); ultimoGuardado = Date.now(); };
  function contar() {
    const ahora = Date.now();
    if (activo && document.visibilityState === 'visible') consumido += ahora - ultimo;
    ultimo = ahora;
  }
  function pintaReloj() {
    if (estado.impreso) { reloj.replaceChildren(); return; }
    const resto = limite - consumido;
    reloj.replaceChildren(icono('reloj', 'ico-t'), mmss(resto));
    reloj.classList.toggle('warn', resto < 5 * 60000);
  }
  // La vista puede pintarse antes de entrar en la página (transición de vistas): se para al salir de ella, no antes.
  let enPagina = false;
  function tick() {
    if (el.isConnected) enPagina = true;
    else if (enPagina) { dejar(); return; }
    contar();
    pintaReloj();
    if (fase === 'papel' && consumido >= limite) { porTiempo = true; aHoja(); return; }
    if (Date.now() - ultimoGuardado >= GUARDAR_CADA_MS) guardar();
  }
  const onVis = () => { contar(); guardar(); };
  const onLeave = () => { if (!el.isConnected) dejar(); };
  const timer = setInterval(tick, 1000);
  document.addEventListener('visibilitychange', onVis);
  window.addEventListener('pagehide', onVis);
  window.addEventListener('hashchange', onLeave);
  function limpiar() {
    activo = false;
    clearInterval(timer);
    document.removeEventListener('visibilitychange', onVis);
    window.removeEventListener('pagehide', onVis);
    window.removeEventListener('hashchange', onLeave);
  }
  function dejar() { contar(); guardar(); limpiar(); }
  function salir() {
    // Empezado sin querer (menos de un minuto y nada en la hoja): se cancela, no se queda «a medias».
    contar();
    if (consumido < 60000 && !Object.values(hoja).some(Boolean)) {
      limpiar();
      progress.saveTestEnCurso(null);
      avisoBreve('Ensayo cancelado: apenas había empezado.');
      alSalir();
      return;
    }
    dejar();
    avisoBreve('Guardado. Puedes seguir cuando quieras (o descartarlo desde Examen).');
    alSalir();
  }

  // --- 1. El cuadernillo: solo enunciados y reloj
  function papel() {
    barra.set(test.titulo, Math.min(1, consumido / limite));
    setChildren(cuerpo,
      h('div.ensayo-aviso', icono('lapiz', 'ico-t'), h('p', h('strong', 'Resuélvelo en papel'), ', con tu carta, tu transportador, tu compás y tu lápiz. Aquí solo tienes los enunciados y el reloj; las respuestas, al final, en la hoja.')),
      h('p.muted.small', `${cuenta(n, 'pregunta')} · ${cuenta(duracionMin, 'minuto')}. El reloj se para si sales de la app.`),
      cuadernillo(test.preguntas),
      h('div.botones-columna.ensayo-fin',
        h('button.grande', { type: 'button', onclick: () => { if (confirm('¿Has terminado? Al pasar a la hoja de respuestas se para el reloj y ya no vuelves a los enunciados.')) aHoja(); } }, conIcono('lista', 'He terminado: a la hoja de respuestas'))));
  }

  function aHoja() {
    contar();
    activo = false;
    fase = 'hoja';
    guardar();
    hojaPantalla();
    window.scrollTo(0, 0);
  }

  // --- 2. La hoja de respuestas (el reloj ya no corre)
  function hojaPantalla() {
    pintaReloj();
    barra.set('Hoja de respuestas', 1);
    const minutos = Math.max(1, Math.round(consumido / 60000));
    const hr = hojaRespuestasEl({ preguntas: test.preguntas, hoja, onCambio: (x) => { hoja = x; guardar(); } });
    setChildren(cuerpo,
      h('h1.ensayo-tit', 'Hoja de respuestas'),
      estado.impreso
        ? h('p.muted', 'Pasa a la hoja lo que marcaste en tu cuadernillo impreso.')
        : porTiempo
        ? h('p.ensayo-aviso.tiempo', icono('reloj', 'ico-t'), h('span', h('strong', 'Se acabó el tiempo. '), 'Suelta el lápiz y pasa a la hoja lo que tengas contestado en el papel, sin terminar nada más.'))
        : h('p.muted', `Has tardado ${cuenta(minutos, 'minuto')} de ${duracionMin}. El reloj está parado: pasa tus respuestas tal como las tienes en el papel.`),
      h('p.muted.small', 'Toca la letra que marcaste en cada pregunta; tócala otra vez para borrarla. Las que dejes sin marcar cuentan como en blanco, igual que en el examen. En el examen de verdad la hoja se rellena dentro del tiempo: deja unos minutos para pasarla.'),
      hr.el,
      h('div.botones-columna',
        h('button.grande', { type: 'button', onclick: () => {
          const { enBlanco } = leerHoja(test, hr.estado());
          if (enBlanco.length && !confirm(`${enBlanco.length === 1 ? 'La pregunta' : 'Las preguntas'} ${enBlanco.join(', ')} ${enBlanco.length === 1 ? 'está' : 'están'} en blanco y ${enBlanco.length === 1 ? 'cuenta' : 'cuentan'} como fallo. ¿Corregir de todos modos?`)) return;
          terminado = true;
          limpiar();
          // Hecho en papel impreso: el tiempo es el que dijo el alumno (o ninguno), no el de la app.
          onCorregir({ hoja: hr.estado(), consumidoMs: estado.impreso ? (estado.consumidoMs ?? null) : Math.round(consumido), porTiempo });
        } }, conIcono('ok', 'Corregir la hoja'))));
  }

  setChildren(el, barra, cuerpo);
  if (fase === 'hoja') { limpiar(); hojaPantalla(); } else { papel(); tick(); }
  window.scrollTo(0, 0);
}
