// #/<tit>/mapas — mapas de conceptos.  #/<tit>/mapas/<id>?n=<nodo>&v=explorar|mapa|jugar
//   explorar: un concepto en el centro (su lámina, qué es y su clase) y sus vecinos con la relación; tocas un vecino
//             y pasa al centro (con un rastro para volver).
//   mapa:     el mapa entero, para verlo de un vistazo (se desplaza con el dedo); tocar un concepto lo explora.
//   jugar:    «¿qué los une?» y «¿qué falta?» con las relaciones del mapa.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver } from '../titulacion.js';
import { navigate } from '../router.js';
import { renderIllustration } from '../../illustrations/index.js';
import { MAPAS, vecinos, preguntasMapa } from '../../course/mapas.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { cuenta } from '../../texto.js';
import { icono, conIcono } from '../iconos.js';

const cache = new Map();
/** Carga un mapa (una sola vez por sesión). */
export const cargar = (id) => {
  if (!cache.has(id)) cache.set(id, fetch(new URL(`../../../data/mapas/${id}.json`, import.meta.url)).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch((e) => { cache.delete(id); throw e; }));
  return cache.get(id);
};
/** Todos los mapas registrados. */
export const cargarMapas = () => Promise.all(MAPAS.map(cargar));
export const mini = (spec) => h('div.mapa-mini', { 'aria-hidden': 'true', html: renderIllustration(spec)?.svg ?? '' });

export function mapasView({ tit, params: route }) {
  const T = TITULACIONES[tit];
  const [, id] = route.parts;
  const el = h('div.mapas', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA mapas ${T.sigla}`;

  if (!id) {
    cargarMapas().then((mapas) => {
      const mios = mapas.filter((m) => m.tits.includes(tit));
      summaryText = `VISTA mapas de conceptos ${T.sigla}\n${mios.map((m) => `${m.titulo} → ${tlink(tit, ['mapas', m.id])}`).join('\n')}`;
      setChildren(el,
        volver('Biblioteca', tlink(tit, ['biblioteca'])),
        h('h1', conIcono('red', 'Mapas de conceptos')),
        h('p', 'Cómo se relacionan las ideas que más se confunden. Explora concepto a concepto, mira el mapa entero o juega a encontrar qué falta.'),
        h('div.cards', mios.map((m) => h('a.card', { href: tlink(tit, ['mapas', m.id]) }, h('h3', m.titulo), h('p', m.intro),
          h('div.meta', h('span.stat', `${cuenta(m.nodos.length, 'concepto')}`))))));
    }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar los mapas: ${e.message}`)));
    return { el, summary: () => summaryText };
  }

  cargar(id).then((mapa) => {
    const nodos = new Map(mapa.nodos.map((n) => [n.id, n]));
    const q = route.query ?? {};
    const vista = ['mapa', 'jugar'].includes(q.v) ? q.v : 'explorar';
    const actual = nodos.get(q.n) ?? mapa.nodos[0];
    const rastro = (q.r ? q.r.split(',') : []).filter((x) => nodos.has(x)).slice(-4);
    const ir = (n, v = 'explorar') => navigate([tit, 'mapas', id], { v, n: n.id, ...(v === 'explorar' && n.id !== actual.id ? { r: [...rastro, actual.id].slice(-4).join(',') } : {}) });

    const pestañas = h('div.mapa-pestanas', { role: 'tablist' }, [['explorar', 'lupa', 'Explorar'], ['mapa', 'red', 'Mapa entero'], ['jugar', 'diana', 'Jugar']].map(([v, ico, txt]) =>
      h('button', { type: 'button', role: 'tab', 'aria-selected': v === vista ? 'true' : 'false', class: v === vista ? '' : 'secondary', onclick: () => navigate([tit, 'mapas', id], { v, n: actual.id }) }, conIcono(ico, txt))));
    const cabecera = [volver('Mapas de conceptos', tlink(tit, ['mapas'])), h('h1', mapa.titulo), pestañas];

    if (vista === 'mapa') { setChildren(el, cabecera, mapaEntero(mapa, nodos, (n) => ir(n))); summaryText = `VISTA mapa ${mapa.titulo} entero`; return; }
    if (vista === 'jugar') { setChildren(el, cabecera, juego(mapa)); summaryText = `VISTA mapa ${mapa.titulo}: juego`; return; }

    // --- Explorar
    const v = vecinos(mapa, actual.id);
    const linea = (txt, n, dir) => h('button.mapa-vecino', { type: 'button', onclick: () => ir(n) },
      mini(n.spec),
      h('span.mapa-vecino-txt', dir === 'sale' ? [h('span.mapa-rel', `→ ${txt} →`), h('strong', n.nombre)] : [h('strong', n.nombre), h('span.mapa-rel', `→ ${txt} →`)]));
    const claseTit = actual.tit ?? tit;
    setChildren(el, cabecera,
      rastro.length ? h('p.mapa-rastro', 'Venías de: ', rastro.map((rid, i) => [i ? ' › ' : '', h('a', { href: '#', onclick: (ev) => { ev.preventDefault(); navigate([tit, 'mapas', id], { v: 'explorar', n: rid, r: rastro.slice(0, i).join(',') }); } }, nodos.get(rid).nombre)])) : null,
      h('section.mapa-centro',
        h('h2', actual.nombre, actual.tit && actual.tit !== tit ? h('span.badge.muted', ` ${TITULACIONES[actual.tit].sigla}`) : null),
        h('p', actual.corto),
        // Lámina fija (sin mandos): aquí importa ver el concepto, no manipularlo.
        (() => { const r = renderIllustration(actual.spec); return r ? h('figure.il-figure', h('div.il-svg', { html: r.svg }), r.caption ? h('figcaption', r.caption) : null) : null; })(),
        h('p', h('a', { href: tlink(claseTit, ['curso', actual.clase]) }, conIcono('libro', `Verlo en su clase${claseTit !== tit ? ` (${TITULACIONES[claseTit].sigla})` : ''}`)))),
      v.entran.length ? h('section.mapa-grupo', h('h3', 'Viene de'), v.entran.map((x) => linea(x.arista.rel, x.nodo, 'entra'))) : null,
      v.salen.length ? h('section.mapa-grupo', h('h3', 'Lleva a'), v.salen.map((x) => linea(x.arista.rel, x.nodo, 'sale'))) : null,
      v.confunde.length ? h('section.mapa-grupo.confunde', h('h3', conIcono('aviso', 'No lo confundas con')), v.confunde.map((x) => h('button.mapa-vecino', { type: 'button', onclick: () => ir(x.nodo) },
        mini(x.nodo.spec), h('span.mapa-vecino-txt', h('strong', x.nodo.nombre), h('span.small', x.arista.rel))))) : null);
    summaryText = `VISTA mapa ${mapa.titulo} · ${actual.nombre}: ${actual.corto}\nVIENE DE: ${v.entran.map((x) => `${x.nodo.nombre} (${x.arista.rel})`).join('; ') || '—'}\nLLEVA A: ${v.salen.map((x) => `${x.nodo.nombre} (${x.arista.rel})`).join('; ') || '—'}\nNO CONFUNDIR: ${v.confunde.map((x) => `${x.nodo.nombre}: ${x.arista.rel}`).join('; ') || '—'}`;
    window.scrollTo(0, 0);
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo cargar el mapa: ${e.message}`)));

  return { el, summary: () => summaryText };
}

/** El mapa entero: nodos donde dice el mapa (x, y), flechas con su relación; los «confunde», a trazos. */
function mapaEntero(mapa, nodos, onNodo) {
  const W = 150; const H = 96; const nw = 128; const nh = 52; const m = 20;
  const px = (n) => m + n.x * W; const py = (n) => m + n.y * H;
  const ancho = m * 2 + Math.max(...mapa.nodos.map((n) => n.x)) * W + nw;
  const alto = m * 2 + Math.max(...mapa.nodos.map((n) => n.y)) * H + nh;
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`);
  svg.setAttribute('width', ancho); svg.setAttribute('height', alto);
  svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', `Mapa de conceptos: ${mapa.titulo}`);
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // Punto del borde del rectángulo de un nodo en la dirección (dx, dy) desde su centro.
  const borde = (n, dx, dy) => {
    const cx = px(n) + nw / 2; const cy = py(n) + nh / 2;
    const t = Math.min(Math.abs((nw / 2 + 4) / (dx || 1e-9)), Math.abs((nh / 2 + 4) / (dy || 1e-9)));
    return [cx + dx * t, cy + dy * t];
  };
  let html = `<defs><marker id="mapa-flecha" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor"/></marker></defs>`;
  for (const a of mapa.aristas) {
    const A = nodos.get(a.de); const B = nodos.get(a.a);
    const dx = (px(B) - px(A)); const dy = (py(B) - py(A)); const d = Math.hypot(dx, dy) || 1;
    const [x1, y1] = borde(A, dx / d, dy / d); const [x2, y2] = borde(B, -dx / d, -dy / d);
    const conf = a.tipo === 'confunde';
    html += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${conf ? 'mapa-linea confunde' : 'mapa-linea'}" ${conf ? '' : 'marker-end="url(#mapa-flecha)"'}/>`;
    if (!conf) html += `<text x="${(x1 + x2) / 2}" y="${(y1 + y2) / 2 - 3}" class="mapa-etiqueta" text-anchor="middle">${esc(a.rel)}</text>`;
  }
  for (const n of mapa.nodos) {
    const palabras = n.nombre.split(' '); const lineas = [''];
    for (const w of palabras) { if ((lineas.at(-1) + ' ' + w).trim().length > 18) lineas.push(w); else lineas[lineas.length - 1] = (lineas.at(-1) + ' ' + w).trim(); }
    html += `<g class="mapa-nodo" data-id="${n.id}" tabindex="0" role="button" aria-label="${esc(n.nombre)}"><rect x="${px(n)}" y="${py(n)}" width="${nw}" height="${nh}" rx="10"/>` +
      lineas.slice(0, 3).map((l, i) => `<text x="${px(n) + nw / 2}" y="${py(n) + nh / 2 + (i - (Math.min(lineas.length, 3) - 1) / 2) * 15 + 5}" text-anchor="middle">${esc(l)}</text>`).join('') + '</g>';
  }
  svg.innerHTML = html;
  svg.addEventListener('click', (ev) => { const g = ev.target.closest('.mapa-nodo'); if (g) onNodo(nodos.get(g.dataset.id)); });
  svg.addEventListener('keydown', (ev) => { const g = ev.target.closest('.mapa-nodo'); if (g && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); onNodo(nodos.get(g.dataset.id)); } });
  return [h('p.muted.small', 'Desliza para recorrerlo. Toca un concepto para explorarlo. A trazos, lo que se suele confundir.'), h('div.mapa-entero', svg)];
}

/** Juego: ¿qué los une? / ¿qué falta? Una ronda de 8 preguntas. */
function juego(mapa) {
  return juegoMapa(() => preguntasMapa(mapa, createRng(randomSeed()), 8).map((p) => ({ ...p, mapa })), {
    fin: (ok, n) => [h('div.icono', icono(ok >= 6 ? 'ok' : 'repaso')), h('h2', `${ok} de ${n}`),
      h('p', ok >= 6 ? 'Tienes claras las relaciones de este mapa.' : 'Repasa en «Explorar» las que han fallado y vuelve a intentarlo.')],
    otraRonda: true,
  });
}

/**
 * El juego de «¿qué los une?» / «¿qué falta?» con preguntas de uno o varios mapas (cada pregunta lleva su mapa).
 * @param {() => object[]} hacer  genera las preguntas de una ronda
 * @param {{ fin: (ok, n) => Node[], otraRonda?: boolean, alTerminar?: (ok, n) => void }} o
 */
export function juegoMapa(hacer, { fin, otraRonda = false, alTerminar } = {}) {
  const box = h('div.mapa-juego');
  const ronda = () => {
    const qs = hacer();
    let i = 0; let ok = 0;
    const pinta = () => {
      if (i >= qs.length) {
        alTerminar?.(ok, qs.length);
        setChildren(box, h('section.cierre', fin(ok, qs.length), otraRonda ? h('button.grande', { type: 'button', onclick: ronda }, 'Otra ronda') : null));
        return;
      }
      const p = qs[i];
      const nodos = new Map(p.mapa.nodos.map((n) => [n.id, n]));
      const fb = h('div', { 'aria-live': 'polite' });
      const botones = p.opciones.map((o, k) => h('button.secondary.mapa-opcion', { type: 'button', onclick: () => {
        botones.forEach((b, j) => { b.disabled = true; if (j === p.correcta) b.classList.add('correcta'); else if (j === k) b.classList.add('fallada'); });
        const bien = k === p.correcta; if (bien) ok += 1;
        const A = nodos.get(p.de); const B = nodos.get(p.a);
        setChildren(fb, h('p', { class: bien ? 'ok' : 'warn' }, conIcono(bien ? 'ok' : 'no', bien ? '¡Bien!' : 'No.')),
          h('p', `${A.nombre} → ${p.rel} → ${B.nombre}`),
          h('button.grande', { type: 'button', onclick: () => { i += 1; pinta(); } }, i + 1 < qs.length ? 'Siguiente →' : 'Ver resultado'));
      } }, o));
      const de = nodos.get(p.de);
      setChildren(box, h('p.muted', `Pregunta ${i + 1} de ${qs.length}`),
        h('div.mapa-pregunta', mini(de.spec), h('p.qtext', p.enunciado)),
        h('div.mapa-opciones', botones), fb);
    };
    pinta();
  };
  ronda();
  return box;
}
