// #/<tit>/mas — «Más», la cuarta pestaña: todo lo que no es la sesión de hoy, el temario ni el examen. La biblioteca
// (láminas, mapas, reglas, carta), la radio de a bordo, las tarjetas, la calculadora, las cuentas, las chuletas, tu
// progreso y plan, la copia de seguridad, los ajustes y el modo profesor. Solo enlaza: cada cosa sigue en su dirección
// de siempre (#/<tit>/biblioteca, #/<tit>/podcast, #/calculadora, #/ajustes, #/profe…).

import { h, setChildren } from '../dom.js';
import { link } from '../router.js';
import { TITULACIONES, tlink, currentEje } from '../titulacion.js';
import { conceptosDelBanco } from '../concepto.js';
import { cargarBanco } from '../../bancos/index.js';
import { bloquesEnOrden } from '../../theory/blocks.js';
import { APENDICE_PUBLICADO } from '../../course/apendice.js';
import { guardarCopia, botonRecuperar, lineaProteccion } from '../copia.js';
import { fechaLarga } from '../../texto.js';
import { icono, conIcono } from '../iconos.js';

/** Icono de una fila de «Más», en su disco. */
const discoFila = (ico) => h('span.mas-fila-ico', icono(ico));

/** Una fila de «Más»: enlace grande con su icono, título y una línea de qué hay. */
const fila = (href, ico, titulo, texto) => h('li', h('a.mas-fila', { href }, discoFila(ico), h('span.mas-fila-tx', h('strong', titulo), h('span.muted.small', texto)), h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›')));

export function masMenuView({ progress, tit }) {
  const T = TITULACIONES[tit];
  const per = tit === 'per';
  const grupos = [
    ['Estudiar a tu aire', [
      [tlink(tit, ['biblioteca']), 'biblioteca', 'Biblioteca', 'Láminas, mapas de conceptos, reglas para recordar y ejercicios de carta.'],
      [tlink(tit, ['podcast']), 'podcast', 'Radio de a bordo', 'Episodios cortos del temario, para el coche o un paseo.'],
      [tlink(tit, ['tarjetas']), 'tarjetas', 'Tarjetas de memoria', per ? 'Luces, boyas, sonidos, banderas y escalas, para repetir.' : 'Señales, escalas, fuegos y siglas, para repetir.'],
      [link(['calculadora']), 'calculadora', 'Calculadora científica', 'La que se permite en el examen: °′″, seno, coseno, tangente y memoria.'],
      ...(APENDICE_PUBLICADO ? [[tlink(tit, ['cuentas']), 'cuentas', 'Las cuentas del patrón', 'Grados, horas y signos, con ejercicios para la calculadora.']] : []),
    ]],
    ['Tu estudio', [
      ['#/progreso', 'progreso', 'Mi progreso', 'Cómo vas en cada tema y si estás listo para el examen.'],
      [tlink(tit, ['plan']), 'calendario', 'Mi plan', 'Día a día hasta el examen.'],
      [tlink(tit, ['guia']), 'brujula', 'Cómo funciona el curso', 'El método y cómo aprobar, en 3 minutos.'],
    ]],
    ['Ajustes', [
      ['#/ajustes', 'ajustes', 'Ajustes', 'Fecha del examen, minutos al día, titulación, letra, voz del profe, sonidos y vibración.'],
      ['#/profe', 'profe', 'Modo profesor', 'Para profesores: reordenar la ruta y compartir la configuración.'],
    ]],
  ];
  // El test de nivel, solo si el banco activo tiene sus preguntas etiquetadas por concepto (llega cuando carga).
  const filaNivel = h('li', { hidden: true });
  const filaTravesia = h('li', { hidden: true }); // la travesía, también solo con etiquetas
  const eje = currentEje(progress);
  Promise.all([cargarBanco(eje, tit), conceptosDelBanco(eje, tit)]).then(([banco, ic]) => {
    if (!ic) return;
    setChildren(filaTravesia, h('a.mas-fila', { href: tlink(tit, ['travesia']) }, discoFila('faro'), h('span.mas-fila-tx', h('strong', 'Tu travesía'),
      h('span.muted.small', 'Tu rango, un faro por bloque del temario, la semana y las insignias.')), h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›')));
    filaTravesia.hidden = false;
    const hecho = progress.nivel(banco.eje.id, tit);
    setChildren(filaNivel, h('a.mas-fila', { href: tlink(tit, ['nivel'], hecho ? { repetir: '1' } : undefined), onclick: (ev) => {
      if (hecho && !confirm('¿Repetir el test de nivel? El resultado nuevo sustituye al anterior. Lo que respondas cuenta como cualquier respuesta.')) ev.preventDefault();
    } }, discoFila('diana'), h('span.mas-fila-tx', h('strong', hecho ? 'Repetir el test de nivel' : 'Test de nivel'),
      h('span.muted.small', hecho ? `Lo hiciste: ${hecho.aciertos} de ${hecho.total} bien. Repítelo si ha pasado tiempo.` : '¿Ya sabes algo? Unas 20 preguntas para saltarte lo que ya sabes.')),
    h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›')));
    filaNivel.hidden = false;
  }).catch(() => {});
  const copiaHecha = h('p.muted.small', progress.settings().ultimaCopia ? `Última copia: ${fechaLarga(progress.settings().ultimaCopia)}.` : 'Aún no has guardado ninguna copia.');
  const el = h('div.mas-menu',
    h('h1', 'Más'),
    grupos.map(([nombre, rs]) => h('section.mas-grupo', h('h2.eti', nombre), h('ul.mas-lista', rs.map(([href, ico, t, x]) => fila(href, ico, t, x)), nombre === 'Tu estudio' ? [filaTravesia, filaNivel] : null))),
    h('section.mas-grupo', h('h2.eti', 'Chuletas para imprimir'),
      h('details.mas-chuletas', h('summary', conIcono('chincheta', `La chuleta de cada tema del ${T.sigla}`)),
        h('ul.mas-lista.compacta', bloquesEnOrden(T.estructura).map((b) => h('li', h('a.mas-fila', { href: tlink(tit, ['temario', String(b.ut), 'chuleta']) },
          discoFila(b.ico), h('span.mas-fila-tx', h('strong', b.titulo)), h('span.mas-fila-flecha', { 'aria-hidden': 'true' }, '›'))))))),
    h('section.mas-grupo.mas-copia', h('h2.eti', 'Copia de seguridad'),
      h('p.small', 'Lo que estudias se guarda solo en este aparato. Guarda una copia de vez en cuando.'),
      copiaHecha,
      lineaProteccion(progress),
      h('div.actions',
        h('button', { type: 'button', onclick: () => { guardarCopia(progress); copiaHecha.textContent = `Última copia: ${fechaLarga(Date.now())}.`; } }, 'Guardar una copia'),
        botonRecuperar(progress))));
  const enlaces = grupos.flatMap(([, rs]) => rs);
  return { el, summary: () => `VISTA más ${T.sigla}\n${enlaces.map(([href, , t]) => `${t} → ${href}`).join('\n')}${filaTravesia.hidden ? '' : `\nTu travesía → ${tlink(tit, ['travesia'])}`}\nCHULETAS: #/${tit}/temario/<ut>/chuleta` };
}
