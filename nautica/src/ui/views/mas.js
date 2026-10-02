// #/mas — Más: biblioteca de apoyo, tu estudio, titulación, voz del profe y copia de seguridad.

import { h } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink } from '../titulacion.js';

export function masView({ tit }) {
  const T = TITULACIONES[tit];
  const el = h('div.mas',
    h('h1', 'Más'),
    h('section', h('h2', 'Biblioteca'),
      h('div.cards',
        h('a.card', { href: tlink(tit, ['laminas']) }, h('h3', '🎞️ Láminas animadas')),
        h('a.card', { href: link(['reglas']) }, h('h3', '🧠 Reglas para recordar')),
        h('a.card', { href: link(['conceptos']) }, h('h3', '📘 Conceptos de carta')),
        h('a.card', { href: link(['mesa']) }, h('h3', '🗺️ Mesa de cartas')))),
    h('section', h('h2', 'Tu estudio'),
      h('div.cards', h('a.card', { href: link(['progreso']) }, h('h3', '📈 Mi progreso')))),
    h('section', h('h2', 'Titulación'),
      h('div.titulaciones', Object.values(TITULACIONES).map((X) => h('a.btn.grande', { href: tlink(X.id), class: X.id === tit ? '' : 'secondary', 'aria-current': X.id === tit ? 'true' : null },
        X.id === 'per' ? 'PER' : X.nombre)))),
  );
  return { el, summary: () => `VISTA más · titulación activa ${T.sigla}\nRUTAS: #/${tit}/laminas · #/reglas · #/conceptos · #/mesa · #/progreso` };
}
