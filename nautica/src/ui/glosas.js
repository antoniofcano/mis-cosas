// Siglas y términos que se explican al tocarlos: `glosar(raiz, contexto)` recorre el texto ya pintado de una tarjeta,
// un paso o una explicación y convierte la primera aparición de cada sigla (Rv, Ct, HRB, MMSI…) y de cada término del
// vocabulario en un botón. Al tocarlo (o al pasar el ratón o llegar con el teclado, en el ordenador) sale una
// explicación breve junto a la palabra, sin taparla. Esc o tocar fuera la cierra.
//
// - Solo nodos de texto: nada de innerHTML con datos; el texto se parte y se recompone con nodos.
// - No entra en botones, enlaces, opciones de respuesta, títulos ni en lo marcado con [data-sin-glosas].
// - La búsqueda (mayúsculas, tildes, palabra completa) está en src/theory/glosas.js, con sus pruebas.

import { h, setChildren } from './dom.js';
import { compilarGlosas, buscarGlosas, entradaGlosa } from '../theory/glosas.js';
import { loadAbreviaturas, loadVocabulario } from '../store/datasets.js';

/** Dónde no se marca nada: lo que ya es interactivo, las opciones de una pregunta y los títulos. */
const SALTAR = 'button, a, input, textarea, select, option, label, summary, h1, h2, h3, svg, script, style, pre, code, .options, .glosa, .vocab-term, .emp-terminos, .emp-defs, [data-sin-glosas]';

const datos = { abreviaturas: null, terminos: new Map(), cargando: new Map() };
const compilados = new Map();

/** Carga (una vez) las siglas y el vocabulario de una titulación. */
function cargar(tit) {
  const clave = tit ?? 'per';
  if (!datos.cargando.has(clave)) {
    datos.cargando.set(clave, Promise.all([
      loadAbreviaturas().catch(() => ({ abreviaturas: [] })),
      loadVocabulario(clave).catch(() => null),
    ]).then(([ab, voc]) => {
      datos.abreviaturas = ab.abreviaturas ?? [];
      datos.terminos.set(clave, voc ? [...voc.porId.values()] : []);
    }));
  }
  return datos.cargando.get(clave);
}

function glosario(ctx) {
  const tit = ctx.tit ?? 'per';
  const clave = `${tit}|${ctx.ut ?? ''}|${ctx.leccion ?? ''}|${ctx.sinTerminos ? 1 : 0}`;
  if (!compilados.has(clave)) {
    compilados.set(clave, compilarGlosas({ abreviaturas: datos.abreviaturas ?? [], terminos: ctx.sinTerminos ? [] : datos.terminos.get(tit) ?? [] }, { ...ctx, tit }));
  }
  return compilados.get(clave);
}

/**
 * Marca las siglas y términos de `raiz` (la primera vez de cada uno en esa raíz). Sin contexto, no hace nada.
 * @param {Node|null} raiz
 * @param {{ tit?: string, ut?: number, leccion?: string, sinTerminos?: boolean } | null | undefined} ctx
 * @param {{ excluir?: (entrada: object) => boolean, usados?: Set<string> }} [o]
 */
export function glosar(raiz, ctx, o = {}) {
  if (!raiz || !ctx || typeof document === 'undefined') return;
  const tit = ctx.tit ?? 'per';
  if (datos.abreviaturas && datos.terminos.has(tit)) marcar(raiz, glosario(ctx), o);
  else cargar(tit).then(() => marcar(raiz, glosario(ctx), o)).catch(() => {});
}

function marcar(raiz, g, { excluir, usados = new Set() } = {}) {
  instalar();
  // Lo ya marcado en esta raíz (si se vuelve a glosar) cuenta como usado.
  for (const b of raiz.querySelectorAll?.('.glosa') ?? []) usados.add(b.dataset.glosa);
  const nodos = [];
  const walker = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (!n.nodeValue.trim() || n.parentElement?.closest(SALTAR) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  for (let n = walker.nextNode(); n; n = walker.nextNode()) nodos.push(n);
  for (const n of nodos) {
    const trozos = buscarGlosas(n.nodeValue, g, usados, { excluir });
    if (!trozos.some((t) => t.tipo === 'glosa')) continue;
    const frag = document.createDocumentFragment();
    for (const t of trozos) {
      if (t.tipo === 'texto') { frag.append(document.createTextNode(t.texto)); continue; }
      const e = entradaGlosa(g, t.id);
      const b = h('button.glosa', { type: 'button', class: t.clase === 'abreviatura' ? 'glosa-sigla' : 'glosa-termino', 'data-glosa': t.id,
        'aria-expanded': 'false', 'aria-controls': 'glosa-pop', title: e.clase === 'abreviatura' ? e.significado : null }, t.texto);
      b.entrada = e;
      frag.append(b);
    }
    n.replaceWith(frag);
  }
}

// ---------------------------------------------------------------------------
// La explicación flotante (una para toda la app)

let pop = null;
let abierto = null; // botón cuya explicación se ve
let fija = false; // abierta con un toque o clic (no se cierra al quitar el ratón)
const conRaton = () => typeof matchMedia === 'function' && matchMedia('(hover: hover) and (pointer: fine)').matches;

function instalar() {
  if (pop) return;
  pop = h('div.glosa-pop#glosa-pop', { role: 'tooltip', hidden: true });
  document.body.append(pop);
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest?.('button.glosa');
    if (!b) return;
    ev.preventDefault();
    ev.stopPropagation(); // dentro de una opción o de una tarjeta que se toca, no actives lo de debajo
    if (abierto === b && fija) cerrar();
    else abrir(b, true);
  }, true);
  document.addEventListener('pointerdown', (ev) => {
    if (abierto && !ev.target.closest?.('button.glosa, .glosa-pop')) cerrar();
  }, true);
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape' || !abierto) return;
    ev.preventDefault();
    ev.stopPropagation();
    const b = abierto;
    cerrar();
    b.focus();
  }, true);
  // En el ordenador también sale al pasar el ratón o al llegar con el teclado.
  document.addEventListener('pointerover', (ev) => {
    const b = ev.target.closest?.('button.glosa');
    if (b && ev.pointerType === 'mouse' && conRaton() && !(fija && abierto)) abrir(b, false);
  });
  document.addEventListener('pointerout', (ev) => {
    const b = ev.target.closest?.('button.glosa');
    if (b && b === abierto && !fija && ev.pointerType === 'mouse') cerrar();
  });
  document.addEventListener('focusin', (ev) => {
    const b = ev.target.closest?.('button.glosa');
    if (b && b.matches(':focus-visible') && !(fija && abierto === b)) abrir(b, false);
  });
  document.addEventListener('focusout', (ev) => {
    if (abierto && ev.target === abierto && !fija) cerrar();
  });
  const recoloca = () => { if (!abierto) return; if (!abierto.isConnected) cerrar(); else coloca(abierto); };
  addEventListener('scroll', recoloca, true);
  addEventListener('resize', recoloca);
  addEventListener('hashchange', () => cerrar());
}

function abrir(b, conToque) {
  if (abierto && abierto !== b) abierto.setAttribute('aria-expanded', 'false');
  abierto = b;
  fija = conToque;
  const e = b.entrada;
  if (!e) return;
  const tits = e.tit?.length ? (e.tit.length > 1 ? e.tit.map((t) => t.toUpperCase()).join(' y ') : `solo ${e.tit[0].toUpperCase()}`) : null;
  setChildren(pop,
    h('p.glosa-titulo', h('strong', e.titulo), e.significado ? [' · ', e.significado] : null),
    e.texto ? h('p', e.texto) : null,
    tits ? h('p.glosa-tit', tits) : null);
  pop.hidden = false;
  b.setAttribute('aria-expanded', 'true');
  b.setAttribute('aria-describedby', 'glosa-pop');
  coloca(b);
}

/** Debajo de la palabra o, si no cabe, encima: nunca la tapa. */
function coloca(b) {
  const r = b.getBoundingClientRect();
  const vw = document.documentElement.clientWidth;
  const vh = innerHeight;
  const ancho = Math.min(340, vw - 16);
  pop.style.width = `${ancho}px`;
  pop.style.maxHeight = '';
  pop.style.left = `${Math.round(Math.max(8, Math.min(r.left + r.width / 2 - ancho / 2, vw - ancho - 8)))}px`;
  const alto = pop.offsetHeight;
  const abajo = vh - r.bottom - 8;
  const arriba = r.top - 8;
  if (alto + 6 <= abajo || abajo >= arriba) {
    pop.style.top = `${Math.round(r.bottom + 6)}px`;
    if (alto + 6 > abajo) pop.style.maxHeight = `${Math.max(48, abajo - 6)}px`;
  } else {
    const h0 = Math.min(alto, arriba - 6);
    pop.style.maxHeight = `${Math.max(48, h0)}px`;
    pop.style.top = `${Math.round(r.top - 6 - Math.min(alto, Math.max(48, h0)))}px`;
  }
}

function cerrar() {
  if (!pop) return;
  pop.hidden = true;
  if (abierto) { abierto.setAttribute('aria-expanded', 'false'); abierto.removeAttribute('aria-describedby'); }
  abierto = null;
  fija = false;
}
