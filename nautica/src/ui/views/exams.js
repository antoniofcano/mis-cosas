import { h, copyText, setChildren } from '../dom.js';
import { pregunta, cargarBanco, resolverLegado, SOLUCIONES as solutions } from '../../bancos/index.js';
import { avisoDePregunta } from '../motivo-carta.js';
import { examQuestionSummary } from '../../ai/summary.js';
import { link, navigate } from '../router.js';
import { TITULACIONES, tlink, volver, currentTit, currentEje } from '../titulacion.js';
import { createKit } from '../../exams/kit.js';
import { chooseOption } from '../../exams/options.js';
import { quantity } from '../../analysis/quantities.js';
import { chartWidget, avisoCartaMovil } from '../chart-widget.js';
import { openWorkspace, currentWorkspace } from '../chart/workspace.js';
import { narrateSteps, narrateIntro, narrateOutro } from '../../teacher/narrate.js';
import { profeStepItems, listenAllButton } from '../profe-steps.js';
import { avisoError } from '../aviso-error.js';
import { accionTema } from '../tema-pregunta.js';
import { cuenta } from '../../texto.js';
import { crearAyudas } from '../ayudas.js';
import { glosar } from '../glosas.js';
import { conIcono } from '../iconos.js';
import { botonBloc } from '../bloc.js';
import { ID_BLOC } from '../../bloc/notas.js';
import { guiadoPanel, guiadoDisponible } from '../guiado.js';
import { diagnosticoEl, diagnosticoTexto } from '../diagnostico.js';

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

/** Lleva (sin dejar rastro en el historial) a otra dirección y la pinta. */
function redirige(parts, query) {
  navigate(parts, query, { replace: true });
  dispatchEvent(new HashChangeEvent('hashchange'));
}

/**
 * Direcciones antiguas, con el fichero del banco: #/examenes/<fichero>[/<id>] y #/<tit>/examenes/<fichero>[/<id>].
 * La pregunta va a #/q/<id>; el banco, a su lista (#/<tit>/examenes/<lista>). Las resuelve el eje (su `legado`).
 */
export function legadoExamenesView({ progress, params: route, tit }) {
  const el = h('div.exams', h('p.muted', 'Cargando preguntas…'));
  const [, fichero, qid] = route.parts;
  resolverLegado(fichero).then(async (l) => {
    if (qid) {
      // La lista del banco antiguo solo se indica si no es ya la de la pregunta.
      const r = await pregunta(qid);
      redirige(['q', qid], l?.lista && r && r.banco.listaDe(r.q).id !== l.lista ? { l: l.lista } : undefined);
    } else if (l) redirige([l.tit, 'examenes', l.lista]);
    else redirige([tit ?? currentTit(progress), 'examenes']);
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar los exámenes: ${e.message}`)));
  return { el, summary: () => 'VISTA exámenes (dirección antigua, redirigiendo)' };
}

/** #/<tit>/examenes/<lista> — una lista de preguntas reales del eje (p. ej. las de carta), por convocatorias. */
export function listaView({ progress, params: route, tit }) {
  const el = h('div.exams', h('p.muted', 'Cargando preguntas…'));
  let summaryText = 'VISTA lista de preguntas reales (cargando)';
  const id = route.parts[1];
  cargarBanco(currentEje(progress), tit).then((banco) => {
    const lista = banco.lista(id);
    if (!lista) { setChildren(el, volver('Exámenes', tlink(tit, ['examenes'])), h('p', 'Esta lista de preguntas no existe.')); return; }
    const groups = new Map();
    for (const q of lista.preguntas) {
      if (!groups.has(q.convocatoria)) groups.set(q.convocatoria, []);
      groups.get(q.convocatoria).push(q);
    }
    const answered = (q) => progress.get().exams[q.id];
    const enlace = (q) => link(['q', q.id], banco.listaDe(q).id === lista.id ? undefined : { l: lista.id });
    summaryText = `VISTA banco ${lista.titulo} · ${cuenta(lista.preguntas.length, 'pregunta')}\n` +
      lista.preguntas.map((q) => `${q.id}: ${(answered(q)?.ok ? '✓' : answered(q) ? '✗' : '·')} ${q.enunciado.slice(0, 80)}`).join('\n');
    setChildren(el,
      volver('Ejercicios de carta', tlink(tit, ['carta'])),
      h('h1', lista.titulo),
      lista.descripcion ? h('p', sinJerga(lista.descripcion)) : null,
      [...groups].map(([conv, qs]) => h('section',
        h('h2', conv),
        h('ol.qlist', qs.map((q) => {
          const a = answered(q);
          return h('li', h('a', { href: enlace(q) },
            h('span', { class: a ? (a.ok ? 'ok' : 'warn') : 'muted' }, a ? (a.ok ? '✓ ' : '✗ ') : '· '),
            q.numero ? `P${q.numero}: ` : '', q.enunciado.slice(0, 110), q.enunciado.length > 110 ? '…' : ''));
        })),
      )),
    );
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar los exámenes: ${e.message}`)));
  return { el, summary: () => summaryText };
}

/** #/q/<id>[?l=<lista>] — una pregunta real de examen, de cualquier eje: resolverla y verla resuelta en la carta. */
export function preguntaView({ ctx, progress, params: route }) {
  const el = h('div.exams', h('p.muted', 'Cargando preguntas…'));
  let summaryText = 'VISTA exámenes (cargando)';
  const qid = route.parts[1];

  pregunta(qid).then((r) => {
    if (!r) { setChildren(el, h('p', 'Pregunta no encontrada.')); return; }
    // Las reservadas para el examen final no se enseñan sueltas (ni con un enlace guardado de antes de la reserva).
    if (r.banco.reservadas.has(r.q.id)) {
      summaryText = `VISTA pregunta ${qid}: RESERVADA para el examen final (no se enseña)`;
      setChildren(el, h('h1', conIcono('candado', 'Pregunta reservada')), h('p', 'Esta pregunta es de las que la app guarda para tu examen final: no se enseña suelta para que el examen sea de verdad nuevo para ti.'),
        h('a.btn.grande', { href: tlink(r.q.tit, ['examenes']) }, 'Ir a Examen'));
      return;
    }
    const lista = (route.query.l && r.banco.lista(route.query.l)?.preguntas.includes(r.q) ? r.banco.lista(route.query.l) : null) ?? r.banco.listaDe(r.q);
    renderQuestion(r.banco, lista, r.q);
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar los exámenes: ${e.message}`)));

  function renderQuestion(banco, lista, q) {
    // Una de carta sin resolución no está en la lista de carta (no se practica): se abre sola, sin anterior ni siguiente.
    const idx = lista.preguntas.indexOf(q);
    const prev = idx < 0 ? null : lista.preguntas[idx - 1];
    const next = idx < 0 ? null : lista.preguntas[idx + 1];
    const enLista = (x) => link(['q', x.id], banco.listaDe(x).id === lista.id ? undefined : { l: lista.id });
    const eje = banco.eje;
    let choice = progress.get().exams[q.id]?.choice ?? null;
    const run = runSolution(q, ctx.chart);
    // Practicar una pregunta real suelta (no es un examen): chuleta de lo que pide y siglas explicadas al tocarlas.
    const enTema = { modo: 'pregunta', tit: q.tit, ut: q.ut, ejercicios: run?.sol.ejercicio ? [run.sol.ejercicio] : [] };
    const glosas = { tit: q.tit, ut: q.ut };
    const ayudas = crearAyudas(enTema);
    // Bloc (hoja de borrador): el enunciado, las opciones y las notas de esta pregunta.
    const bloc = { id: ID_BLOC.pregunta(q.id), titulo: `${q.convocatoria ?? ''}${q.numero ? ` · pregunta ${q.numero}` : ''}`, enunciado: q.enunciado, comun: q.enunciado_comun, contexto: q.contexto, opciones: q.opciones };
    const result = h('div.diagnosis', { 'aria-live': 'polite' });
    const solution = h('div.solution', { hidden: true });
    const aiPre = h('pre.ai-text');
    // Modo guiado «Paso a paso» (src/ui/guiado.js): se abre con el botón o con ?guiado=1.
    const conGuiado = !!run && guiadoDisponible(q, run.sol, ctx.chart);
    const guiadoBox = h('div.guiado-box', { hidden: true });
    let guiado = null;
    const refresh = () => {
      summaryText = examQuestionSummary(q, choice, run && {
        steps: run.k.steps, values: run.values.map((v) => quantity(v.kind).format(v.value)), choice: run.pick.choice,
      }, { eje: eje.nombre, titulacion: TITULACIONES[q.tit]?.sigla });
      if (choice && result.childElementCount) { const d = diagnosticoTexto(q, choice, ctx.chart); if (d) summaryText += `\n${d}`; }
      if (guiado) summaryText += `\n${guiado.summary()}`;
      aiPre.textContent = summaryText;
    };

    const options = h('div.options', Object.entries(q.opciones ?? {}).map(([k, v]) => h('label.option',
      h('input', { type: 'radio', name: 'opt', value: k, checked: choice === k, onchange: () => { choice = k; refresh(); } }),
      h('span', h('strong', `${k}) `), v))));

    function verify() {
      if (!choice) { setChildren(result, h('p.muted', 'Elige una opción.')); return; }
      // Anulada por el tribunal: cualquier respuesta vale (como en los exámenes de la app).
      const ok = q.anulada || choice === q.correcta;
      progress.recordExam(q.id, { choice, ok });
      setChildren(result, q.anulada ? h('p.ok', conIcono('ok', 'Pregunta anulada: en el examen valía cualquier respuesta.'))
        : ok ? h('p.ok', conIcono('ok', 'Correcta')) : h('p.warn', conIcono('no', `Incorrecta. La correcta es la ${q.correcta}).`)),
        // Por qué (si se sabe): el error típico que lleva a la opción marcada (src/exams/diagnostico.js).
        ok ? null : diagnosticoEl(q, choice, { chart: ctx.chart }));
      showSolution();
      refresh();
    }
    function showSolution() {
      solution.hidden = false;
      // En una anulada la cuenta puede no acercarse a ninguna opción (a veces por eso se anuló): se dice.
      const lejos = run?.pick.choice && run.pick.scores[run.pick.choice] / run.values.length > 2;
      const computed = run
        ? h('p', h('strong', 'Resultado calculado: '), run.values.map((v) => quantity(v.kind).format(v.value)).join(' · '),
          run.pick.choice ? (q.anulada && lejos ? ` → ninguna opción se acerca de verdad (la más próxima es la ${run.pick.choice})` : ` → opción más próxima: ${run.pick.choice})`) : '',
          run.pick.choice === q.correcta ? ' ✓ coincide con la plantilla' : '')
        : null;
      setChildren(solution,
        q.correcta ? h('p', h('strong', 'Respuesta oficial: '), `${q.correcta}) ${q.opciones?.[q.correcta] ?? ''}`) : null,
        avisoDePregunta(q, { programada: !!run, sinMargen: run?.sol.sinMargen }),
        computed,
        run ? [h('ol.steps', profeStepItems(run.k.steps, narrateSteps(run.k.steps, { seed: q.id }), glosas)),
          listenAllButton(() => [narrateIntro(q.enunciado).speech, ...narrateSteps(run.k.steps, { seed: q.id }).map((n) => n.speech), examOutro().speech])]
          : null,
        run?.k.items.length ? chartWidget(ctx.chart, { items: run.k.items, focus: run.k.focus }).el : null,
        run?.sol.ejercicio ? h('p', h('a.btn.secondary', { href: link(['ej', run.sol.ejercicio]) }, conIcono('brujula', 'Practicar este tipo de ejercicio'))) : null,
      );
    }

    // Titulación y eje de la pregunta (el eje, como distintivo bajo el título).
    const titulacion = TITULACIONES[q.tit]?.sigla ?? '';

    // Bloque de respuesta: se traslada a la mesa de cartas cuando se abre.
    let ws = null;
    const answerBlock = h('div.answer-block', options,
      h('div.actions',
        h('button', { type: 'button', onclick: verify }, 'Comprobar'),
        h('button.secondary', { type: 'button', onclick: () => { showSolution(); if (ws && currentWorkspace() === ws) ws.show('tutorial'); } }, 'Ver solución'),
        conGuiado ? h('button.secondary.boton-guiado', { type: 'button', onclick: () => abrirGuiado(true) }, conIcono('diana', 'Resolver paso a paso')) : null,
      ),
      result);
    const factor = () => progress.settings().toleranceFactor ?? 1;
    const alElegir = (letra, ok) => { choice = letra; progress.recordExam(q.id, { choice: letra, ok }); refresh(); };
    /** Abre el paso a paso en la página (con su carta, si la pregunta se dibuja) en lugar del bloque de respuesta. */
    function abrirGuiado(enfocar) {
      if (!conGuiado) return;
      if (ws && currentWorkspace() === ws) ws.close();
      const w = run.k.items.length ? chartWidget(ctx.chart, { items: run.k.items, focus: run.k.focus, step: 0 }) : null;
      guiado = guiadoPanel({ q, sol: run.sol, chart: ctx.chart, dibujar: (n) => w?.setStep(n), carta: () => w, factor: factor(), glosas,
        onOpcion: alElegir, onCerrar: cerrarGuiado });
      setChildren(guiadoBox, guiado.el, w ? h('div.guiado-carta', w.el) : null);
      guiadoBox.hidden = false;
      answerBlock.hidden = true;
      navigate(['q', q.id], { ...route.query, guiado: '1' }, { replace: true });
      refresh();
      if (enfocar) requestAnimationFrame(() => { guiadoBox.scrollIntoView({ block: 'start' }); guiadoBox.querySelector('input, h2')?.focus({ preventScroll: true }); });
    }
    function cerrarGuiado() {
      guiado = null;
      guiadoBox.replaceChildren();
      guiadoBox.hidden = true;
      answerBlock.hidden = false;
      const { guiado: _g, ...resto } = route.query;
      navigate(['q', q.id], Object.keys(resto).length ? resto : undefined, { replace: true });
      refresh();
    }
    const examOutroText = () => `${run.values.map((v) => quantity(v.kind).format(v.value)).join(', ')}${run.pick.choice ? `, que corresponde a la opción ${run.pick.choice}` : ''}`;
    const examOutro = () => narrateOutro(examOutroText());
    const openTable = (tab) => {
      if (guiado) cerrarGuiado(); // en la mesa, el paso a paso va en su pestaña
      if (ws) { ws.show(tab); return; }
      ws = openWorkspace({
        chart: ctx.chart, title: `${titulacion} · ${q.convocatoria}${q.numero ? ` · P${q.numero}` : ''}`, statement: q.enunciado,
        steps: run.k.steps, items: run.k.items, focus: run.k.focus, answerNodes: [answerBlock], tab, progress,
        result: examOutroText(),
        summary: () => summaryText, ayudas: enTema, glosas, bloc,
        // Pestaña «Paso a paso»: el mismo modo guiado, dibujando cada paso en la carta de la mesa.
        guiado: conGuiado ? ({ chart: api, dibujar }) => guiadoPanel({ q, sol: run.sol, chart: ctx.chart, dibujar, carta: () => api, factor: factor(), glosas, onOpcion: alElegir }).el : null,
      });
    };
    const tableButtons = run?.k.items.length
      ? h('div.actions.table-actions',
        h('button', { type: 'button', onclick: () => openTable('ejercicio') }, conIcono('mapa', 'Resolver en la carta')),
        h('button.secondary', { type: 'button', onclick: () => openTable('tutorial') }, conIcono('clase', 'Ver la resolución en la carta')))
      : null;

    const enunciadoEl = h('p', q.enunciado);
    glosar(enunciadoEl, glosas);
    setChildren(el, 
      volver(lista.titulo, tlink(q.tit, ['examenes', lista.id])),
      h('header.con-ayudas', h('h1', `${titulacion} · ${q.convocatoria}${q.numero ? ` · pregunta ${q.numero}` : ''}`), h('div.badges', h('span.badge', eje.nombre), q.anulada ? h('span.badge.warn', 'Anulada') : null), ayudas.barra),
      ayudas.panel,
      q.enunciado_comun ? h('section.statement.common', h('h2', 'Enunciado común'), h('p', q.enunciado_comun)) : null,
      h('section.statement', enunciadoEl, h('div.actions.bloc-acciones', botonBloc(bloc, { texto: 'Bloc de notas' })), tableButtons ? avisoCartaMovil(progress) : null, tableButtons),
      guiadoBox,
      answerBlock,
      h('div.actions',
        prev ? h('a.btn.secondary', { href: enLista(prev) }, '← Anterior') : null,
        next ? h('a.btn.secondary', { href: enLista(next) }, 'Siguiente →') : null,
      ),
      solution,
      h('p.muted.small', 'Fuente: ', q.fuentes?.examen ? h('a', { href: q.fuentes.examen, target: '_blank', rel: 'noopener' }, 'examen') : '—',
        q.fuentes?.plantilla ? [' · ', h('a', { href: q.fuentes.plantilla, target: '_blank', rel: 'noopener' }, 'plantilla')] : null,
        ''),
      q.notas ? h('details', h('summary', 'Notas sobre la fuente'), h('p.small', q.notas)) : null,
      h('p.pie-aviso', accionTema(q), avisoError(`Pregunta ${q.id} (${q.convocatoria ?? lista.titulo})`, q.enunciado.slice(0, 120))),
      h('details.ai-context#ai-context', h('summary', 'Para asistentes de IA'),
        h('p.muted.small', h('button.small', { type: 'button', onclick: () => copyText(summaryText) }, 'Copiar')), aiPre),
    );
    refresh();
    if (route.query.guiado === '1') abrirGuiado(false);
  }

  return { el, summary: () => (currentWorkspace() ? currentWorkspace().summary() : summaryText) };
}
