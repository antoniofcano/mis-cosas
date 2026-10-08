// #/calculadora — la calculadora científica a pantalla completa, con cómo se usa para las cuentas del examen.
// La misma calculadora (memoria y Ans) que la flotante que se abre desde la carta, los ejercicios y las preguntas.

import { h } from '../dom.js';
import { tlink, volver, currentTit, TITULACIONES } from '../titulacion.js';
import { calculadoraEnPagina } from '../calculadora.js';
import { APENDICE_PUBLICADO } from '../../course/apendice.js';
import { conIcono } from '../iconos.js';

// Ejemplos de uso: [qué se quiere, teclas, lo que sale]
const EJEMPLOS = [
  ['Pasar 12°30′ a decimal y volver', '12 °′″ 30 °′″ =  →  12°30′0″;  °′″  →  12.5;  °′″  →  12°30′0″', 'La misma tecla cambia el resultado de sexagesimal a decimal y al revés. SHIFT °′″ (←) lo deja en decimal.'],
  ['Sumar grados y minutos', '12 °′″ 45 °′″ + 3 °′″ 30 °′″ =', '16°15′0″. Restar es igual. Con un número delante, (−), el valor es negativo (una declinación W).'],
  ['Horas, minutos y segundos', '22 °′″ 40 °′″ + 3 °′″ 35 °′″ =', '26°15′0″, es decir, 26 h 15 min: pasa de 24 h, así que son las 02:15 del día siguiente. Para la calculadora horas y grados son lo mismo.'],
  ['Tiempo = distancia / velocidad', '12.7 ÷ 8 =  →  1.5875;  °′″  →  1°35′15″', '1,5875 horas son 1 h 35 min 15 s.'],
  ['Seno, coseno y tangente', '10 × cos 60 ) =', '5. Siempre en grados: en la pantalla, la «D».'],
  ['Inversas: el ángulo', 'SHIFT tan 367.5 ÷ 305 =', '50.30…°: el arcotangente da grados. SHIFT sin y SHIFT cos, igual; con un valor mayor que 1, «Math ERROR».'],
  ['Seguir con el resultado', '× 2 =  y  =  otra vez', 'Tras «=», una operación sigue desde Ans; «=» de nuevo repite la cuenta con el último resultado.'],
  ['Memoria', 'M+ suma a la memoria, M− (o SHIFT M+) resta y MR la recupera', 'SHIFT MR la borra. AC no borra ni la memoria ni Ans.'],
];

export function calculadoraView({ progress }) {
  const tit = currentTit(progress);
  const T = TITULACIONES[tit];
  const el = h('div.calculadora-vista',
    volver('Biblioteca', tlink(tit, ['biblioteca'])),
    h('h1', conIcono('calculadora', 'Calculadora científica')),
    h('p', 'Con las teclas y la forma de trabajar de la que se permite en el examen: dos líneas (la cuenta arriba y el resultado abajo), siempre en grados. Practica aquí las cuentas para llevarlas hechas al examen.'),
    h('p.muted.small', `${T.calculadora ? `En el examen del ${T.sigla} se permite: en los simulacros la tienes a mano.` : `En el examen del ${T.sigla} depende del tribunal: en los simulacros aparece solo si el tuyo la permite.`} Usa punto decimal: 12.5 es 12,5.`),
    calculadoraEnPagina(),
    h('section.calc-ayuda',
      h('h2', 'Cómo se hacen las cuentas del examen'),
      h('dl', EJEMPLOS.map(([que, teclas, sale]) => [h('dt', que), h('dd', h('code.calc-teclas-txt', teclas), h('br'), sale)]))),
    h('details.calc-atajos', h('summary', 'Con el teclado del ordenador'),
      h('p.small', 'Cifras, punto o coma, + − * /, paréntesis. Intro o = calcula; Retroceso es DEL y Esc es AC. s, c, t: seno, coseno y tangente (S, C, T en mayúscula: las inversas). r: raíz, q: al cuadrado, i: inverso, p: π, a: Ans, m: MR, g o \': °′″ (G: a decimal), n: signo (−).')),
    !APENDICE_PUBLICADO ? null : h('p', h('a.btn.secondary', { href: tlink(tit, ['cuentas']) }, conIcono('cuentas', 'Las cuentas del patrón: grados, horas, signos y trigonometría'))),
  );
  return {
    el,
    summary: () => `VISTA calculadora científica (DEG, dos líneas). Ejemplos:\n${EJEMPLOS.map(([q, t, s]) => `${q}: ${t} → ${s}`).join('\n')}`,
  };
}
