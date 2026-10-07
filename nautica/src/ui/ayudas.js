// Ayudas de la práctica: una barra pequeña con el botón «Chuleta» (y un hueco para otras ayudas, como la calculadora)
// y el panel de la chuleta: fórmulas, signos y conversiones de lo que se está practicando (data/comun/chuletario.json)
// y, debajo, la chuleta de las clases que vienen a cuento.
//
// Nunca en un examen: `crearAyudas` solo da la chuleta en los modos de práctica (src/course/chuletario.js) y, aunque se
// la pidan, no la abre en una dirección de examen. tests/chuletario.test.js comprueba que ninguna vista de examen la usa.
//
// El panel va en el flujo de la página, debajo de la barra (o, en la mesa de cartas, flotando sobre la carta): no tapa
// nunca la respuesta que se está escribiendo. Abierta o cerrada se recuerda durante la sesión.

import { h, setChildren } from './dom.js';
import { icono } from './iconos.js';
import { chuletaPermitida, esRutaDeExamen, fichasPara, chuletasDeClases } from '../course/chuletario.js';
import { loadChuletario, loadCourse } from '../store/datasets.js';
import { glosar } from './glosas.js';

const CLAVE = 'nautica.chuleta.abierta';
const leeAbierta = () => { try { return sessionStorage.getItem(CLAVE) === '1'; } catch { return false; } };
const guardaAbierta = (v) => { try { sessionStorage.setItem(CLAVE, v ? '1' : '0'); } catch { /* sin almacenamiento: solo esta pantalla */ } };

// ---------------------------------------------------------------------------
// Hueco para otras ayudas (calculadora científica, apéndice de matemáticas…)

const otras = [];

/**
 * Añade una ayuda a la barra de todas las pantallas de práctica.
 * @param {{ id: string, crear: (ctx: object) => Node|null }} ayuda  `crear` recibe el contexto ({ modo, tit, ut,
 *   ejercicios, leccion }) y devuelve su botón (o null si en ese contexto no va). La barra solo existe en práctica: si
 *   una ayuda debe estar también en el examen, que lo decida esa vista, sin la chuleta.
 */
export function registrarAyuda(ayuda) {
  if (!otras.some((x) => x.id === ayuda.id)) otras.push(ayuda);
}

let nPaneles = 0;

/**
 * Barra de ayudas y panel de la chuleta para una pantalla de práctica.
 * @param {{ modo: string, tit?: string, ut?: number, ejercicios?: string[], leccion?: string, flotante?: boolean }} ctx
 *   flotante: el panel flota sobre la carta (mesa de cartas) en vez de ir en el flujo de la página
 * @returns {{ barra: HTMLElement|null, panel: HTMLElement|null, contexto: (cambios: object) => void }}
 */
export function crearAyudas(ctx) {
  let actual = { ...ctx };
  const conChuleta = chuletaPermitida(actual.modo) && !esRutaDeExamen(typeof location === 'undefined' ? '' : location.hash);
  const huecos = h('span.ayudas-hueco', { 'data-hueco': 'calculadora' }, otras.map((a) => a.crear(actual)));
  if (!conChuleta) {
    // Sin chuleta (un examen, o un modo que no es de práctica): solo las otras ayudas, si las hay.
    return { barra: huecos.childNodes.length ? h('div.ayudas', { role: 'toolbar', 'aria-label': 'Ayudas' }, huecos) : null, panel: null, contexto: () => {}, ctx: () => null };
  }

  const id = `chuleta-${++nPaneles}`;
  const cuerpo = h('div.chuleta-cuerpo', { 'aria-live': 'polite' });
  const cerrarBtn = h('button.secondary.small.chuleta-cerrar', { type: 'button', 'aria-label': 'Cerrar la chuleta', title: 'Cerrar la chuleta', onclick: () => pon(false, true) }, icono('salir'));
  const titulo = h('h2.chuleta-titulo', { tabindex: '-1' }, '📌 Chuleta');
  const panel = h('section.chuleta-panel', { id, role: 'region', 'aria-label': 'Chuleta', hidden: true, class: actual.flotante ? 'flotante' : '' },
    h('div.chuleta-cabecera', titulo, cerrarBtn),
    h('p.chuleta-aviso', 'Solo para practicar: en el examen no la tendrás.'),
    cuerpo);
  panel.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') { ev.preventDefault(); pon(false, true); boton.focus(); } });
  const boton = h('button.secondary.small.boton-chuleta', { type: 'button', 'aria-expanded': 'false', 'aria-controls': id, onclick: () => pon(panel.hidden, true) },
    icono('temario'), h('span', 'Chuleta'));
  const barra = h('div.ayudas', { role: 'toolbar', 'aria-label': 'Ayudas' }, boton, huecos);

  let pintado = '';
  async function pinta() {
    const clave = JSON.stringify([actual.tit, actual.ut, actual.ejercicios, actual.leccion]);
    if (clave === pintado) return;
    pintado = clave;
    setChildren(cuerpo, h('p.muted', 'Cargando…'));
    try {
      const [chuletario, curso] = await Promise.all([loadChuletario(), actual.tit ? loadCourse(actual.tit).catch(() => null) : null]);
      if (pintado !== clave) return; // ha cambiado la pregunta mientras cargaba
      const fichas = fichasPara(chuletario, actual);
      const clases = chuletasDeClases(curso, actual);
      const g = { tit: actual.tit, ut: actual.ut, leccion: actual.leccion };
      setChildren(cuerpo,
        fichas.map((f) => {
          const s = h('section.chuleta-ficha', h('h3', f.titulo), h('ul', f.lineas.map((l) => h('li', negritas(l)))));
          glosar(s, g);
          return s;
        }),
        clases.length ? h('section.chuleta-clases',
          h('h3', clases.length === 1 ? 'De la clase' : 'De tus clases'),
          clases.map((c) => {
            const lista = h('ul', c.lineas.map((l) => h('li', negritas(l))));
            glosar(lista, g);
            return clases.length === 1 ? lista : h('details', h('summary', c.titulo), lista);
          })) : null,
        !fichas.length && !clases.length ? h('p.muted', 'Para esto no hay fórmulas: aquí cuenta lo que se aprende en las clases.') : null);
    } catch (e) {
      pintado = '';
      setChildren(cuerpo, h('p.warn', `No se pudo cargar la chuleta: ${e.message}`));
    }
  }

  function pon(abierta, porElAlumno = false) {
    if (abierta && esRutaDeExamen(location.hash)) abierta = false; // segunda barrera
    panel.hidden = !abierta;
    boton.setAttribute('aria-expanded', String(abierta));
    boton.classList.toggle('activo', abierta);
    if (!porElAlumno) return;
    guardaAbierta(abierta);
    dispatchEvent(new CustomEvent('nautica-chuleta', { detail: { abierta, desde: panel } }));
    if (abierta) {
      pinta();
      titulo.focus({ preventScroll: true });
      if (!actual.flotante) panel.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
  }
  // Las otras barras de la misma pantalla (la de la mesa de cartas y la de la página) se abren y cierran a la vez.
  const sincroniza = (ev) => {
    if (!panel.isConnected) { removeEventListener('nautica-chuleta', sincroniza); return; }
    if (ev.detail.desde !== panel) { pon(ev.detail.abierta); if (ev.detail.abierta) pinta(); }
  };
  addEventListener('nautica-chuleta', sincroniza);
  if (leeAbierta()) { pon(true); pinta(); }

  return {
    barra,
    panel,
    /** El contexto actual (para pasárselo a la mesa de cartas). */
    ctx: () => ({ ...actual, flotante: false }),
    /** Cambia lo que se practica (p. ej. la pregunta de otra UT en una tanda mezclada). */
    contexto(cambios) {
      actual = { ...actual, ...cambios };
      if (!panel.hidden) pinta(); else pintado = '';
    },
  };
}

/** Texto con **negrita** → nodos (sin HTML de los datos). */
function negritas(s) {
  return String(s).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((p) => (/^\*\*.+\*\*$/.test(p) ? h('strong', p.slice(2, -2)) : p));
}
