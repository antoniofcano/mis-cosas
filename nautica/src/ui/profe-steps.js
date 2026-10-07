// Lista de pasos con la explicación del profe y botón de voz (pistas de ejercicios y soluciones de examen).

import { h } from './dom.js';
import { voice } from './voice.js';
import { glosar } from './glosas.js';

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
        h('span.profe-badge', '👨‍🏫'), ' ', n.intro,
        n.tip ? h('p.tip', '💡 ', n.tip) : null,
        n.trap ? h('p.trap', '⚠️ ', n.trap) : null)
      : null;
    const li = h('li',
      h('strong', s.title), ' — ', s.text,
      voice.supported && n ? h('button.small.secondary.speak', { type: 'button', title: 'Escuchar al profe', onclick: () => voice.speak(n.speech) }, '🔊') : null,
      extra);
    glosar(li, glosas);
    return li;
  });
}

/** Botón «escuchar todo»: introducción + pasos visibles. */
export function listenAllButton(getTexts) {
  if (!voice.supported) return null;
  return h('button.small.secondary', { type: 'button', onclick: () => (voice.speaking ? voice.stop() : voice.speak(getTexts().join(' '))) }, '🔊 Escuchar al profe');
}
