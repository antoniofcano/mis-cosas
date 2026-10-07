// Mesa de cartas: la carta a pantalla completa con un panel lateral (o inferior en el móvil) que trae el
// ejercicio a la carta para resolverlo sin cambiar de pantalla:
//   · 📋 Ejercicio: enunciado troceado en fichas que se envían a la carta como notas, faros citados
//     resaltados, y el formulario de respuesta del propio ejercicio (se mueve aquí mientras está abierta).
//   · 🎓 Tutorial: la resolución reproducida sobre la carta, paso a paso, con instrumentos y explicación.

import { h, setChildren } from '../dom.js';
import { interactiveChart } from './interactive-chart.js';
import { createTutorial } from './tutorial.js';
import { narrateSteps, narrateIntro, narrateOutro } from '../../teacher/narrate.js';
import { voice } from '../voice.js';

const fold = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Ids de los puntos de la carta que se citan en un texto (para resaltarlos). */
export function marksInText(chart, text) {
  const t = fold(text);
  const ids = new Set();
  for (const p of chart.points()) {
    const names = [p.name.replace(/^Faro de /, '').replace(/\s*\(.*\)$/, '').replace(/,.*$/, ''), p.short, p.portName && `puerto de ${p.portName}`];
    if (p.id === 'punta-gracia') names.push('Punta Camarinal', 'Punta Gracia', 'Punta de Gracia');
    if (names.some((n) => n && n.length > 3 && t.includes(fold(n)))) ids.add(p.id);
  }
  // "Punta Camarinal" en los enunciados se refiere al faro de Punta de Gracia
  ids.delete('punta-camarinal');
  return [...ids];
}

/** Trocea el enunciado en fichas (frases y cláusulas) para enviarlas a la carta. */
export function statementChips(text) {
  return text
    .split(/(?<=[.:?])\s+/)
    .flatMap((sentence) => sentence.split(/,\s+(?=[a-zA-ZáéíóúÁÉÍÓÚñÑ])(?![^()]*\))|;\s+|\s+y\s+(?=(?:demora|marcación|distancia|desvío|la declinación|dm|damos|tomamos|obtenemos))/))
    .map((c) => c.trim().replace(/[.,;]$/, ''))
    .filter((c) => c.length > 2);
}

let openWs = null;

/**
 * @param {object} o
 * @param {object} o.chart  motor de carta
 * @param {string} o.title
 * @param {string} o.statement
 * @param {{title,text}[]} o.steps   pasos de la solución
 * @param {object[]} o.items         primitivas con `step`
 * @param {object[]} o.focus         puntos para encuadrar al abrir
 * @param {HTMLElement[]} [o.answerNodes] nodos (formulario, diagnóstico) que se trasladan al panel
 * @param {'ejercicio'|'tutorial'} [o.tab]
 * @param {object} [o.progress]
 * @param {() => string} [o.summary] resumen para IA del ejercicio
 * @param {boolean} [o.calculadora] false: sin el botón de la calculadora (examen en el que no se permite)
 */
export function openWorkspace(o) {
  openWs?.close();
  let placeholders = [];

  const chartApi = interactiveChart({ chart: o.chart, items: [], focus: o.focus ?? [], step: Infinity, progress: o.progress, fill: true, calculadora: o.calculadora !== false });
  chartApi.setHighlights(marksInText(o.chart, o.statement));

  // --- Panel: ejercicio
  const statementEl = h('p.ws-statement', o.statement);
  const chips = h('div.chips', statementChips(o.statement).map((c) => h('button.chip', { type: 'button', title: 'Enviar a la carta como nota', onclick: () => chartApi.addNote(c) }, c)));
  const sendSel = h('button.small.secondary', {
    type: 'button',
    onclick: () => {
      const sel = String(getSelection()?.toString() ?? '').trim();
      if (sel) chartApi.addNote(sel);
      else chartApi.setReadout('Selecciona primero un trozo del enunciado (o toca una ficha).');
    },
  }, '📌 Enviar lo seleccionado');
  const answersBox = h('div.ws-answers');
  const tabEjercicio = h('section.ws-tab',
    h('h2', 'Enunciado'), statementEl,
    h('p.muted.small', 'Toca una ficha para ponerla en la carta como nota (luego la mueves con ✋). Los faros citados aparecen resaltados.'),
    chips, h('div.actions', sendSel),
    o.answerNodes?.length ? [h('h2', 'Tu respuesta'), answersBox] : null,
  );

  // --- Panel: tutorial
  const narration = {
    intro: narrateIntro(o.statement, { title: o.kind, onChart: true }),
    steps: narrateSteps(o.steps ?? [], { seed: o.title }),
    outro: o.result ? narrateOutro(o.result) : null,
  };
  const caption = h('div.ws-caption', h('p.muted', 'Pulsa ▶ para ver la resolución trazada sobre la carta, paso a paso.'));
  const voiceBtn = h('button.small.secondary', { type: 'button', title: 'Voz del profe', onclick: () => { voice.setEnabled(!voice.enabled); syncVoice(); } });
  const rateSel = h('select.small', { 'aria-label': 'Velocidad de la voz', onchange: (ev) => voice.setRate(Number(ev.target.value)) },
    [[0.85, 'Lenta'], [1, 'Normal'], [1.15, 'Rápida']].map(([v, t]) => h('option', { value: v, selected: voice.rate === v }, t)));
  const syncVoice = () => { voiceBtn.textContent = voice.enabled ? '🔊 Voz' : '🔇 Voz'; voiceBtn.setAttribute('aria-pressed', String(voice.enabled)); rateSel.hidden = !voice.enabled; };
  syncVoice();
  if (!voice.supported) { voiceBtn.hidden = true; rateSel.hidden = true; }
  const profeText = (txt) => txt.split('\n').map((line) => h('p', { class: /^💡/.test(line) ? 'tip' : /^⚠️/.test(line) ? 'trap' : '' }, line));
  const stepList = h('ol.ws-steps', (o.steps ?? []).map((s, i) => h('li', h('button.linklike', { type: 'button', onclick: () => tutorial.goTo(i + 1) }, s.title))));
  const counter = h('span.ws-counter', `0 / ${o.steps?.length ?? 0}`);
  const playBtn = h('button.small', { type: 'button', onclick: () => togglePlay() }, '▶ Reproducir');
  const tutorial = createTutorial(chartApi, o.steps ?? [], o.items ?? [], {
    narration,
    voice,
    onStep: (n, info) => {
      counter.textContent = `${n} / ${o.steps.length}`;
      [...stepList.children].forEach((li, i) => li.classList.toggle('current', i === n - 1));
      setChildren(caption,
        n ? [h('h3', `Paso ${n}. ${info.step.title}`), h('div.profe', h('span.profe-badge', '👨‍🏫 El profe'), profeText(info.narration?.display ?? info.step.text)),
          info.drawing ? h('p.ws-instrument', '✍️ ', info.drawing) : null]
          : h('div.profe', h('span.profe-badge', '👨‍🏫 El profe'), profeText(narration.intro.display)),
      );
      chartApi.setReadout(n ? `Paso ${n}: ${info.step.title}` : 'Tutorial al principio.');
    },
  });
  async function togglePlay() {
    if (tutorial.playing) { tutorial.stop(); playBtn.textContent = '▶ Reproducir'; return; }
    playBtn.textContent = '⏸ Pausa';
    if (tutorial.step >= tutorial.total) await tutorial.goTo(0, { animate: false });
    await tutorial.play();
    playBtn.textContent = '▶ Reproducir';
  }
  const tabTutorial = h('section.ws-tab',
    h('div.ws-controls',
      h('button.small.secondary', { type: 'button', title: 'Al principio', onclick: () => tutorial.first() }, '⏮'),
      h('button.small.secondary', { type: 'button', title: 'Paso anterior', onclick: () => tutorial.prev() }, '◀'),
      playBtn,
      h('button.small.secondary', { type: 'button', title: 'Paso siguiente', onclick: () => tutorial.next() }, '▶'),
      h('button.small.secondary', { type: 'button', title: 'Solución completa', onclick: () => tutorial.last() }, '⏭'),
      counter,
    ),
    h('div.ws-controls', voiceBtn, rateSel,
      h('button.small.secondary', { type: 'button', title: 'Repetir la explicación de este paso', onclick: () => voice.speak(tutorial.step ? narration.steps[tutorial.step - 1].speech : narration.intro.speech) }, '🔁 Repetir'),
      h('button.small.secondary', { type: 'button', title: 'Callar', onclick: () => voice.stop() }, '⏹')),
    caption,
    h('h3', 'Pasos'), stepList,
    h('p.muted.small', 'Tus trazos y notas no se borran: el tutorial se dibuja aparte. Pulsa ⏮ para quitarlo.'),
  );

  const tabs = { ejercicio: tabEjercicio, tutorial: tabTutorial };
  const tabButtons = Object.entries({ ejercicio: '📋 Ejercicio', tutorial: '🎓 Tutorial' }).map(([id, label]) =>
    h('button.ws-tabbtn', { type: 'button', 'data-tab': id, onclick: () => showTab(id) }, label));
  const panelBody = h('div.ws-panel-body');
  function showTab(id) {
    setChildren(panelBody, tabs[id]);
    tabButtons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tab === id)));
    if (id !== 'tutorial') { tutorial.stop(); playBtn.textContent = '▶ Reproducir'; }
  }

  const ws = h('div.workspace', { role: 'dialog', 'aria-modal': 'true', 'aria-label': `Carta: ${o.title}` },
    h('header.ws-head',
      h('strong.ws-title', `🗺️ ${o.title}`),
      h('span.spacer'),
      h('button.small.secondary', { type: 'button', title: 'Cerrar la carta (Esc)', onclick: () => close() }, '✕ Cerrar'),
    ),
    h('div.ws-main',
      h('div.ws-chart', chartApi.el),
      h('aside.ws-panel', h('div.ws-tabs', tabButtons), panelBody),
    ),
    h('details.ai-context#ai-context-ws', { hidden: true }),
  );

  const onKey = (ev) => { if (ev.key === 'Escape' && !ev.target.closest?.('input')) close(); };
  /** Oculta la mesa (se conserva lo dibujado) y devuelve el formulario de respuesta a su sitio. */
  function close() {
    if (!ws.isConnected) return;
    tutorial.stop();
    for (const [n, ph] of placeholders) ph.replaceWith(n);
    placeholders = [];
    ws.remove();
    document.body.classList.remove('ws-open');
    document.removeEventListener('keydown', onKey);
    if (openWs === api) openWs = null;
    o.onClose?.();
  }

  let firstShow = true;
  function show(tab = 'ejercicio') {
    if (openWs && openWs !== api) openWs.close();
    placeholders = (o.answerNodes ?? []).map((n) => { const ph = document.createComment('respuesta'); n.replaceWith(ph); return [n, ph]; });
    answersBox.replaceChildren(...placeholders.map(([n]) => n));
    document.body.append(ws);
    document.body.classList.add('ws-open');
    document.addEventListener('keydown', onKey);
    showTab(tab);
    openWs = api;
    requestAnimationFrame(() => {
      if (firstShow) { chartApi.focusPoints(o.focus ?? []); firstShow = false; }
      if (tab === 'tutorial' && tutorial.step === 0) tutorial.goTo(0, { animate: false });
    });
  }

  const api = {
    show,
    close,
    chart: chartApi,
    tutorial,
    summary: () => `${o.summary?.() ?? ''}\nMESA DE CARTAS ABIERTA · pestaña ${tabButtons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.tab}` +
      ` · tutorial paso ${tutorial.step}/${tutorial.total}\nDIBUJO ALUMNO (mesa): ${chartApi.summary() || '(nada)'}`,
  };
  show(o.tab ?? 'ejercicio');
  return api;
}

export const currentWorkspace = () => openWs;
