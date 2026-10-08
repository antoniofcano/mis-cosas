// «Míralo en el mapa»: si el fallo es una de las trampas de un mapa de conceptos, la explica y lleva al mapa.

import { h, setChildren } from './dom.js';
import { tlink } from './titulacion.js';
import { cargarMapas } from './views/mapas.js';
import { trampaDePregunta } from '../course/mapas.js';
import { icono, conIcono } from './iconos.js';

/** Hueco que se rellena solo cuando cargan los mapas (vacío si el fallo no es una trampa de ningún mapa). */
export function enlaceTrampa(q, elegida) {
  const el = h('div.mapa-trampa', { hidden: true });
  const tit = q.tit ?? '';
  if (!tit || elegida == null || elegida === q.correcta) return el;
  cargarMapas().then((mapas) => {
    const t = trampaDePregunta(mapas, tit, q, elegida);
    if (!t) return;
    setChildren(el,
      h('p.trap', icono('red', 'ico-t'), `Trampa clásica: «${t.elegido.nombre}» no es «${t.correcto.nombre}». ${t.arista.rel}`),
      h('p', h('a.btn.secondary', { href: tlink(tit, ['mapas', t.mapa.id], { n: t.elegido.id }) }, conIcono('red', 'Míralo en el mapa'))));
    el.hidden = false;
  }).catch(() => {});
  return el;
}
