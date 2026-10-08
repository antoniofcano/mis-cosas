// Marco común de las láminas en estilo C (docs/ESTILO-LAMINAS.md), en HTML: eyebrow (tema), título en serifa, frase
// clave con doble filete, la figura (estática o interactiva), los datos en recuadros y la «Nota». Los textos salen de
// src/illustrations/marcos.js; si una lámina no tiene marco, se pinta como siempre (lo decide illustration.js).

import { h } from './dom.js';

/**
 * @param {{ tema: string, titulo: string, clave: string, nota?: string, datos?: { cifra: string, texto: string }[] }} m
 * @param {Element[]} figura  lo que se dibuja (la figura o la lámina interactiva entera)
 * @param {{ nivel?: 1|2|3, cabecera?: boolean }} o  nivel del título; cabecera: false deja solo la frase clave
 */
export function marcoEl(m, figura, { nivel = 3, cabecera = true } = {}) {
  const titulo = h(`h${nivel}.lc-titulo`, m.titulo);
  return h('section.lc-marco', { 'aria-label': `Lámina: ${m.titulo}` },
    h('div.lc-cab',
      cabecera ? h('p.lc-eti', `Lámina · ${m.tema}`) : null,
      cabecera ? titulo : null,
      h('p.lc-clave', m.clave)),
    h('div.lc-figura', figura),
    m.datos?.length ? h('ul.lc-datos', m.datos.map((d) => h('li', h(`span.lc-cifra${d.cifra.length > 9 ? '.muy-larga' : d.cifra.length > 6 ? '.larga' : ''}`, d.cifra), h('span.lc-dato-txt', d.texto)))) : null,
    m.nota ? h('aside.lc-nota', h('p.lc-nota-eti', 'Nota'), h('p.lc-nota-txt', m.nota)) : null);
}
