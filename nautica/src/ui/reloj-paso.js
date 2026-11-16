// Reloj del paso a paso y de las preguntas de carta de la práctica (R-64): tiempo transcurrido, objetivo por problema,
// barra hacia el objetivo, tiempo de cada paso y pausa. Solo cuenta con la pestaña visible y sin pausa (el criterio de
// src/ui/reloj-visible.js). La lógica pura, en src/course/reloj-paso.js; el objetivo, el de «Tu velocidad en carta».
// Nunca en un examen ni en un simulacro (ya tienen su reloj): quien lo pone decide dónde.

import { h } from './dom.js';
import { icono } from './iconos.js';
import { relojVisible } from './reloj-visible.js';
import { TITULACIONES } from '../theory/blocks.js';
import { loadEstrategia } from '../store/datasets.js';
import { mmssCorto } from '../course/velocidad.js';
import { objetivoPorProblema, fraccionObjetivo, estadoReloj, ESTADOS_RELOJ, textoPasoHecho, cronoPasos } from '../course/reloj-paso.js';

let objetivos = null;
/** El objetivo por problema de carta de una titulación (promesa; null si no se puede calcular). Una sola carga por sesión. */
export function objetivoDeTit(tit) {
  const T = TITULACIONES[tit];
  if (!T) return Promise.resolve(null);
  objetivos ??= new Map();
  if (!objetivos.has(tit)) objetivos.set(tit, loadEstrategia().then((d) => objetivoPorProblema(T, d?.tiempo)).catch(() => objetivoPorProblema(T)));
  return objetivos.get(tit);
}

/**
 * @param {object} o
 * @param {string} [o.tit]       titulación (para el objetivo); sin ella, solo el tiempo
 * @param {boolean} [o.compacto] una sola línea (preguntas de carta de la práctica)
 * @param {() => boolean} [o.vivo]  la vista sigue en pantalla (si no, el reloj se para solo)
 * @param {boolean} [o.pasos]    con la lista de pasos hechos (paso a paso)
 * @returns {{ el: HTMLElement, segundos: () => number, parar: () => number, reinicia: () => void, marcaPaso: (ok?: boolean) => number }}
 */
export function relojPaso({ tit = null, compacto = false, vivo = () => true, pasos = false } = {}) {
  let reloj = relojVisible({ vivo });
  const crono = cronoPasos();
  let objetivo = null;
  let parado = false;
  let timer = null;
  let nPasos = 0;

  const tiempo = h('span.rp-tiempo', '0:00');
  const meta = h('span.rp-meta.small.muted');
  const estado = h('span.rp-estado.small', { 'aria-live': 'polite' });
  const barra = h('span.rp-barra-in');
  const boton = h('button.rp-pausa.secondary', { type: 'button', 'aria-label': 'Pausar el reloj', 'aria-pressed': 'false', onclick: () => alternar() }, icono('pausa'));
  const lista = pasos ? h('ul.rp-pasos.small') : null;
  // Las explicaciones, plegadas: en el móvil el reloj tiene que ocupar una línea, no media pantalla.
  const nota = h('details.rp-nota.small.muted', h('summary', 'Sobre el reloj'),
    h('p', 'Se para con la pausa y cuando la pestaña no está a la vista. Sigue contando mientras miras las ayudas.'));
  const el = h('div.reloj-paso', { class: compacto ? 'compacto' : '', role: 'group', 'aria-label': 'Reloj de la pregunta' },
    h('div.rp-fila', h('span.rp-ico', { 'aria-hidden': 'true' }, icono('reloj')), tiempo, meta, estado, boton),
    h('div.rp-barra', { 'aria-hidden': 'true' }, barra),
    lista, compacto ? null : nota);

  function pinta() {
    const s = reloj.segundos();
    tiempo.textContent = mmssCorto(Math.floor(s));
    const f = fraccionObjetivo(s, objetivo?.s);
    barra.style.width = `${Math.min(100, (f ?? 0) * 100).toFixed(1)}%`;
    const e = estadoReloj(s, objetivo?.s);
    el.dataset.estado = e ?? '';
    estado.textContent = reloj.enPausa() ? 'en pausa' : e ? ESTADOS_RELOJ[e] : '';
  }
  function alternar() {
    if (parado) return;
    const pausar = !reloj.enPausa();
    if (pausar) reloj.pausar(); else reloj.reanudar();
    boton.setAttribute('aria-label', pausar ? 'Reanudar el reloj' : 'Pausar el reloj');
    boton.setAttribute('aria-pressed', String(pausar));
    boton.replaceChildren(icono(pausar ? 'play' : 'pausa'));
    el.classList.toggle('en-pausa', pausar);
    pinta();
  }
  function tic() {
    if (!el.isConnected && timer != null) { cancela(); return; }
    pinta();
  }
  const cancela = () => { if (timer != null) { clearInterval(timer); timer = null; } };
  function arranca() { cancela(); if (typeof setInterval === 'function') timer = setInterval(tic, 1000); }

  if (tit) objetivoDeTit(tit).then((ob) => { objetivo = ob; if (ob) { meta.textContent = `objetivo ${mmssCorto(ob.s)}`; el.title = ob.texto; if (!compacto) nota.append(h('p.small.muted', ob.texto)); } pinta(); });
  arranca();
  pinta();

  return {
    el,
    segundos: () => reloj.segundos(),
    /** Para el reloj y devuelve los segundos contados. */
    parar() { parado = true; cancela(); const s = reloj.parar(); el.classList.add('parado'); boton.disabled = true; pinta(); return s; },
    reinicia() {
      cancela(); reloj.parar(); reloj = relojVisible({ vivo }); crono.reinicia(); parado = false; nPasos = 0;
      lista?.replaceChildren(); el.classList.remove('parado', 'en-pausa'); boton.disabled = false; boton.setAttribute('aria-pressed', 'false');
      boton.setAttribute('aria-label', 'Pausar el reloj'); boton.replaceChildren(icono('pausa'));
      arranca(); pinta();
    },
    /** Apunta un paso hecho en la lista («paso 1 · 0:48 ✓») y devuelve lo que se tardó en él. */
    marcaPaso(ok = false) {
      const d = crono.marca(reloj.segundos());
      nPasos += 1;
      lista?.append(h('li', textoPasoHecho(nPasos, d, ok)));
      return d;
    },
  };
}
