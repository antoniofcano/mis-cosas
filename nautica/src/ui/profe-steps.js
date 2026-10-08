// Lista de pasos con la explicación del profe y botón de voz (pistas de ejercicios y soluciones de examen).

import { h } from './dom.js';
import { voice } from './voice.js';
import { glosar } from './glosas.js';
import { icono, conIcono } from './iconos.js';

// Las líneas del profe que preparan src/teacher llevan delante un prefijo que dice su tipo (truco, trampa, regla para
// recordar, nota). Aquí se cambia por el icono de línea. Los prefijos van con escapes \u porque son el formato de
// src/teacher, no iconos de la interfaz (tests/iconos.test.js prohíbe emojis literales en src/ui).
const PREFIJOS = [
  ['tip', 'bombilla', /^\u{1F4A1}\uFE0F?\s*/u],
  ['trap', 'aviso', /^\u26A0\uFE0F?\s*/u],
  ['mnemo', 'nudo', /^\u{1F9E0}\uFE0F?\s*/u],
  ['', 'lapiz', /^\u{1F4DD}\uFE0F?\s*/u],
];

/** Una línea del profe → { tipo: 'tip' | 'trap' | 'mnemo' | '', el: <p> con su icono }. */
export function lineaProfe(line) {
  for (const [tipo, ico, re] of PREFIJOS) if (re.test(line)) return { tipo, el: h('p', { class: tipo }, icono(ico), ' ', line.replace(re, '')) };
  return { tipo: '', el: h('p', line) };
}

/** Rótulo «El profe» con su icono. */
export const rotuloProfe = (texto = 'El profe') => h('span.profe-badge', conIcono('profe', texto));

/**
 * @param {{title,text}[]} steps   pasos que se muestran
 * @param {{display,speech,tip,trap,intro}[]} narr  narración de esos pasos (narrateSteps)
 * @param {object} [glosas]  contexto ({ tit, ut }) para explicar las siglas al tocarlas (la primera vez en cada paso)
 */
export function profeStepItems(steps, narr, glosas = null) {
  return steps.map((s, i) => {
    const n = narr[i];
    const extra = n && (n.intro || n.tip || n.trap)
      ? h('div.profe.inline',
        h('span.profe-badge', icono('profe', '', 'El profe')), ' ', n.intro,
        n.tip ? h('p.tip', icono('bombilla'), ' ', n.tip) : null,
        n.trap ? h('p.trap', icono('aviso'), ' ', n.trap) : null)
      : null;
    const li = h('li',
      h('strong', s.title), ' — ', s.text,
      voice.supported && n ? h('button.small.secondary.speak', { type: 'button', title: 'Escuchar al profe', 'aria-label': 'Escuchar al profe', onclick: () => voice.speak(n.speech) }, icono('escuchar')) : null,
      extra);
    glosar(li, glosas);
    return li;
  });
}

/** Botón «escuchar todo»: introducción + pasos visibles. */
export function listenAllButton(getTexts) {
  if (!voice.supported) return null;
  return h('button.small.secondary', { type: 'button', onclick: () => (voice.speaking ? voice.stop() : voice.speak(getTexts().join(' '))) }, conIcono('escuchar', 'Escuchar al profe'));
}
