// Componente: muestra una o varias ilustraciones de teoría (con botón de sonido si la ilustración lo tiene).
// Si la lámina tiene versión interactiva (src/illustrations/interactivas.js), monta el componente compartido en el modo
// que corresponde a dónde aparece: 'clase' (curso), 'explicacion' (panel del profe) o 'galeria' (por defecto).
// Si la lámina ya está en estilo C (src/illustrations/marcos.js), la envuelve en su marco: tema, título, frase clave,
// datos y nota (docs/ESTILO-LAMINAS.md). En la explicación de una pregunta solo va la figura.

import { h } from './dom.js';
import { renderIllustration } from '../illustrations/index.js';
import { interactivaDe, pidePrediccion } from '../illustrations/interactivas.js';
import { marcoDe } from '../illustrations/marcos.js';
import { playSignal } from '../illustrations/situations.js';
import { laminaEl } from './lamina.js';
import { marcoEl } from './lamina-marco.js';
import { conIcono } from './iconos.js';

/**
 * @param {object|object[]} specs
 * @param {{ modo?: 'clase'|'explicacion'|'galeria', onRespuesta?: Function, nivel?: 1|2|3 }} o  nivel: del título del marco
 */
export function illustrationEls(specs, { modo = 'galeria', onRespuesta = null, nivel = 3 } = {}) {
  const list = (Array.isArray(specs) ? specs : [specs]).filter(Boolean);
  return list.map((spec) => {
    const r = renderIllustration(spec);
    if (!r) return null;
    const def = interactivaDe(spec);
    const m = modo === 'explicacion' ? null : marcoDe(spec);
    // En clase, si la lámina pide predecir, el marco no enseña la frase clave ni la nota hasta que se responde.
    const espera = !!m && modo === 'clase' && pidePrediccion(spec);
    let marco = null;
    const responde = espera ? (ok) => { marco?.revelar(); onRespuesta?.(ok); } : onRespuesta;
    // La lectura de la lámina ya explica el estado: el pie fijo sobraría.
    const fig = def ? laminaEl(def, spec, { modo, onRespuesta: responde }) : h('figure.il-figure', h('div.il-svg', { html: r.svg }),
      r.caption ? h('figcaption', r.caption) : null,
      r.sound ? h('button.small.secondary', { type: 'button', onclick: () => playSignal(r.sound) }, conIcono('play', 'Escuchar la señal')) : null);
    marco = m ? marcoEl(m, [fig], { nivel, oculta: espera }) : null;
    return marco ?? fig;
  }).filter(Boolean);
}
