import { h, copyText, setChildren } from '../dom.js';
import { loadExamIndex, loadExamBank } from '../../store/datasets.js';
import { examQuestionSummary } from '../../ai/summary.js';
import { link } from '../router.js';
import { tlink, volver, currentTit } from '../titulacion.js';
import { createKit } from '../../exams/kit.js';
import { chooseOption } from '../../exams/options.js';
import { quantity } from '../../analysis/quantities.js';
import { SOLUCIONES as solutions } from '../../exams/solutions/index.js';
import { chartWidget, avisoCartaMovil } from '../chart-widget.js';
import { openWorkspace, currentWorkspace } from '../chart/workspace.js';
import { narrateSteps, narrateIntro, narrateOutro } from '../../teacher/narrate.js';
import { profeStepItems, listenAllButton } from '../profe-steps.js';
import { avisoError } from '../aviso-error.js';

/** Quita la referencia a la «UT» (unidad del temario) de las descripciones de los bancos. */
const sinJerga = (t) => t.replace(/\(UT ?\d+,\s*/g, '(').replace(/\bUT ?\d+\b,?\s*/g, '');

/** Ejecuta la solución programada de una pregunta (si existe). */
function runSolution(q, chart) {
  const sol = solutions[q.id];
  if (!sol) return null;
  const k = createKit(chart);
  try {
    const values = sol.solve(k, q);
    const pick = chooseOption(q.opciones, values);
    return { sol, k, values, pick };
  } catch (e) {
    console.error(e);
    return null;
  }
}

/** #/examenes  y  #/examenes/<banco>  y  #/examenes/<banco>/<idPregunta> */
export function examsView({ ctx, progress, params: route }) {
  const el = h('div.exams', h('p.muted', 'Cargando preguntas…'));
  let summaryText = 'VISTA exámenes (cargando)';
  const [, bankFile, qid] = route.parts;

  (async () => {
    try {
      const index = await loadExamIndex();
      if (!bankFile) return renderIndex(index);
      const bank = await loadExamBank(bankFile);
      if (qid) return renderQuestion(bank, bank.preguntas.find((q) => q.id === qid));
      return renderBank(bank);
    } catch (e) {
      setChildren(el, h('p.warn', `No se pudieron cargar los exámenes: ${e.message}`));
    }
  })();

  function renderIndex(index) {
    summaryText = `VISTA exámenes · bancos: ${index.map((b) => `${b.file} (${b.count} preguntas)`).join(', ')}`;
    setChildren(el, 
      volver('Ejercicios de carta', tlink(currentTit(progress), ['carta'])),
      h('h1', 'Preguntas reales de examen'),
      h('p', 'Preguntas de carta de convocatorias oficiales con la respuesta de la plantilla oficial. Fuente: publicaciones de la administración convocante (enlace en cada pregunta).'),
      h('div.cards',
        h('a.card', { href: tlink(currentTit(progress), ['examenes']) }, h('h3', '📄 Exámenes completos y simulacros'), h('p', 'Las 45 preguntas (teoría + carta) de cada convocatoria, cronometradas y corregidas con las reglas oficiales; y simulacros por temas.')),
        index.map((b) => h('a.card', { href: link(['examenes', b.file]) },
        h('h3', b.title), h('p', sinJerga(b.description ?? '')), h('div.meta', h('span.stat', `${b.count} preguntas`))))),
    );
  }

  function renderBank(bank) {
    const groups = new Map();
    for (const q of bank.preguntas) {
      if (!groups.has(q.convocatoria)) groups.set(q.convocatoria, []);
      groups.get(q.convocatoria).push(q);
    }
    const answered = (q) => progress.get().exams[q.id];
    summaryText = `VISTA banco ${bank.meta.title} · ${bank.preguntas.length} preguntas\n` +
      bank.preguntas.map((q) => `${q.id}: ${(answered(q)?.ok ? '✓' : answered(q) ? '✗' : '·')} ${q.enunciado.slice(0, 80)}`).join('\n');
    setChildren(el, 
      volver('Ejercicios de carta', tlink(currentTit(progress), ['carta'])),
      h('h1', bank.meta.title),
      bank.meta.description ? h('p', sinJerga(bank.meta.description)) : null,
      [...groups].map(([conv, qs]) => h('section',
        h('h2', conv),
        h('ol.qlist', qs.map((q) => {
          const a = answered(q);
          return h('li', h('a', { href: link(['examenes', bankFile, q.id]) },
            h('span', { class: a ? (a.ok ? 'ok' : 'warn') : 'muted' }, a ? (a.ok ? '✓ ' : '✗ ') : '· '),
            q.numero ? `P${q.numero}: ` : '', q.enunciado.slice(0, 110), q.enunciado.length > 110 ? '…' : ''));
        })),
      )),
    );
  }

  function renderQuestion(bank, q) {
    if (!q) { setChildren(el, h('p', 'Pregunta no encontrada.')); return; }
    const idx = bank.preguntas.indexOf(q);
    const prev = bank.preguntas[idx - 1];
    const next = bank.preguntas[idx + 1];
    let choice = progress.get().exams[q.id]?.choice ?? null;
    const run = runSolution(q, ctx.chart);
    const result = h('div.diagnosis', { 'aria-live': 'polite' });
    const solution = h('div.solution', { hidden: true });
    const aiPre = h('pre.ai-text');
    const refresh = () => {
      summaryText = examQuestionSummary(q, choice, run && {
        steps: run.k.steps, values: run.values.map((v) => quantity(v.kind).format(v.value)), choice: run.pick.choice,
      });
      aiPre.textContent = summaryText;
    };

    const options = h('div.options', Object.entries(q.opciones ?? {}).map(([k, v]) => h('label.option',
      h('input', { type: 'radio', name: 'opt', value: k, checked: choice === k, onchange: () => { choice = k; refresh(); } }),
      h('span', h('strong', `${k}) `), v))));

    function verify() {
      if (!choice) { setChildren(result, h('p.muted', 'Elige una opción.')); return; }
      const ok = choice === q.correcta;
      progress.recordExam(q.id, { choice, ok });
      setChildren(result, ok ? h('p.ok', '✅ Correcta') : h('p.warn', `❌ Incorrecta. La correcta es la ${q.correcta}).`));
      showSolution();
      refresh();
    }
    function showSolution() {
      solution.hidden = false;
      const computed = run
        ? h('p', h('strong', 'Resultado calculado: '), run.values.map((v) => quantity(v.kind).format(v.value)).join(' · '),
          ` → opción más próxima: ${run.pick.choice})`, run.pick.choice === q.correcta ? ' ✔ coincide con la plantilla' : '')
        : null;
      setChildren(solution,
        q.correcta ? h('p', h('strong', 'Respuesta oficial: '), `${q.correcta}) ${q.opciones?.[q.correcta] ?? ''}`) : h('p.warn', 'Pregunta anulada por el tribunal.'),
        computed,
        run ? [h('ol.steps', profeStepItems(run.k.steps, narrateSteps(run.k.steps, { seed: q.id }))),
          listenAllButton(() => [narrateIntro(q.enunciado).speech, ...narrateSteps(run.k.steps, { seed: q.id }).map((n) => n.speech), examOutro().speech])]
          : h('p.muted', 'Esta pregunta no tiene resolución programada (requiere leer símbolos de la carta).'),
        run?.k.items.length ? chartWidget(ctx.chart, { items: run.k.items, focus: run.k.focus }).el : null,
        run?.sol.ejercicio ? h('p', h('a.btn.secondary', { href: link(['ej', run.sol.ejercicio]) }, '🧭 Practicar este tipo de ejercicio')) : null,
      );
    }

    // Los bancos de teoría del PY no llevan titulación en cada pregunta: se toma del título del banco («PY Andalucía · …»).
    const titulacion = q.titulacion ?? bank.meta.title.split(' · ')[0];

    // Bloque de respuesta: se traslada a la mesa de cartas cuando se abre.
    let ws = null;
    const answerBlock = h('div.answer-block', options,
      h('div.actions',
        h('button', { type: 'button', onclick: verify }, 'Comprobar'),
        h('button.secondary', { type: 'button', onclick: () => { showSolution(); if (ws && currentWorkspace() === ws) ws.show('tutorial'); } }, 'Ver solución'),
      ),
      result);
    const examOutroText = () => `${run.values.map((v) => quantity(v.kind).format(v.value)).join(', ')}, que corresponde a la opción ${run.pick.choice}`;
    const examOutro = () => narrateOutro(`${run.values.map((v) => quantity(v.kind).format(v.value)).join(', ')}, que corresponde a la opción ${run.pick.choice}`);
    const openTable = (tab) => {
      if (ws) { ws.show(tab); return; }
      ws = openWorkspace({
        chart: ctx.chart, title: `${titulacion} · ${q.convocatoria}${q.numero ? ` · P${q.numero}` : ''}`, statement: q.enunciado,
        steps: run.k.steps, items: run.k.items, focus: run.k.focus, answerNodes: [answerBlock], tab, progress,
        result: examOutroText(),
        summary: () => summaryText,
      });
    };
    const tableButtons = run?.k.items.length
      ? h('div.actions.table-actions',
        h('button', { type: 'button', onclick: () => openTable('ejercicio') }, '🗺️ Resolver en la carta'),
        h('button.secondary', { type: 'button', onclick: () => openTable('tutorial') }, '🎓 Ver la resolución en la carta'))
      : null;

    setChildren(el, 
      volver(bank.meta.title, link(['examenes', bankFile])),
      h('header', h('h1', `${titulacion} · ${q.convocatoria}${q.numero ? ` · pregunta ${q.numero}` : ''}`), q.comunidad ? h('div.badges', h('span.badge', q.comunidad)) : null),
      q.enunciado_comun ? h('section.statement.common', h('h2', 'Enunciado común'), h('p', q.enunciado_comun)) : null,
      h('section.statement', h('p', q.enunciado), tableButtons ? avisoCartaMovil(progress) : null, tableButtons),
      answerBlock,
      h('div.actions',
        prev ? h('a.btn.secondary', { href: link(['examenes', bankFile, prev.id]) }, '← Anterior') : null,
        next ? h('a.btn.secondary', { href: link(['examenes', bankFile, next.id]) }, 'Siguiente →') : null,
      ),
      solution,
      h('p.muted.small', 'Fuente: ', q.fuente_examen ? h('a', { href: q.fuente_examen, target: '_blank', rel: 'noopener' }, 'examen') : '—',
        q.fuente_plantilla ? [' · ', h('a', { href: q.fuente_plantilla, target: '_blank', rel: 'noopener' }, 'plantilla')] : null,
        ''),
      q.notas ? h('details', h('summary', 'Notas sobre la fuente'), h('p.small', q.notas)) : null,
      h('p.pie-aviso', avisoError(`Pregunta ${q.id} (${q.convocatoria ?? bank.meta.title})`, q.enunciado.slice(0, 120))),
      h('details.ai-context#ai-context', h('summary', 'Para asistentes de IA'),
        h('p.muted.small', h('button.small', { type: 'button', onclick: () => copyText(summaryText) }, 'Copiar')), aiPre),
    );
    refresh();
  }

  return { el, summary: () => (currentWorkspace() ? currentWorkspace().summary() : summaryText) };
}
