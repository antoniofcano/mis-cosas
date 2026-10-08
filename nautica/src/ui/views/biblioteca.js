// #/<tit>/biblioteca — recursos de estudio: láminas, ejercicios de carta, reglas para recordar, conceptos, mesa,
// las cuentas del patrón (apéndice de matemáticas) y la calculadora científica.
// Los ajustes (fecha del examen, voz, instalar, copia) están en #/ajustes, tras el engranaje de la cabecera.

import { h } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { APENDICE_PUBLICADO } from '../../course/apendice.js';
import { conIcono } from '../iconos.js';

export function bibliotecaView({ tit }) {
  const T = TITULACIONES[tit];
  const per = tit === 'per';
  // Grupos, una línea por recurso: la guía, lo que se escucha, lo que se ve y se practica, y la carta.
  const grupos = [
    ['Empezar', [
      [tlink(tit, ['guia']), 'brujula', 'Cómo funciona el curso', 'El método y cómo aprobar, en cinco pantallas (3 minutos).'],
    ]],
    ['Escuchar', [
      [tlink(tit, ['podcast']), 'podcast', 'Radio de a bordo', 'Episodios cortos del temario, con el guion y preguntas reales.'],
    ]],
    ['Ver y practicar', [
      [tlink(tit, ['laminas']), 'lamina', 'Láminas', per ? 'Boyas, luces de buques, maniobra y meteorología; muchas se tocan.' : 'Estabilidad, frentes y nubes, mareas, radar y navegación; muchas se tocan.'],
      [tlink(tit, ['tarjetas']), 'tarjetas', 'Tarjetas de memoria', per ? 'Luces, boyas, sonidos, banderas y escalas, para repetir.' : 'Señales de peligro, escalas, clases de fuego y siglas del GNSS, para repetir.'],
      [tlink(tit, ['mapas']), 'red', 'Mapas de conceptos', per ? 'Las ideas que más se confunden (rumbos, balizamiento, RIPA), con un juego.' : 'Las ideas que más se confunden (meteorología, viento y corriente), con un juego.'],
      [link(['reglas']), 'nudo', 'Reglas para recordar', 'Trucos que funcionan, con su explicación.'],
    ]],
    ['Carta', [
      [tlink(tit, ['carta']), 'mapa', 'Ejercicios de carta', 'Problemas con datos nuevos cada vez, corregidos paso a paso.'],
      [link(['conceptos']), 'libro', 'Conceptos de carta', 'Signos, glosario y el método de cada ejercicio.'],
      [link(['mesa']), 'compas', 'Mesa de cartas', 'La carta del Estrecho con regla, compás y transportador.'],
    ]],
    ['Cuentas', [
      ...(!APENDICE_PUBLICADO ? [] : [[tlink(tit, ['cuentas']), 'cuentas', 'Las cuentas del patrón', per ? 'Grados y minutos, horas y signos de los rumbos, con ejercicios para la calculadora.'
        : 'Grados, horas, signos, trigonometría y regla de tres, con ejercicios para la calculadora.']]),
      [link(['calculadora']), 'calculadora', 'Calculadora científica', 'Con las teclas de la que se permite en el examen: °′″, seno, coseno, tangente y memoria.'],
    ]],
  ];
  const recursos = grupos.flatMap(([, rs]) => rs);
  const el = h('div.mas.biblioteca',
    h('h1', `Biblioteca · ${T.sigla}`),
    grupos.map(([nombre, rs]) => h('section.grupo-biblioteca', h('h2', nombre),
      h('div.cards', rs.map(([href, ico, titulo, texto]) => h('a.card', { href }, h('h3', conIcono(ico, titulo)), h('p', texto)))))));
  return {
    el,
    summary: () => `VISTA biblioteca ${T.sigla}\n${recursos.map(([href, , t]) => `${t} → ${href}`).join('\n')}`,
  };
}
