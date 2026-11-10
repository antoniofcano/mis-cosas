// Bloc: la hoja de borrador de un ejercicio de cuentas. El enunciado a la vista con sus datos, las notas del alumno
// (texto libre: «Hb = 0,45 m») y la calculadora a mano. La lógica (guardar, trocear, insertar) está en src/bloc/notas.js.
// - botonBloc(o): botón autónomo que lo abre; se pone en cualquier ejercicio, cuenta o pregunta de cálculo. Lleva un
//   punto si ya hay algo apuntado.
// - Abierto: en el móvil, una hoja a pantalla completa que se ajusta al teclado y deja sitio a la calculadora acoplada;
//   en pantallas anchas, una columna a la izquierda que aparta la página (se sigue viendo y se puede responder).
// - crearBloc(o): el mismo contenido para incrustarlo (pestaña «Bloc» del panel de la mesa de cartas).
// - Tocar un dato del enunciado, «Apuntar <resultado>» de la calculadora o un signo lo escribe donde está el cursor,
//   sin quitar el foco ni cerrar el teclado.
// - Las notas son de ese ejercicio (o.id): se guardan solas en el aparato al escribir y siguen ahí al cerrar, cambiar
//   de pantalla o recargar. Otro ejercicio empieza en blanco. Es papel de borrador: vale también en un examen (sin
//   glosas, pistas ni soluciones; sin calculadora si el examen no la permite).

import { h } from './dom.js';
import { icono, conIcono } from './iconos.js';
import { crearAlmacenBloc, trocear, datosDe, insertar } from '../bloc/notas.js';
import { botonCalculadora, resultadoCalculadora, alCambiarCalculadora } from './calculadora.js';
import { calculadoraEnExamen } from './modo-examen.js';

const ESTRECHA = '(max-width: 700px)'; // como la calculadora: por debajo, hoja a pantalla completa
let almacen = null;
const notas = () => (almacen ??= crearAlmacenBloc());

// Signos que cuesta encontrar en el teclado del móvil: [lo que escribe, texto del botón, nombre, va pegado al número]
const SIGNOS = [['=', '=', 'igual'], ['°', '°', 'grados', true], ['′', '′', 'minutos', true], ['→', '→', 'flecha'], ['\n', 'Intro', 'línea nueva']];

/** No roba el foco de la nota al tocar un botón (en el móvil no se cierra el teclado). */
const sinFoco = { onpointerdown: (ev) => ev.preventDefault(), onmousedown: (ev) => ev.preventDefault() };

// «Apuntar <resultado>»: todos los botones que haya en pantalla siguen a la calculadora (una sola escucha).
function pintaPegar(b) {
  const r = resultadoCalculadora();
  b.disabled = !r;
  b.querySelector('.bloc-pegar-valor').textContent = r ? ` ${r}` : '';
  b.setAttribute('aria-label', r ? `Apuntar en la nota el resultado de la calculadora: ${r}` : 'Apuntar el resultado de la calculadora (aún no hay)');
}
let escuchando = false;
function seguirCalculadora() {
  if (escuchando) return;
  escuchando = true;
  alCambiarCalculadora(() => document.querySelectorAll('.bloc-pegar').forEach(pintaPegar));
}

/** El punto de «hay notas» en los botones de ese ejercicio. */
function pintaBotones(id) {
  const hay = notas().hay(id);
  for (const b of document.querySelectorAll('.boton-bloc')) {
    if (b.dataset.bloc !== id) continue;
    b.classList.toggle('con-notas', hay);
    b.setAttribute('aria-label', hay ? 'Abrir el bloc de notas (tienes notas de este ejercicio)' : 'Abrir el bloc de notas con el enunciado');
  }
}

/**
 * El contenido del bloc: enunciado, datos para apuntar, notas y herramientas.
 * @param {object} o
 * @param {string} o.id          identificador de la nota (ID_BLOC en src/bloc/notas.js)
 * @param {string} o.enunciado
 * @param {string} [o.titulo]    de qué ejercicio es (cabecera)
 * @param {string} [o.comun]     enunciado común a varias preguntas, si lo hay
 * @param {string} [o.contexto]  datos que acompañan a la pregunta (p. ej. la tabla del Anuario de Mareas), en texto
 * @param {Record<string, string>} [o.opciones]  opciones de una pregunta tipo test (se listan bajo el enunciado)
 * @param {boolean} [o.calculadora]  false: sin calculadora (examen en el que no se permite)
 * @param {'hoja'|'panel'} [o.variante]  panel: incrustado (sin título ni cerrar)
 * @param {() => void} [o.onCerrar]
 */
export function crearBloc(o) {
  const variante = o.variante ?? 'hoja';
  const conCalculadora = o.calculadora !== false && calculadoraEnExamen();
  const aviso = h('span.bloc-aviso', { role: 'status', 'aria-live': 'polite' });
  const ta = h('textarea.bloc-notas', {
    id: `bloc-notas-${variante}`, rows: '4', spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off',
    'aria-label': 'Tus notas de este ejercicio',
    placeholder: 'Tus cuentas y valores, uno por línea. Por ejemplo:\nA = Hp − Hb = 2,45 m\nSe guardan solas en este aparato.',
  });
  ta.value = notas().leer(o.id);
  const guarda = () => { notas().guardar(o.id, ta.value); borrar.disabled = !ta.value; pintaBotones(o.id); };
  ta.addEventListener('input', guarda);
  // Incrustado en la mesa de cartas, Esc en la nota suelta el foco en vez de cerrar la carta.
  if (variante === 'panel') ta.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); ta.blur(); } });

  let quitaDestello = null;
  function pon(trozo, opciones, dicho = trozo) {
    const r = insertar(ta.value, ta.selectionStart, ta.selectionEnd, trozo, opciones);
    ta.value = r.texto;
    ta.setSelectionRange(r.cursor, r.cursor);
    if (r.cursor >= r.texto.length) ta.scrollTop = ta.scrollHeight;
    guarda();
    aviso.textContent = `Apuntado: ${dicho}`;
    ta.classList.add('apuntado');
    clearTimeout(quitaDestello);
    quitaDestello = setTimeout(() => { ta.classList.remove('apuntado'); aviso.textContent = ''; }, 900);
  }

  const borrar = h('button.bloc-boton', { type: 'button', title: 'Borrar las notas', 'aria-label': 'Borrar las notas de este ejercicio', disabled: !ta.value, onclick: () => {
    if (!ta.value || !confirm('¿Borrar tus notas de este ejercicio?')) return;
    ta.value = '';
    notas().borrar(o.id);
    borrar.disabled = true;
    pintaBotones(o.id);
    aviso.textContent = 'Notas borradas';
  } }, icono('papelera'));

  // Enunciado: los datos van marcados y, debajo, en fichas que se apuntan con un toque.
  const parrafo = (texto, clase) => h(`p.${clase}`, trocear(texto).map((x) => (x.dato ? h('span.bloc-marca', x.t) : x.t)));
  const opciones = Object.entries(o.opciones ?? {});
  const datos = datosDe([o.comun, o.enunciado, o.contexto].filter(Boolean).join('\n'));
  const enunciado = h('section.bloc-enunciado', { 'aria-label': 'Enunciado', tabindex: '0' },
    o.comun ? parrafo(o.comun, 'bloc-comun') : null,
    parrafo(o.enunciado ?? '', 'bloc-texto'),
    o.contexto ? parrafo(o.contexto, 'bloc-contexto') : null,
    opciones.length ? h('ul.bloc-opciones', { 'aria-label': 'Opciones' }, opciones.map(([k, v]) => h('li', h('strong', `${k}) `), v))) : null);
  const tiraDatos = datos.length ? h('div.bloc-tira.bloc-datos', { role: 'group', 'aria-label': 'Datos del enunciado: toca uno para apuntarlo en la nota' },
    h('span.bloc-tira-rotulo', { 'aria-hidden': 'true' }, 'Datos'),
    datos.map((d) => h('button.bloc-dato', { type: 'button', 'aria-label': `Apuntar ${d}`, ...sinFoco, onclick: () => pon(d) }, d))) : null;

  const pegar = conCalculadora ? h('button.secondary.bloc-pegar', { type: 'button', title: 'Apuntar en la nota el resultado de la calculadora', ...sinFoco,
    onclick: () => { const r = resultadoCalculadora(); if (r) pon(r); } }, 'Apuntar', h('span.bloc-pegar-valor')) : null;
  if (pegar) { pintaPegar(pegar); seguirCalculadora(); }
  const herramientas = h('div.bloc-tira.bloc-herramientas', { role: 'group', 'aria-label': 'Calculadora y signos' },
    conCalculadora ? botonCalculadora({ texto: 'Calculadora', clase: 'secondary.bloc-calculadora' }) : null,
    pegar,
    SIGNOS.map(([s, texto, nombre, pegado]) => h('button.secondary.bloc-signo', { type: 'button', 'aria-label': `Escribir ${nombre}`, title: nombre, ...sinFoco,
      onclick: () => pon(s, { pegado: !!pegado }, nombre) }, texto)),
    variante === 'panel' ? borrar : null);

  // Incrustado en un panel (que ya dice «Bloc» en su pestaña) no lleva cabecera: «Borrar» va con las herramientas.
  const cabecera = variante === 'hoja' ? h('header.bloc-cabecera',
    h('strong.bloc-nombre', conIcono('lapiz', 'Bloc')),
    h('span.bloc-titulo', o.titulo ?? ''),
    borrar,
    h('button.bloc-boton.bloc-cerrar', { type: 'button', title: 'Cerrar el bloc (Esc)', 'aria-label': 'Cerrar el bloc (las notas se guardan)', onclick: () => o.onCerrar?.() }, icono('salir'))) : null;

  const el = h(`div.bloc.bloc-en-${variante}`, cabecera, enunciado, tiraDatos, ta, herramientas, aviso);
  // Al volver a verse (otra pestaña del panel, otra vez abierto), el botón de la calculadora y lo guardado, al día.
  el.addEventListener('focusin', () => { if (pegar) pintaPegar(pegar); });
  return { el, notas: ta, texto: () => ta.value };
}

// ---------------------------------------------------------------------------
// La hoja (una sola abierta a la vez)

let abierta = null;

/** Cierra el bloc abierto (las notas ya están guardadas). */
export function cerrarBloc({ foco = true } = {}) {
  if (!abierta) return;
  const a = abierta;
  abierta = null;
  a.limpia();
  a.el.remove();
  document.body.classList.remove('con-bloc');
  pintaBotones(a.id);
  if (foco && a.ancla?.isConnected) a.ancla.focus({ preventScroll: true });
}

/** ¿Está abierto el bloc (de ese ejercicio, si se dice cuál)? */
export const blocAbierto = (id = null) => !!abierta && (id == null || abierta.id === id);

/**
 * Abre el bloc de un ejercicio. `ancla`: el botón que lo abre (al cerrar vuelve el foco; si desaparece de la pantalla
 * —otra pregunta, otra vista—, el bloc se cierra solo).
 */
export function abrirBloc(o, ancla = null) {
  cerrarBloc({ foco: false });
  const bloc = crearBloc({ ...o, variante: 'hoja', onCerrar: () => cerrarBloc() });
  const el = h('div.bloc-hoja', { role: 'dialog', 'aria-label': `Bloc de notas${o.titulo ? `: ${o.titulo}` : ''}`, tabindex: '-1' }, bloc.el);

  // En el móvil la hoja ocupa lo que se ve: se encoge con el teclado (visualViewport) y deja sitio a la calculadora
  // acoplada arriba o abajo (--calc-alto, body.con-calc-*). En pantallas anchas lo coloca el CSS.
  const vv = window.visualViewport ?? null;
  function ajusta() {
    if (!matchMedia(ESTRECHA).matches) {
      el.style.removeProperty('--bloc-arriba');
      el.style.removeProperty('--bloc-alto');
      for (const c of ['apretada', 'muy-apretada', 'con-calc']) el.classList.toggle(c, false);
      return;
    }
    const calc = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--calc-alto')) || 0;
    const b = document.body.classList;
    const alto = vv?.height ?? innerHeight;
    const teclado = innerHeight - alto > 120;
    const arriba = b.contains('con-calc-arriba') ? calc : 0;
    const abajo = b.contains('con-calc-abajo') && !teclado ? calc : 0; // con el teclado, la calculadora minimizada queda debajo de él
    el.style.setProperty('--bloc-arriba', `${Math.round((vv?.offsetTop ?? 0) + arriba)}px`);
    const hueco = Math.max(200, Math.round(alto - arriba - abajo));
    el.style.setProperty('--bloc-alto', `${hueco}px`);
    // Con poco sitio (teclado abierto, calculadora desplegada) la hoja se aprieta: las herramientas en una tira que se
    // desplaza y, si aún falta, sin la tira de datos y con la nota en dos líneas (el enunciado no se quita nunca).
    el.classList.toggle('apretada', hueco < 470);
    el.classList.toggle('muy-apretada', hueco < 320);
    el.classList.toggle('con-calc', arriba + abajo > 120);
  }
  const onKey = (ev) => { if (ev.key === 'Escape' && !ev.defaultPrevented) { ev.preventDefault(); ev.stopPropagation(); cerrarBloc(); } };
  const onHash = () => cerrarBloc({ foco: false });
  // Se cierra si su botón desaparece (otra pregunta) o si se abre la mesa de cartas encima (que trae su propia pestaña «Bloc»).
  const vigia = new MutationObserver((cambios) => {
    if (cambios.every((c) => el.contains(c.target))) return; // lo que cambia dentro de la hoja no la recoloca
    if ((ancla && !ancla.isConnected) || document.body.classList.contains('ws-open')) cerrarBloc({ foco: false }); else ajusta();
  });
  vigia.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  const vigiaCalc = new MutationObserver(ajusta); // --calc-alto cambia en el estilo de <html>
  vigiaCalc.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
  el.addEventListener('keydown', onKey);
  addEventListener('hashchange', onHash);
  addEventListener('resize', ajusta);
  vv?.addEventListener('resize', ajusta);
  vv?.addEventListener('scroll', ajusta);

  abierta = {
    id: o.id, el, ancla,
    limpia() {
      vigia.disconnect();
      vigiaCalc.disconnect();
      removeEventListener('hashchange', onHash);
      removeEventListener('resize', ajusta);
      vv?.removeEventListener('resize', ajusta);
      vv?.removeEventListener('scroll', ajusta);
    },
  };
  document.body.append(el);
  document.body.classList.add('con-bloc');
  ajusta();
  // El foco va a la hoja (el lector de pantalla la anuncia), no a la nota: en el móvil abriría el teclado sin pedirlo.
  el.focus({ preventScroll: true });
  return bloc;
}

/**
 * Botón que abre el bloc de un ejercicio (y lo cierra si ya está abierto): autónomo, para cualquier barra de botones.
 * @param {object} o  lo mismo que crearBloc (id, enunciado, titulo, comun, opciones, calculadora)
 * @param {{ texto?: string, clase?: string }} [b]  clase: clases extra del botón
 */
export function botonBloc(o, { texto = 'Bloc', clase = 'secondary' } = {}) {
  const b = h(`button.boton-bloc.${clase}`, { type: 'button', title: 'Bloc: el enunciado y tus notas', 'data-bloc': o.id, 'aria-haspopup': 'dialog',
    onclick: () => { if (blocAbierto(o.id)) cerrarBloc(); else abrirBloc(o, b); } },
  texto ? conIcono('lapiz', texto) : icono('lapiz'), h('span.bloc-punto', { 'aria-hidden': 'true' }));
  const hay = notas().hay(o.id);
  b.classList.toggle('con-notas', hay);
  b.setAttribute('aria-label', hay ? 'Abrir el bloc de notas (tienes notas de este ejercicio)' : 'Abrir el bloc de notas con el enunciado');
  return b;
}
