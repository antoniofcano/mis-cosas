import { h, copyText } from '../dom.js';
import { getExercise } from '../../exercises/registry.js';
import { answersFor } from '../../exercises/define.js';
import { createRng, randomSeed } from '../../math/rng.js';
import { check, STATUS } from '../../analysis/checker.js';
import { quantity } from '../../analysis/quantities.js';
import { GLOSSARY } from '../../nautical/glossary.js';
import { exerciseSummary } from '../../ai/summary.js';
import { chartWidget } from '../chart-widget.js';
import { openWorkspace, currentWorkspace } from '../chart/workspace.js';
import { narrateSteps, narrateIntro, narrateOutro } from '../../teacher/narrate.js';
import { profeStepItems, listenAllButton } from '../profe-steps.js';
import { link, navigate } from '../router.js';

const STATUS_TEXT = {
  [STATUS.OK]: '✅ Correcto',
  [STATUS.CLOSE]: '🟡 Casi (fuera de tolerancia)',
  [STATUS.WRONG]: '❌ Incorrecto',
  [STATUS.INVALID]: '⚠️ No se entiende el formato',
  [STATUS.EMPTY]: '— Sin responder',
};

export function exerciseView({ ctx, progress, params: route }) {
  const exercise = getExercise(route.parts[1]);
  if (!exercise) return { el: h('p', 'Tipo de ejercicio no encontrado. ', h('a', { href: '#/' }, 'Volver')), summary: () => 'ERROR tipo no encontrado' };

  const seed = Number(route.query.s) || randomSeed();
  if (!route.query.s) navigate(['ej', exercise.id], { s: seed }, { replace: true });

  const params = exercise.generate(createRng(seed), ctx);
  const statement = exercise.statement(params, ctx);
  const solution = exercise.solve(params, ctx);
  const answers = answersFor(exercise, params);
  const state = { inputs: {}, revealed: 0, result: null, recorded: false };

  // --- Respuestas
  const inputs = answers.map((a) => {
    const q = quantity(a.kind);
    const input = h('input', { id: `in-${a.key}`, name: a.key, placeholder: q.placeholder, autocomplete: 'off', inputmode: 'text', 'aria-describedby': `fb-${a.key}` });
    input.addEventListener('input', () => { state.inputs[a.key] = input.value; });
    return { a, input, fb: h('div.feedback', { id: `fb-${a.key}` }) };
  });
  const form = h('form.answers', { onsubmit: (ev) => { ev.preventDefault(); doCheck(); } },
    inputs.map(({ a, input, fb }) => h('label.field', h('span.lbl', a.label), input, fb)),
    h('div.actions',
      h('button', { type: 'submit' }, 'Comprobar'),
      h('button.secondary', { type: 'button', onclick: () => reveal(state.revealed + 1) }, '💡 Pista'),
      h('button.secondary', { type: 'button', onclick: () => { reveal(solution.steps.length); showSolution(); } }, 'Ver solución'),
      h('a.btn.secondary', { href: link(['ej', exercise.id], { s: randomSeed() }) }, '🔄 Otro'),
    ),
  );
  const diag = h('div.diagnosis', { 'aria-live': 'polite' });

  // --- Explicación del profe
  const resultText = answers.map((a) => `${a.label} ${quantity(a.kind).format(solution.results[a.key])}`).join(', ');
  const narration = narrateSteps(solution.steps, { seed });
  const intro = narrateIntro(statement, { title: exercise.title });
  const outro = narrateOutro(resultText);

  // --- Pasos (pistas progresivas)
  const stepsList = h('ol.steps');
  const solutionBox = h('div.solution', { hidden: true });

  // --- Carta
  const widget = solution.drawing
    ? chartWidget(ctx.chart, { items: solution.drawing.items, focus: solution.drawing.focus, step: 0 })
    : null;

  // --- Mesa de cartas (pantalla completa): resolver sobre la carta o ver el tutorial
  let ws = null;
  const openTable = (tab) => {
    if (ws) { ws.show(tab); return; }
    ws = openWorkspace({
      chart: ctx.chart, title: exercise.title, statement, steps: solution.steps,
      items: solution.drawing.items, focus: solution.drawing.focus, kind: exercise.title, result: resultText,
      answerNodes: [form, diag, solutionBox], tab, progress, summary: () => summary(),
    });
  };
  const tableButtons = solution.drawing
    ? h('div.actions.table-actions',
      h('button', { type: 'button', onclick: () => openTable('ejercicio') }, '🗺️ Resolver en la carta'),
      h('button.secondary', { type: 'button', onclick: () => openTable('tutorial') }, '🎓 Ver la resolución en la carta'))
    : null;

  function reveal(n) {
    state.revealed = Math.min(Math.max(n, state.revealed), solution.steps.length);
    stepsList.replaceChildren(...profeStepItems(solution.steps.slice(0, state.revealed), narration));
    widget?.setStep(state.revealed);
    if (state.revealed >= solution.steps.length) showSolution();
    refreshAi();
  }

  function showSolution() {
    solutionBox.hidden = false;
    solutionBox.replaceChildren(h('strong', 'Solución: '), ...answers.map((a) => h('span.sol', `${a.label} = ${quantity(a.kind).format(solution.results[a.key])}`)));
  }

  function doCheck() {
    const r = check(exercise, params, solution, state.inputs, ctx, { toleranceFactor: progress.settings().toleranceFactor });
    state.result = r;
    for (const { a, input, fb } of inputs) {
      const f = r.fields.find((x) => x.key === a.key);
      input.dataset.status = f.status;
      fb.textContent = STATUS_TEXT[f.status] + (f.status === STATUS.CLOSE || f.status === STATUS.WRONG ? ` (error ${f.errorText}, tolerancia ${f.tol.toString().replace('.', ',')})` : '')
        + (f.status === STATUS.INVALID ? ` Ejemplo: ${quantity(a.kind).placeholder}` : '');
    }
    diag.replaceChildren(...[
      r.allOk ? h('p.ok', '🎉 ¡Todo correcto!') : null,
      ...r.diagnoses.map((d) => h('p.warn', '🔎 ', d.explain)),
      !r.allOk && !r.diagnoses.length && r.answeredCount ? h('p.muted', 'Pide una pista para revisar el procedimiento paso a paso.') : null,
    ].filter(Boolean));
    if (!state.recorded && r.answeredCount === answers.length) {
      progress.recordAttempt(exercise.id, { ok: r.allOk, seed, mistakes: r.diagnoses.map((d) => d.id) });
      state.recorded = true;
    }
    refreshAi();
  }

  // --- Resumen para IA
  const aiPre = h('pre.ai-text');
  const refreshAi = () => { aiPre.textContent = summary(); };
  const summary = () => exerciseSummary({ exercise, seed, params, solution, inputs: state.inputs, result: state.result, revealed: state.revealed, statement })
    + (widget?.summary() ? `\nDIBUJO ALUMNO: ${widget.summary()}` : '');
  const fullSummary = () => (ws && currentWorkspace() === ws ? ws.summary() : summary());

  const el = h('div.exercise',
    h('nav.crumbs', h('a', { href: '#/' }, 'Inicio'), ' › ', exercise.title),
    h('header',
      h('h1', exercise.title),
      h('div.badges', exercise.levels.map((l) => h('span.badge', l)), h('span.badge.muted', `semilla ${seed}`)),
    ),
    h('div.layout',
      h('div.col',
        h('section.statement', h('h2', 'Enunciado'), h('p', statement), tableButtons),
        h('section', h('h2', 'Tu respuesta'), form, diag, solutionBox),
        h('section', h('h2', 'Resolución paso a paso'), stepsList,
          listenAllButton(() => [intro.speech, ...narration.slice(0, state.revealed).map((n) => n.speech), state.revealed >= solution.steps.length ? outro.speech : ''].filter(Boolean)), h('p.muted.small', `Pulsa «Pista» para ver el siguiente paso (${solution.steps.length} en total).`)),
        h('details.method', h('summary', 'Método y conceptos'),
          h('ol', exercise.method.map((m) => h('li', m))),
          h('dl', exercise.concepts.filter((c) => GLOSSARY[c]).map((c) => [h('dt', GLOSSARY[c].term), h('dd', GLOSSARY[c].text)])),
        ),
      ),
      widget ? h('div.col.chart-col', h('section', h('h2', 'Carta'), widget.el)) : null,
    ),
    h('details.ai-context#ai-context',
      h('summary', '🤖 Resumen para asistentes IA (contiene la solución)'),
      h('p.muted.small', 'Texto compacto pensado para Claude u otros asistentes. ', h('button.small', { type: 'button', onclick: () => copyText(summary()) }, 'Copiar')),
      aiPre,
    ),
  );
  refreshAi();
  return { el, summary: fullSummary };
}
