// #/<tit>/biblioteca — recursos de estudio: láminas, ejercicios de carta, reglas para recordar, conceptos y mesa.
// Los ajustes (fecha del examen, voz, instalar, copia) están en #/ajustes, tras el engranaje de la cabecera.

import { h } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink } from '../titulacion.js';

export function bibliotecaView({ tit }) {
  const T = TITULACIONES[tit];
  const per = tit === 'per';
  // Tres grupos, una línea por recurso: lo que se escucha, lo que se ve y se practica, y la carta.
  const grupos = [
    ['Escuchar', [
      [tlink(tit, ['podcast']), '🎧 Radio de a bordo', 'Episodios cortos del temario, con el guion y preguntas reales.'],
    ]],
    ['Ver y practicar', [
      [tlink(tit, ['laminas']), '🎞️ Láminas', per ? 'Boyas, luces de buques, maniobra y meteorología; muchas se tocan.' : 'Estabilidad, frentes y nubes, mareas, radar y navegación; muchas se tocan.'],
      [tlink(tit, ['tarjetas']), '🃏 Tarjetas de memoria', per ? 'Luces, boyas, sonidos, banderas y escalas, para repetir.' : 'Señales de peligro, escalas, clases de fuego y siglas del GNSS, para repetir.'],
      [tlink(tit, ['mapas']), '🕸️ Mapas de conceptos', per ? 'Las ideas que más se confunden (rumbos, balizamiento, RIPA), con un juego.' : 'Las ideas que más se confunden (meteorología, viento y corriente), con un juego.'],
      [link(['reglas']), '🧠 Reglas para recordar', 'Trucos que funcionan, con su explicación.'],
    ]],
    ['Carta', [
      [tlink(tit, ['carta']), '🗺️ Ejercicios de carta', 'Problemas con datos nuevos cada vez, corregidos paso a paso.'],
      [link(['conceptos']), '📘 Conceptos de carta', 'Signos, glosario y el método de cada ejercicio.'],
      [link(['mesa']), '🧰 Mesa de cartas', 'La carta del Estrecho con regla, compás y transportador.'],
    ]],
  ];
  const recursos = grupos.flatMap(([, rs]) => rs);
  const el = h('div.mas.biblioteca',
    h('h1', `Biblioteca · ${T.sigla}`),
    grupos.map(([nombre, rs]) => h('section.grupo-biblioteca', h('h2', nombre),
      h('div.cards', rs.map(([href, titulo, texto]) => h('a.card', { href }, h('h3', titulo), h('p', texto)))))));
  return {
    el,
    summary: () => `VISTA biblioteca ${T.sigla}\n${recursos.map(([href, t]) => `${t} → ${href}`).join('\n')}`,
  };
}
