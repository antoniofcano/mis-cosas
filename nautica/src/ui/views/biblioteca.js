// #/<tit>/biblioteca — recursos de estudio: láminas, ejercicios de carta, reglas para recordar, conceptos y mesa.
// Los ajustes (fecha del examen, voz, instalar, copia) están en #/ajustes, tras el engranaje de la cabecera.

import { h } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink } from '../titulacion.js';

export function bibliotecaView({ tit }) {
  const T = TITULACIONES[tit];
  const recursos = [
    [tlink(tit, ['laminas']), '🎞️ Láminas', 'Boyas con su luz, luces y marcas de buques, maniobra, meteorología… muchas se mueven y se tocan.'],
    [tlink(tit, ['carta']), '🗺️ Ejercicios de carta y cálculo', 'Problemas de carta, mareas, hora y viento aparente con datos nuevos cada vez: lo resuelves, se corrige y el profe te lo explica paso a paso.'],
    [link(['reglas']), '🧠 Reglas para recordar', 'Las que de verdad funcionan, con su explicación.'],
    [link(['conceptos']), '📘 Conceptos de carta', 'Signos, glosario y el método de cada ejercicio.'],
    [link(['mesa']), '🧰 Mesa de cartas', 'La carta del Estrecho con regla, compás y transportador, para trazar a tu aire.'],
  ];
  const el = h('div.mas',
    h('h1', `Biblioteca · ${T.sigla}`),
    h('div.cards', recursos.map(([href, titulo, texto]) => h('a.card', { href }, h('h3', titulo), h('p', texto)))));
  return {
    el,
    summary: () => `VISTA biblioteca ${T.sigla}\n${recursos.map(([href, t]) => `${t} → ${href}`).join('\n')}`,
  };
}
