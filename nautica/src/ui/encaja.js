// «🕸️ Dónde encaja esto»: al terminar una clase, sus conceptos en los mapas de conceptos, con lo que los rodea.

import { h, setChildren } from './dom.js';
import { tlink } from './titulacion.js';
import { cargarMapas, mini } from './views/mapas.js';
import { nodosDeClase, vecinos } from '../course/mapas.js';

const MAX = 3; // vecinos por nodo: los justos para situarse; el resto, en el mapa
const NODOS = 2; // conceptos contados enteros; los demás de la clase, solo enlazados

/** Sección que se rellena sola cuando cargan los mapas (vacía si la clase no está en ninguno). */
export function dondeEncaja(tit, claseId) {
  const el = h('section.encaja', { hidden: true });
  cargarMapas().then((mapas) => {
    const xs = nodosDeClase(mapas, claseId, tit);
    if (!xs.length) return;
    const ir = (mapa, n, v) => tlink(tit, ['mapas', mapa.id], v ? { v, n: n.id } : { n: n.id });
    setChildren(el, h('h2', '🕸️ Dónde encaja esto'),
      xs.slice(0, NODOS).map(({ mapa, nodo }) => {
        const v = vecinos(mapa, nodo.id);
        const enlace = (x, txt) => h('a.mapa-vecino', { href: ir(mapa, x.nodo) }, mini(x.nodo.spec), h('span.mapa-vecino-txt', txt));
        const rel = [...v.entran.map((x) => enlace(x, [h('strong', x.nodo.nombre), h('span.mapa-rel', `→ ${x.arista.rel} → ${nodo.nombre}`)])),
          ...v.salen.map((x) => enlace(x, [h('span.mapa-rel', `${nodo.nombre} → ${x.arista.rel} →`), h('strong', x.nodo.nombre)]))].slice(0, MAX);
        return h('div.encaja-nodo',
          h('p', h('a', { href: ir(mapa, nodo) }, h('strong', nodo.nombre)), ` · en el mapa «${mapa.titulo}»`),
          rel,
          v.confunde.length ? h('div.mapa-grupo.confunde', h('h3', '⚠️ No lo confundas con'),
            v.confunde.slice(0, 2).map((x) => enlace(x, [h('strong', x.nodo.nombre), h('span.small', x.arista.rel)]))) : null,
        );
      }),
      xs.length > NODOS ? h('p', 'También en esta clase: ', xs.slice(NODOS).map(({ mapa, nodo }, i) => [i ? ', ' : '', h('a', { href: ir(mapa, nodo) }, nodo.nombre)]), '.') : null,
      // Un botón por mapa, centrado en el primer concepto de la clase.
      h('div.actions', [...new Map(xs.map((x) => [x.mapa.id, x])).values()].map(({ mapa, nodo }) =>
        h('a.btn.secondary', { href: ir(mapa, nodo, 'mapa') }, `🕸️ Ver el mapa entero${xs.some((x) => x.mapa !== mapa) ? `: ${mapa.titulo}` : ''}`))));
    el.hidden = false;
  }).catch(() => {}); // sin mapas, la clase termina igual
  return el;
}
