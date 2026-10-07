// Calculadora científica en pantalla (componente). La lógica está en src/calculadora/motor.js; aquí solo se pinta.
// - botonCalculadora(): botón pequeño y autónomo que la abre (barra de la carta, ejercicios, preguntas de carta y
//   mareas del PY, examen del PY). Se puede poner en cualquier barra sin tocar nada más.
// - Panel flotante único: en el móvil, una hoja acoplada abajo (o arriba) que deja sitio a la página; en pantallas
//   anchas, una ventana que se arrastra por su cabecera. Se minimiza a una barra con el último resultado y, al
//   escribir en una respuesta en el móvil, se minimiza sola para no tapar la casilla (vuelve al salir de ella).
// - Recuerda dónde estaba, si estaba abierta o minimizada, la memoria M, Ans y la última cuenta (en este navegador).
// - Teclado físico: cifras, + − * /, ( ), Intro (=), Retroceso (DEL), Esc (AC)… (teclaDeTeclado en el motor).
// - En un examen en el que no se permite (bloquearCalculadora), se cierra y no se puede abrir mientras dure.

import { h } from './dom.js';
import { pulsar, pantalla, restaurar, guardable, teclaDeTeclado } from '../calculadora/motor.js';
import { avisoBreve } from './actividad.js';

const CLAVE = 'nautica.calculadora.v1';
const ESTRECHA = '(max-width: 700px)';

// ---------------------------------------------------------------------------
// Estado compartido (el panel y la página #/calculadora son la misma calculadora)

function leer() {
  try { return JSON.parse(localStorage.getItem(CLAVE) ?? '{}') ?? {}; } catch { return {}; }
}
function escribir(cambios) {
  try { localStorage.setItem(CLAVE, JSON.stringify({ ...leer(), ...cambios })); } catch { /* sin almacenamiento: no se recuerda */ }
}

let estado = null;
const pintores = new Set();
const calc = () => (estado ??= restaurar(leer().calc));

function tecla(t) {
  estado = pulsar(calc(), t);
  escribir({ calc: guardable(estado) });
  for (const p of pintores) p();
}

// ---------------------------------------------------------------------------
// La calculadora (pantalla de dos líneas y teclado), igual en el panel y en la página

// [tecla, texto, texto con SHIFT, columnas que ocupa, etiqueta para lectores de pantalla]
const FUNCIONES = [
  [['shift', 'SHIFT', null, 1, 'SHIFT (segunda función)'], ['inv', 'x⁻¹', null, 1, 'inverso'], ['sqrt', '√', null, 1, 'raíz cuadrada'], ['sq', 'x²', null, 1, 'al cuadrado'],
    ['gms', '°′″', '←', 1, 'grados, minutos y segundos'], ['pi', 'π', null, 1, 'pi']],
  [['neg', '(−)', null, 1, 'signo menos'], ['sin', 'sin', 'sin⁻¹', 1, 'seno'], ['cos', 'cos', 'cos⁻¹', 1, 'coseno'], ['tan', 'tan', 'tan⁻¹', 1, 'tangente'],
    ['(', '(', null, 1, 'abrir paréntesis'], [')', ')', null, 1, 'cerrar paréntesis']],
  [['mr', 'MR', 'MC', 2, 'recuperar la memoria'], ['m+', 'M+', 'M−', 2, 'sumar a la memoria'], ['m-', 'M−', null, 2, 'restar de la memoria']],
];
const NUMEROS = [
  [['7'], ['8'], ['9'], ['del', 'DEL', null, 1, 'borrar la última tecla'], ['ac', 'AC', null, 1, 'borrar todo']],
  [['4'], ['5'], ['6'], ['×', '×', null, 1, 'por'], ['÷', '÷', null, 1, 'entre']],
  [['1'], ['2'], ['3'], ['+', '+', null, 1, 'más'], ['-', '−', null, 1, 'menos']],
  [['0'], ['.', '.', null, 1, 'punto decimal'], ['ans', 'Ans', null, 1, 'último resultado'], ['=', '=', null, 2, 'igual']],
];

function teclado(filas, clase) {
  return h(`div.calc-teclas.${clase}`, filas.flat().map(([id, texto = id, conShift = null, col = 1, nombre = null]) =>
    h('button.calc-tecla', {
      type: 'button', 'data-tecla': id, style: col > 1 ? `grid-column: span ${col}` : null, 'aria-label': nombre ? `${texto}: ${nombre}${conShift ? ` (con SHIFT, ${conShift})` : ''}` : null,
      class: [/^[0-9.]$/.test(id) ? 'cifra' : '', id === 'shift' ? 'shift' : '', ['ac', 'del'].includes(id) ? 'borra' : '', id === '=' ? 'igual' : ''].filter(Boolean).join(' '),
      // pointerdown no roba el foco de la casilla de respuesta (en el móvil no se cierra el teclado del sistema)
      onpointerdown: (ev) => ev.preventDefault(),
      onclick: () => tecla(id),
    }, conShift ? h('span.calc-shift', conShift) : null, h('span.calc-texto', texto))));
}

/** La calculadora: pantalla (indicadores S, M, D; expresión arriba y resultado abajo) y teclado. */
function aparato() {
  const ind = { s: h('span.calc-ind', 'S'), m: h('span.calc-ind', 'M'), d: h('span.calc-ind', 'D') };
  const arriba = h('div.calc-arriba');
  const abajo = h('div.calc-abajo', { 'aria-live': 'polite' });
  const el = h('div.calc',
    h('div.calc-pantalla', { role: 'status', 'aria-label': 'Pantalla de la calculadora' },
      h('div.calc-indicadores', ind.s, ind.m, ind.d), arriba, abajo),
    teclado(FUNCIONES, 'funciones'),
    teclado(NUMEROS, 'numeros'));
  const pinta = () => {
    const p = pantalla(calc());
    ind.s.classList.toggle('on', p.indicadores.shift);
    ind.m.classList.toggle('on', p.indicadores.m);
    ind.d.classList.toggle('on', p.indicadores.d);
    arriba.textContent = p.arriba;
    abajo.textContent = p.abajo;
    abajo.classList.toggle('error', /ERROR/.test(p.abajo));
    el.classList.toggle('con-shift', p.indicadores.shift);
    arriba.scrollLeft = arriba.scrollWidth;
  };
  pinta();
  return { el, pinta };
}

// ---------------------------------------------------------------------------
// Teclado físico (una sola escucha para el panel y la página)

let pagina = null; // la calculadora de #/calculadora, si está en pantalla
const escribiendo = (t) => t?.closest?.('input, textarea, select, [contenteditable="true"]');

function alTeclear(ev) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey || escribiendo(ev.target)) return;
  const enPagina = pagina?.isConnected;
  if (!enPagina && !(panel && !panel.minimizada() && panel.el.isConnected)) return;
  const t = teclaDeTeclado(ev);
  if (!t) return;
  ev.preventDefault();
  tecla(t);
}

// ---------------------------------------------------------------------------
// Bloqueo en los exámenes en que no se permite

let bloqueo = null;
const bloqueada = () => !!bloqueo?.isConnected;

/** Mientras `el` esté en pantalla (un examen en el que no se permite), la calculadora se cierra y no se abre. */
export function bloquearCalculadora(el) {
  bloqueo = el;
  cerrarCalculadora();
}
/** Quita el bloqueo (p. ej. cuando la ficha del eje dice que sí se permite). */
export function desbloquearCalculadora(el) {
  if (bloqueo === el) bloqueo = null;
}

// ---------------------------------------------------------------------------
// Panel flotante

let panel = null;

function crearPanel() {
  const guardado = leer();
  let modo = ['abajo', 'arriba', 'libre'].includes(guardado.modo) ? guardado.modo : null; // null: abajo en el móvil, libre en pantalla ancha
  let pos = guardado.pos && Number.isFinite(guardado.pos.x) ? guardado.pos : null;
  let min = guardado.min === true;
  let minAuto = false; // minimizada sola al escribir en una casilla (vuelve al salir)
  const estrecha = () => matchMedia(ESTRECHA).matches;
  const modoReal = () => (estrecha() ? (modo === 'arriba' ? 'arriba' : 'abajo') : modo === 'libre' || !modo ? 'libre' : modo);

  const calcEl = aparato();
  const resumen = h('span.calc-resumen', { 'aria-live': 'polite' });
  const pintaResumen = () => {
    const p = pantalla(calc());
    resumen.textContent = p.abajo || p.arriba || '0';
  };
  const bMin = h('button.calc-boton', { type: 'button', onclick: () => { minAuto = false; minimizar(!min); } });
  const bMover = h('button.calc-boton', { type: 'button', title: 'Llevar arriba o abajo', 'aria-label': 'Llevar la calculadora arriba o abajo', onclick: () => {
    const m = modoReal();
    modo = m === 'abajo' ? 'arriba' : 'abajo';
    escribir({ modo });
    coloca();
  } }, '⇅');
  const cabecera = h('div.calc-cabecera',
    h('span.calc-agarre', { 'aria-hidden': 'true' }, '⠿'),
    h('strong.calc-titulo', '🧮 Calculadora'),
    resumen,
    h('span.calc-botones', bMover, bMin,
      h('button.calc-boton', { type: 'button', title: 'Cerrar la calculadora', 'aria-label': 'Cerrar la calculadora', onclick: () => cerrarCalculadora() }, '✕')));
  const el = h('div.calc-panel', { role: 'dialog', 'aria-label': 'Calculadora científica' }, cabecera, h('div.calc-cuerpo', calcEl.el));

  function coloca() {
    const m = modoReal();
    el.dataset.modo = m;
    el.classList.toggle('minimizada', min);
    bMin.textContent = min ? '▢' : '—';
    bMin.title = min ? 'Abrir la calculadora' : 'Minimizar';
    bMin.setAttribute('aria-label', bMin.title);
    bMover.hidden = m === 'libre';
    if (m === 'libre') {
      const r = el.getBoundingClientRect();
      const w = r.width || 360;
      const alto = r.height || 120;
      const x = Math.min(Math.max(8, pos?.x ?? innerWidth - w - 24), Math.max(8, innerWidth - w - 8));
      const y = Math.min(Math.max(8, pos?.y ?? innerHeight - alto - 24), Math.max(8, innerHeight - Math.min(alto, 64) - 8));
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
    } else {
      el.style.left = '';
      el.style.top = '';
    }
    // La página deja sitio a la hoja acoplada (para poder ver y tocar lo que queda debajo o encima).
    const b = document.body;
    b.classList.toggle('con-calc-abajo', el.isConnected && m === 'abajo');
    b.classList.toggle('con-calc-arriba', el.isConnected && m === 'arriba');
    requestAnimationFrame(() => document.documentElement.style.setProperty('--calc-alto', `${el.isConnected && m !== 'libre' ? el.offsetHeight : 0}px`));
  }

  function minimizar(v, recordar = true) {
    min = v;
    if (recordar) escribir({ min });
    coloca();
  }

  // Arrastrar por la cabecera: libre en pantalla ancha; en el móvil, se suelta arriba o abajo.
  let arrastre = null;
  cabecera.addEventListener('pointerdown', (ev) => {
    if (ev.target.closest('button')) return;
    const r = el.getBoundingClientRect();
    arrastre = { dx: ev.clientX - r.left, dy: ev.clientY - r.top, y0: ev.clientY, movido: false };
    cabecera.setPointerCapture?.(ev.pointerId);
  });
  cabecera.addEventListener('pointermove', (ev) => {
    if (!arrastre) return;
    if (Math.abs(ev.clientY - arrastre.y0) > 4) arrastre.movido = true;
    if (modoReal() !== 'libre') return;
    pos = { x: ev.clientX - arrastre.dx, y: ev.clientY - arrastre.dy };
    coloca();
  });
  const suelta = (ev) => {
    if (!arrastre) return;
    const a = arrastre;
    arrastre = null;
    if (modoReal() === 'libre') { if (a.movido) { modo = 'libre'; escribir({ modo, pos }); } return; }
    if (!a.movido) { if (min) minimizar(false); return; } // tocar la cabecera minimizada la abre
    modo = ev.clientY < innerHeight / 2 ? 'arriba' : 'abajo';
    escribir({ modo });
    coloca();
  };
  cabecera.addEventListener('pointerup', suelta);
  cabecera.addEventListener('pointercancel', () => { arrastre = null; });

  // En el móvil, escribir en una casilla minimiza la calculadora (si no, la taparía con el teclado del sistema).
  const alEntrar = (ev) => {
    if (!estrecha() || min || el.contains(ev.target) || !escribiendo(ev.target) || ev.target.type === 'checkbox') return;
    minAuto = true;
    minimizar(true, false);
    setTimeout(() => ev.target.scrollIntoView?.({ block: 'center' }), 250);
  };
  const alSalir = () => setTimeout(() => {
    if (minAuto && !escribiendo(document.activeElement)) { minAuto = false; minimizar(false, false); }
  }, 150);
  const alRedimensionar = () => coloca();

  const pinta = () => { calcEl.pinta(); pintaResumen(); };
  return {
    el,
    minimizada: () => min,
    abre() {
      document.body.append(el);
      pintores.add(pinta);
      pinta();
      document.addEventListener('focusin', alEntrar);
      document.addEventListener('focusout', alSalir);
      addEventListener('resize', alRedimensionar);
      coloca();
      requestAnimationFrame(coloca);
    },
    cierra() {
      el.remove();
      pintores.delete(pinta);
      document.removeEventListener('focusin', alEntrar);
      document.removeEventListener('focusout', alSalir);
      removeEventListener('resize', alRedimensionar);
      coloca();
    },
    muestra() { minAuto = false; minimizar(false); },
  };
}

/** Abre la calculadora flotante (o la despliega si estaba minimizada). Devuelve false si ahora no se permite. */
export function abrirCalculadora() {
  if (bloqueada()) {
    avisoBreve('En este examen no se permite la calculadora.');
    return false;
  }
  if (pagina?.isConnected) { pagina.scrollIntoView?.({ block: 'center' }); return true; }
  panel ??= crearPanel();
  if (panel.el.isConnected) panel.muestra();
  else panel.abre();
  escribir({ abierta: true });
  return true;
}

export function cerrarCalculadora() {
  if (panel?.el.isConnected) panel.cierra();
  escribir({ abierta: false });
}

/** ¿Está abierta la calculadora flotante? */
export const calculadoraAbierta = () => !!panel?.el.isConnected;

/**
 * Botón pequeño que abre la calculadora: autónomo, para poner en cualquier barra de herramientas.
 * @param {{ texto?: string, clase?: string, titulo?: string }} [o]  clase: clases extra del botón (p. ej. 'tool')
 */
export function botonCalculadora({ texto = 'Calculadora', clase = 'secondary', titulo = 'Calculadora científica' } = {}) {
  const herramienta = clase.split('.').includes('tool');
  return h(`button.boton-calculadora.${clase}`, { type: 'button', title: titulo, 'aria-label': `Abrir la ${titulo.toLowerCase()}`, onclick: () => abrirCalculadora() },
    herramienta ? [h('span.tool-icon', '🧮'), h('span.tool-name', texto)] : texto ? `🧮 ${texto}` : '🧮');
}

/** La calculadora dentro de una página (#/calculadora): la misma, con su memoria y su Ans. */
export function calculadoraEnPagina() {
  if (panel?.el.isConnected) panel.cierra(); // en su página no hace falta la flotante
  const c = aparato();
  pagina = h('div.calc-pagina', c.el);
  pintores.add(c.pinta);
  // Se deja de pintar cuando la página desaparece.
  const esta = pagina;
  const alCambiar = () => setTimeout(() => {
    if (esta.isConnected) return;
    pintores.delete(c.pinta);
    removeEventListener('hashchange', alCambiar);
  }, 0);
  addEventListener('hashchange', alCambiar);
  return pagina;
}

/** Al arrancar la app: escucha el teclado y, si la calculadora estaba abierta, la vuelve a abrir. */
export function iniciarCalculadora() {
  document.addEventListener('keydown', alTeclear);
  if (leer().abierta === true) { panel = crearPanel(); panel.abre(); }
}
