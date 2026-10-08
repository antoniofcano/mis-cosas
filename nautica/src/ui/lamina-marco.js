// Marco común de las láminas en estilo C (docs/ESTILO-LAMINAS.md), en HTML: eyebrow (tema), título en serifa, frase
// clave con doble filete, la figura (estática o interactiva), los datos en recuadros y la «Nota». Los textos salen de
// src/illustrations/marcos.js; si una lámina no tiene marco, se pinta como siempre (lo decide illustration.js).

import { h } from './dom.js';

/**
 * @param {{ tema: string, titulo: string, clave: string, nota?: string, datos?: { cifra: string, texto: string }[] }} m
 * @param {Element[]} figura  lo que se dibuja (la figura o la lámina interactiva entera)
 * @param {{ nivel?: 1|2|3, cabecera?: boolean, oculta?: boolean }} o  nivel del título; cabecera: false deja solo la frase
 *   clave; oculta: el título, la frase clave, los datos y la nota no se ven hasta llamar a el.revelar() (en clase, mientras la
 *   lámina espera la predicción, no deben dar la respuesta)
 */
export function marcoEl(m, figura, { nivel = 3, cabecera = true, oculta = false } = {}) {
  const titulo = h(`h${nivel}.lc-titulo`, { hidden: oculta }, m.titulo);
  const clave = h('p.lc-clave', { hidden: oculta }, m.clave);
  const datos = m.datos?.length ? h('ul.lc-datos', { hidden: oculta }, m.datos.map((d) => h('li', h(`span.lc-cifra${d.cifra.length > 9 ? '.muy-larga' : d.cifra.length > 6 ? '.larga' : ''}`, d.cifra), h('span.lc-dato-txt', d.texto)))) : null;
  const nota = m.nota ? h('aside.lc-nota', { hidden: oculta }, h('p.lc-nota-eti', 'Nota'), h('p.lc-nota-txt', m.nota)) : null;
  const el = h('section.lc-marco', { 'aria-label': `Lámina: ${m.titulo}` },
    h('div.lc-cab', cabecera ? h('p.lc-eti', `Lámina · ${m.tema}`) : null, cabecera ? titulo : null, clave),
    h('div.lc-figura', figura), datos, nota);
  el.revelar = () => { for (const x of [titulo, clave, datos, nota]) if (x) x.hidden = false; };
  return el;
}
