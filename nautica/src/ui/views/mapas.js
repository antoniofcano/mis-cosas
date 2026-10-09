// #/<tit>/mapas — mapas de conceptos.  #/<tit>/mapas/<id>?n=<nodo>&v=explorar|mapa|jugar
//   explorar: un concepto en el centro (su lámina, qué es, su clase y la ficha de su idea si la hay) y sus vecinos con
//             la relación; tocas un vecino y pasa al centro (con un rastro para volver).
//   mapa:     el mapa entero (src/illustrations/mapa-c.js), para verlo de un vistazo (se desplaza con el dedo); tocar un
//             concepto lo explora. Debajo, las relaciones escritas con su número y las confusiones con su letra.
//   jugar:    «¿qué los une?» y «¿qué falta?» con las relaciones del mapa.
// En estilo C, como las láminas (docs/ESTILO-LAMINAS.md, «Mapas de conceptos y chuletas»): papel, tinta y magenta de
// carta (variables --lc-*), cartelas con doble filete, cifras en etiquetas de cota y rótulos en serifa.

import { h, setChildren } from '../dom.js';
import { TITULACIONES, tlink, volver, currentEje } from '../titulacion.js';
import { navigate } from '../router.js';
import { renderIllustration } from '../../illustrations/index.js';
import { mapaSvg } from '../../illustrations/mapa-c.js';
import { MAPAS, vecinos, preguntasMapa } from '../../course/mapas.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { cuenta } from '../../texto.js';
import { icono, conIcono } from '../iconos.js';
import { conceptosDelBanco, hrefFicha } from '../concepto.js';

const cache = new Map();
/** Carga un mapa (una sola vez por sesión). */
export const cargar = (id) => {
  if (!cache.has(id)) cache.set(id, fetch(new URL(`../../../data/mapas/${id}.json`, import.meta.url)).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).catch((e) => { cache.delete(id); throw e; }));
  return cache.get(id);
};
/** Todos los mapas registrados. */
export const cargarMapas = () => Promise.all(MAPAS.map(cargar));
export const mini = (spec) => h('div.mapa-mini', { 'aria-hidden': 'true', html: renderIllustration(spec)?.svg ?? '' });

/**
 * Las ideas del catálogo que se enseñan en la clase de un concepto del mapa y tienen ficha en el banco activo (como
 * mucho `max`). Sin etiquetas en el banco (ic null), ninguna.
 */
export function fichasDeNodo(ic, nodo, tit, max = 2) {
  if (!ic?.catalogo?.conceptos || !nodo?.clase) return [];
  return ic.catalogo.conceptos.filter((c) => c.tipo === 'concepto' && (c.tit ?? []).includes(tit) && (c.clases ?? []).includes(nodo.clase)
    && ic.preguntasDe(c.id, { soloEstudio: false }).length).slice(0, max);
}

/** Cabecera de un mapa (o de la lista): eyebrow, título en serifa y la entradilla. */
const cabeceraC = (eti, titulo, intro) => h('header.mc-cab', h('p.lc-eti', eti), h('h1.lc-titulo', titulo), intro ? h('p.mc-intro', intro) : null);

export function mapasView({ tit, params: route, progress = null }) {
  const T = TITULACIONES[tit];
  const [, id] = route.parts;
  const el = h('div.mapas.mc', h('p.muted', 'Cargando…'));
  let summaryText = `VISTA mapas ${T.sigla}`;

  if (!id) {
    cargarMapas().then((mapas) => {
      const mios = mapas.filter((m) => m.tits.includes(tit));
      summaryText = `VISTA mapas de conceptos ${T.sigla}\n${mios.map((m) => `${m.titulo} → ${tlink(tit, ['mapas', m.id])}`).join('\n')}`;
      setChildren(el,
        volver('Biblioteca', tlink(tit, ['biblioteca'])),
        cabeceraC(`Biblioteca · ${T.sigla}`, 'Mapas de conceptos', 'Cómo se relacionan las ideas que más se confunden. Explora concepto a concepto, mira el mapa entero o juega a encontrar qué falta.'),
        h('ul.mc-lista', mios.map((m) => {
          const rels = m.aristas.filter((a) => a.tipo !== 'confunde').length;
          const conf = m.aristas.length - rels;
          return h('li', h('a.mc-tarjeta', { href: tlink(tit, ['mapas', m.id]) },
            h('span.mc-tarjeta-ico', icono('red')),
            h('span.mc-tarjeta-tx',
              h('span.mc-tarjeta-eti', `${cuenta(m.nodos.length, 'concepto')} · ${cuenta(rels, 'relación', 'relaciones')}${conf ? ` · ${cuenta(conf, 'trampa')}` : ''}`),
              h('span.mc-tarjeta-titulo', m.titulo),
              h('span.mc-tarjeta-intro', m.intro))));
        })));
    }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar los mapas: ${e.message}`)));
    return { el, summary: () => summaryText };
  }

  cargar(id).then((mapa) => {
    const nodos = new Map(mapa.nodos.map((n) => [n.id, n]));
    const q = route.query ?? {};
    const vista = ['mapa', 'jugar'].includes(q.v) ? q.v : 'explorar';
    const actual = nodos.get(q.n) ?? mapa.nodos[0];
    const rastro = (q.r ? q.r.split(',') : []).filter((x) => nodos.has(x)).slice(-4);
    /** Dirección para explorar un concepto (desde el actual, que pasa al rastro). */
    const hrefExplorar = (n) => tlink(tit, ['mapas', id], { v: 'explorar', n: n.id, ...(n.id !== actual.id ? { r: [...rastro, actual.id].slice(-4).join(',') } : {}) });

    const pestañas = h('div.mapa-pestanas', { role: 'tablist', 'aria-label': 'Cómo ver el mapa' }, [['explorar', 'lupa', 'Explorar'], ['mapa', 'red', 'Mapa entero'], ['jugar', 'diana', 'Jugar']].map(([v, ico, txt]) =>
      h('button', { type: 'button', role: 'tab', 'aria-selected': v === vista ? 'true' : 'false', class: v === vista ? '' : 'secondary', onclick: () => navigate([tit, 'mapas', id], { v, n: actual.id }) }, conIcono(ico, txt))));
    const cabecera = [volver('Mapas de conceptos', tlink(tit, ['mapas'])), cabeceraC(`Mapa de conceptos · ${T.sigla}`, mapa.titulo, vista === 'explorar' ? null : mapa.intro), pestañas];

    if (vista === 'mapa') {
      setChildren(el, cabecera, mapaEntero(mapa, nodos, actual, hrefExplorar));
      summaryText = `VISTA mapa ${mapa.titulo} entero`;
      return;
    }
    if (vista === 'jugar') { setChildren(el, cabecera, juego(mapa)); summaryText = `VISTA mapa ${mapa.titulo}: juego`; return; }

    // --- Explorar
    const v = vecinos(mapa, actual.id);
    const vecino = (n, rel, dir) => h('li', h(`a.mapa-vecino${dir === 'confunde' ? '.confunde' : ''}`, { href: hrefExplorar(n) },
      mini(n.spec),
      h('span.mapa-vecino-txt',
        h('strong.mc-vecino-nombre', n.nombre),
        h('span.mapa-rel', dir === 'sale' ? `${actual.nombre} → ${rel} → ${n.nombre}` : dir === 'entra' ? `${n.nombre} → ${rel} → ${actual.nombre}` : rel)),
      icono('adelante', 'mc-ir')));
    const grupo = (titulo, ico, xs, dir) => (xs.length ? h(`section.mapa-grupo${dir === 'confunde' ? '.confunde' : ''}`, h('h3.mc-grupo-tit', conIcono(ico, titulo)),
      h('ul.mc-vecinos', xs.map((x) => vecino(x.nodo, x.arista.rel, dir)))) : null);
    const claseTit = actual.tit ?? tit;
    const fichas = h('span.mc-fichas');
    const lamina = (() => { const r = renderIllustration(actual.spec); return r ? h('figure.il-figure', h('div.il-svg', { html: r.svg }), r.caption ? h('figcaption', r.caption) : null) : null; })();
    setChildren(el, cabecera,
      rastro.length ? h('nav.mapa-rastro', { 'aria-label': 'Conceptos por los que has pasado' }, 'Venías de: ', rastro.map((rid, i) => [i ? ' › ' : '',
        h('a', { href: tlink(tit, ['mapas', id], { v: 'explorar', n: rid, ...(i ? { r: rastro.slice(0, i).join(',') } : {}) }) }, nodos.get(rid).nombre)])) : null,
      h('section.lc-marco.mapa-centro', { 'aria-label': `Concepto: ${actual.nombre}` },
        h('div.lc-cab', h('p.lc-eti', 'Concepto', actual.tit && actual.tit !== tit ? ` · del ${TITULACIONES[actual.tit].sigla}` : ''),
          h('h2.lc-titulo', actual.nombre), h('p.mc-corto', actual.corto)),
        // Lámina fija (sin mandos): aquí importa ver el concepto, no manipularlo.
        lamina ? h('div.lc-figura', lamina) : null,
        h('p.mc-enlaces',
          h('a.btn.secondary', { href: tlink(claseTit, ['curso', actual.clase]) }, conIcono('libro', `Verlo en su clase${claseTit !== tit ? ` (${TITULACIONES[claseTit].sigla})` : ''}`)),
          h('a.btn.secondary', { href: tlink(tit, ['mapas', id], { v: 'mapa', n: actual.id }) }, conIcono('red', 'Verlo en el mapa entero')),
          fichas)),
      grupo('Viene de', 'atras', v.entran, 'entra'),
      grupo('Lleva a', 'adelante', v.salen, 'sale'),
      grupo('No lo confundas con', 'aviso', v.confunde, 'confunde'));
    // La ficha de la idea (src/ui/views/idea.js), si el banco activo tiene etiquetas y la idea se enseña en esta clase.
    if (progress) {
      conceptosDelBanco(currentEje(progress), tit).then((ic) => {
        const fs = fichasDeNodo(ic, actual, tit);
        if (fs.length && fichas.isConnected) setChildren(fichas, fs.map((c) => h('a.btn.secondary.enlace-ficha', { href: hrefFicha(tit, c.id, `mapas/${id}`) }, conIcono('bombilla', `Ficha: ${c.etiqueta}`))));
      }).catch(() => {});
    }
    summaryText = `VISTA mapa ${mapa.titulo} · ${actual.nombre}: ${actual.corto}\nVIENE DE: ${v.entran.map((x) => `${x.nodo.nombre} (${x.arista.rel})`).join('; ') || '—'}\nLLEVA A: ${v.salen.map((x) => `${x.nodo.nombre} (${x.arista.rel})`).join('; ') || '—'}\nNO CONFUNDIR: ${v.confunde.map((x) => `${x.nodo.nombre}: ${x.arista.rel}`).join('; ') || '—'}`;
    window.scrollTo(0, 0);
  }).catch((e) => setChildren(el, h('p.warn', `No se pudo cargar el mapa: ${e.message}`)));

  return { el, summary: () => summaryText };
}

/**
 * El mapa entero: el dibujo en estilo C (cada concepto es un enlace a explorarlo) en un recuadro que se desplaza, y
 * debajo las relaciones numeradas y las confusiones con su letra, escritas.
 */
function mapaEntero(mapa, nodos, actual, hrefExplorar) {
  const r = mapaSvg(mapa, { actual: actual.id, href: hrefExplorar });
  const lienzo = h('div.mc-lienzo', { tabindex: '0', role: 'region', 'aria-label': `Mapa entero: ${mapa.titulo}. Se desplaza.`, html: r.svg });
  // Al abrir, el concepto que se estaba mirando queda a la vista.
  const centra = () => {
    const n = lienzo.querySelector('[aria-current]');
    const svg = lienzo.querySelector('svg');
    if (!n || !svg || !lienzo.isConnected) return;
    const k = svg.getBoundingClientRect().width / r.W || 1; // en el escritorio el mapa se agranda
    lienzo.scrollLeft = Math.max(0, Number(n.getAttribute('data-cx')) * k - lienzo.clientWidth / 2);
    lienzo.scrollTop = Math.max(0, Number(n.getAttribute('data-cy')) * k - lienzo.clientHeight / 2);
  };
  requestAnimationFrame(() => requestAnimationFrame(centra));
  const nombre = (nid) => h('a', { href: hrefExplorar(nodos.get(nid)) }, nodos.get(nid).nombre);
  return [
    h('p.mc-ayuda', 'Desliza para recorrerlo y toca un concepto para explorarlo. Cada flecha lleva un número: su relación está escrita debajo. A trazos y con letra, lo que se suele confundir.'),
    lienzo,
    h('section.mc-leyenda', { 'aria-label': 'Relaciones del mapa' },
      h('h2.mc-leyenda-tit', 'Relaciones'),
      h('ol.mc-rels', r.relaciones.map((x) => h('li', h('span.mc-num', { 'aria-hidden': 'true' }, x.marca),
        h('span.mc-rel-tx', nombre(x.de), h('span.mc-flecha', ' → '), h('em', x.rel), h('span.mc-flecha', ' → '), nombre(x.a))))),
      r.confusiones.length ? [h('h2.mc-leyenda-tit', conIcono('aviso', 'No lo confundas')),
        h('ol.mc-rels.confunde', r.confusiones.map((x) => h('li', h('span.mc-num', { 'aria-hidden': 'true' }, x.marca),
          h('span.mc-rel-tx', nombre(x.de), ' y ', nombre(x.a), ': ', h('em', x.rel)))))] : null),
  ];
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
        botones.forEach((b, j) => {
          b.disabled = true;
          // Bien o mal también con un icono, no solo con el color del borde.
          if (j === p.correcta) { b.classList.add('correcta'); b.prepend(icono('ok', 'ico-t', 'Correcta: ')); } else if (j === k) { b.classList.add('fallada'); b.prepend(icono('no', 'ico-t', 'Tu respuesta: ')); }
        });
        const bien = k === p.correcta; if (bien) ok += 1;
        const A = nodos.get(p.de); const B = nodos.get(p.a);
        setChildren(fb, h('p', { class: bien ? 'ok' : 'warn' }, conIcono(bien ? 'ok' : 'no', bien ? '¡Bien!' : 'No.')),
          h('p.mc-solucion', `${A.nombre} → ${p.rel} → ${B.nombre}`),
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
