// #/<tit>/mas — «Más», la cuarta pestaña: todo lo que no es la sesión de hoy, el temario ni el examen. La biblioteca
// (láminas, mapas, reglas, carta), la radio de a bordo, las tarjetas, la calculadora, las cuentas, las chuletas, tu
// progreso y plan, la copia de seguridad, los ajustes y el modo profesor. Solo enlaza: cada cosa sigue en su dirección
// de siempre (#/<tit>/biblioteca, #/<tit>/podcast, #/calculadora, #/ajustes, #/profe…).

import { h } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink } from '../titulacion.js';
import { bloquesEnOrden } from '../../theory/blocks.js';
import { APENDICE_PUBLICADO } from '../../course/apendice.js';
import { guardarCopia, botonRecuperar } from '../copia.js';
import { fechaLarga } from '../../texto.js';

/** Una fila de «Más»: enlace grande con título y una línea de qué hay. */
const fila = (href, titulo, texto) => h('li', h('a.mas-fila', { href }, h('span.mas-fila-tx', h('strong', titulo), h('span.muted.small', texto)), h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›')));

export function masMenuView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const per = tit === 'per';
  const grupos = [
    ['Estudiar a tu aire', [
      [tlink(tit, ['biblioteca']), '📚 Biblioteca', 'Láminas, mapas de conceptos, reglas para recordar y ejercicios de carta.'],
      [tlink(tit, ['podcast']), '🎧 Radio de a bordo', 'Episodios cortos del temario, para el coche o un paseo.'],
      [tlink(tit, ['tarjetas']), '🃏 Tarjetas de memoria', per ? 'Luces, boyas, sonidos, banderas y escalas, para repetir.' : 'Señales, escalas, fuegos y siglas, para repetir.'],
      [link(['calculadora']), '🧮 Calculadora científica', 'La que se permite en el examen: °′″, seno, coseno, tangente y memoria.'],
      ...(APENDICE_PUBLICADO ? [[tlink(tit, ['cuentas']), '➗ Las cuentas del patrón', 'Grados, horas y signos, con ejercicios para la calculadora.']] : []),
    ]],
    ['Tu estudio', [
      ['#/progreso', '📈 Mi progreso', 'Cómo vas en cada tema y si estás listo para el examen.'],
      [tlink(tit, ['plan']), '🗓 Mi plan', 'Día a día hasta el examen.'],
      [tlink(tit, ['guia']), '🧭 Cómo funciona el curso', 'El método y cómo aprobar, en 3 minutos.'],
    ]],
    ['Ajustes', [
      ['#/ajustes', '⚙️ Ajustes', 'Fecha del examen, minutos al día, titulación, letra y voz del profe.'],
      ['#/profe', '🧑‍🏫 Modo profesor', 'Para profesores: reordenar la ruta y compartir la configuración.'],
    ]],
  ];
  const copiaHecha = h('p.muted.small', progress.settings().ultimaCopia ? `Última copia: ${fechaLarga(progress.settings().ultimaCopia)}.` : 'Aún no has guardado ninguna copia.');
  const el = h('div.mas-menu',
    h('h1', 'Más'),
    grupos.map(([nombre, rs]) => h('section.mas-grupo', h('h2.eti', nombre), h('ul.mas-lista', rs.map(([href, t, x]) => fila(href, t, x))))),
    h('section.mas-grupo', h('h2.eti', 'Chuletas para imprimir'),
      h('details.mas-chuletas', h('summary', `📌 La chuleta de cada tema del ${T.sigla}`),
        h('ul.mas-lista.compacta', bloquesEnOrden(T.estructura).map((b) => h('li', h('a.mas-fila', { href: tlink(tit, ['temario', String(b.ut), 'chuleta']) },
          h('span.mas-fila-tx', h('strong', `${b.icon} ${b.titulo}`)), h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›'))))))),
    h('section.mas-grupo.mas-copia', h('h2.eti', 'Copia de seguridad'),
      h('p.small', 'Lo que estudias se guarda solo en este aparato. Guarda una copia de vez en cuando.'),
      copiaHecha,
      h('div.actions',
        h('button', { type: 'button', onclick: () => { guardarCopia(progress); copiaHecha.textContent = `Última copia: ${fechaLarga(Date.now())}.`; } }, 'Guardar una copia'),
        botonRecuperar(progress))));
  const enlaces = grupos.flatMap(([, rs]) => rs);
  return { el, summary: () => `VISTA más ${T.sigla}\n${enlaces.map(([href, t]) => `${t} → ${href}`).join('\n')}\nCHULETAS: #/${tit}/temario/<ut>/chuleta` };
}
