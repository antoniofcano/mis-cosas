// «🕸️ Remate con los mapas»: al acabar un repaso, tres preguntas de relaciones de los temas repasados.

import { h, setChildren } from './dom.js';
import { cargarMapas, juegoMapa } from './views/mapas.js';
import { preguntasRepaso } from '../course/mapas.js';
import { createRng, randomSeed } from '../math/rng.js';

const N = 3;

/** Sección que aparece sola si algún mapa toca los temas repasados. */
export function remateMapas(tit, uts) {
  const el = h('section.remate-mapas', { hidden: true });
  cargarMapas().then((mapas) => {
    const hacer = () => preguntasRepaso(mapas, tit, uts, createRng(randomSeed()), N);
    if (!hacer().length) return;
    setChildren(el, h('h2', '🕸️ Remate con los mapas'),
      h('p', 'Tres preguntas rápidas sobre cómo se relacionan las ideas de lo que acabas de repasar.'),
      h('button.grande.secondary', { type: 'button', onclick: () => setChildren(el, h('h2', '🕸️ Remate con los mapas'),
        juegoMapa(hacer, { fin: (ok, n) => [h('h2', `${ok} de ${n}`), h('p', ok === n ? 'Relaciones claras.' : 'Las que han fallado están en Biblioteca → Mapas de conceptos.')] })) }, `Hacer las ${N} preguntas`));
    el.hidden = false;
  }).catch(() => {});
  return el;
}
