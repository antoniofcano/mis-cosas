// Resolución paso a paso (reutilizable): una tarjeta por paso —título, regla, texto corto, la cuenta en monoespaciada y
// su dibujo— con «Anterior» y «Siguiente», o todas las tarjetas apiladas con «Ver todos los pasos». Accesible: el
// cambio de paso se anuncia (aria-live), el foco va al título del paso nuevo, los botones miden al menos 44 px y no hay
// animación (nada depende del movimiento; prefers-reduced-motion no tiene nada que quitar).
//
//   pasosEl({ pasos: [{ titulo, regla?, texto?, cuenta?: string[] }], figura: (i) => svg | null, leyenda: (i) => texto,
//             inicio?: 1…n, todos?: bool, onCambio?: (i, todos) => void, nombre?: string })
//   → { el, ir(i), modo(todos), estado() }

import { h, setChildren } from './dom.js';
import { cuenta } from '../texto.js';

/** Una tarjeta de paso (también se usa apilada). */
function tarjeta(p, i, n, figura, leyenda, { foco = false } = {}) {
  const svg = figura(i);
  const fig = svg ? h('figure.cps-figura', h('div.cps-dibujo', { html: svg }), leyenda(i) ? h('figcaption', leyenda(i)) : null) : null;
  return h('article.cps-paso', { 'data-paso': String(i) },
    h('h3.cps-titulo', foco ? { tabindex: '-1' } : {}, h('span.cps-num', { 'aria-hidden': 'true' }, String(i)), h('span.sr', `Paso ${i} de ${n}: `), p.titulo),
    p.regla ? h('p.cps-regla', h('strong', 'Regla. '), p.regla) : null,
    p.texto ? h('p.cps-texto', p.texto) : null,
    p.cuenta?.length ? h('div.cps-cuenta', { role: 'group', 'aria-label': 'La cuenta' }, p.cuenta.map((c) => h('code', c))) : null,
    fig);
}

export function pasosEl({ pasos, figura, leyenda = () => null, inicio = 1, todos = false, onCambio = () => {}, nombre = 'Resolución paso a paso' }) {
  const n = pasos.length;
  let i = Math.min(Math.max(1, Number(inicio) || 1), n);
  let apilados = !!todos;
  const anuncio = h('p.cps-estado', { 'aria-live': 'polite', 'aria-atomic': 'true' });
  const progreso = h('ol.cps-progreso', { 'aria-hidden': 'true' }, pasos.map((_, j) => h('li')));
  const botonModo = h('button.secondary.small.cps-modo', { type: 'button', 'aria-pressed': 'false', onclick: () => modo(!apilados, true) });
  const cuerpo = h('div.cps-cuerpo');
  const anterior = h('button.secondary.cps-ant', { type: 'button', onclick: () => ir(i - 1, true) }, '← Anterior');
  const siguiente = h('button.cps-sig', { type: 'button', onclick: () => ir(i + 1, true) }, 'Siguiente →');
  const nav = h('div.cps-nav', anterior, siguiente);
  const el = h('section.cps', { 'aria-label': nombre }, h('div.cps-barra', anuncio, botonModo), progreso, cuerpo, nav);

  function pinta(enfocar) {
    botonModo.textContent = apilados ? 'Ver paso a paso' : 'Ver todos los pasos';
    botonModo.setAttribute('aria-pressed', apilados ? 'true' : 'false');
    el.classList.toggle('apilados', apilados);
    progreso.hidden = apilados;
    nav.hidden = apilados;
    if (apilados) {
      anuncio.textContent = `${cuenta(n, 'paso')}, uno detrás de otro.`;
      setChildren(cuerpo, pasos.map((p, j) => tarjeta(p, j + 1, n, figura, leyenda)));
      return;
    }
    anuncio.textContent = `Paso ${i} de ${n}: ${pasos[i - 1].titulo}`;
    [...progreso.children].forEach((li, j) => { li.className = j + 1 < i ? 'hecho' : j + 1 === i ? 'actual' : ''; });
    const t = tarjeta(pasos[i - 1], i, n, figura, leyenda, { foco: true });
    setChildren(cuerpo, t);
    anterior.disabled = i <= 1;
    siguiente.disabled = i >= n;
    siguiente.textContent = i >= n ? 'Último paso' : 'Siguiente →';
    if (enfocar) {
      const titulo = t.querySelector('.cps-titulo');
      titulo?.focus({ preventScroll: true });
      if (typeof el.scrollIntoView === 'function' && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
    }
  }

  function ir(k, enfocar = false) {
    const nuevo = Math.min(Math.max(1, k), n);
    if (nuevo === i && !apilados) return;
    i = nuevo;
    apilados = false;
    pinta(enfocar);
    onCambio(i, apilados);
  }

  function modo(todosLosPasos, enfocar = false) {
    apilados = !!todosLosPasos;
    pinta(false);
    if (enfocar) botonModo.focus();
    onCambio(i, apilados);
  }

  pinta(false);
  return { el, ir, modo, estado: () => ({ paso: i, todos: apilados }) };
}
