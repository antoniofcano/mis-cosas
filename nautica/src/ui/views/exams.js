import { h, copyText, setChildren } from '../dom.js';
import { pregunta, cargarBanco, resolverLegado, SOLUCIONES as solutions } from '../../bancos/index.js';
import { avisoDePregunta } from '../motivo-carta.js';
import { examQuestionSummary } from '../../ai/summary.js';
import { link, navigate } from '../router.js';
import { TITULACIONES, tlink, volver, currentTit, currentEje } from '../titulacion.js';
import { createKit } from '../../exams/kit.js';
import { chooseOption } from '../../exams/options.js';
import { quantity } from '../../analysis/quantities.js';
import { chartWidget, burbujaCarta } from '../chart-widget.js';
import { openWorkspace, currentWorkspace } from '../chart/workspace.js';
import { narrateSteps, narrateIntro, narrateOutro } from '../../teacher/narrate.js';
import { profeStepItems, listenAllButton } from '../profe-steps.js';
import { avisoError } from '../aviso-error.js';
import { accionTema } from '../tema-pregunta.js';
import { cuenta } from '../../texto.js';
import { crearAyudas } from '../ayudas.js';
import { glosar } from '../glosas.js';
import { conIcono, icono } from '../iconos.js';
import { botonBloc } from '../bloc.js';
import { ID_BLOC } from '../../bloc/notas.js';
import { guiadoPanel, guiadoDisponible } from '../guiado.js';
import { papelPanel, papelDisponible } from '../papel.js';
import { intencionPanel, intencionDisponible } from '../intencion.js';
import { diagnosticoEl, diagnosticoTexto } from '../diagnostico.js';
import { ejemplosDelTipo } from '../../exams/ensena.js';
import { agruparPorConvocatoria, contarGrupo, rotuloGrupo, contadoresGrupo, siguienteSinHacer, estadoDe, primerasPalabras, convocatoriaCorta } from '../../exams/lista-preguntas.js';
import { menuAcciones } from '../menu-acciones.js';

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

/**
 * El ejemplo resuelto y el de huecos de una pregunta (R-71): otras dos preguntas reales del mismo tipo, de la práctica del
 * banco (nunca reservadas), cada una montada con su carta si se dibuja. null si no hay ninguna.
 */
function ejemplosDe({ q, sol, banco, chart, factor, glosas }) {
  if (!sol?.ejercicio) return null;
  const { resuelto, huecos } = ejemplosDelTipo({ q, tipo: sol.ejercicio, practica: banco.practica, reservadas: banco.reservadas,
    tipoDe: (x) => solutions[x.id]?.ejercicio ?? null, sirve: (x) => guiadoDisponible(x, solutions[x.id], chart) });
  if (!resuelto) return null;
  const montar = (x, modo) => () => {
    const r = runSolution(x, chart);
    const w = r?.k.items.length ? chartWidget(chart, { items: r.k.items, focus: r.k.focus, step: 0, height: 240 }) : null;
    const g = guiadoPanel({ q: x, sol: solutions[x.id], chart, modo, dibujar: (n) => w?.setStep(n), carta: () => w, factor, glosas: { ...glosas, ut: x.ut } });
    return h('div.guiado-ejemplo-caja', g.el, w ? h('div.guiado-carta', w.el) : null);
  };
  return { resuelto: montar(resuelto, 'resuelto'), huecos: huecos ? montar(huecos, 'huecos') : null };
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

const SIGNO_ESTADO = { ok: '✓', mal: '✗', sin: '·' };
const RETULO_ESTADO = { ok: 'Acertada. ', mal: 'Fallada. ', sin: 'Sin hacer. ' };

/**
 * #/<tit>/examenes/<lista>[?c=<convocatoria>] — una lista de preguntas reales del eje (p. ej. las de carta), plegada por
 * convocatorias (H-73): cada una con lo que el alumno lleva hecho y acertado, y arriba «Seguir con la siguiente sin hacer».
 * Con `?c=` (la miga de una pregunta), esa convocatoria sale abierta. Lógica en src/exams/lista-preguntas.js.
 */
export function listaView({ progress, params: route, tit }) {
  const el = h('div.exams', h('p.muted', 'Cargando preguntas…'));
  let summaryText = 'VISTA lista de preguntas reales (cargando)';
  const id = route.parts[1];
  cargarBanco(currentEje(progress), tit).then((banco) => {
    const lista = banco.lista(id);
    if (!lista) { setChildren(el, volver('Exámenes', tlink(tit, ['examenes'])), h('p', 'Esta lista de preguntas no existe.')); return; }
    const respuestas = progress.get().exams;
    const grupos = agruparPorConvocatoria(lista.preguntas);
    const siguiente = siguienteSinHacer(lista.preguntas, respuestas);
    const abrir = route.query.c ?? null;
    const enlace = (q) => link(['q', q.id], banco.listaDe(q).id === lista.id ? undefined : { l: lista.id });
    const hechas = contarGrupo(lista.preguntas, respuestas);
    summaryText = `VISTA banco ${lista.titulo} · ${cuenta(lista.preguntas.length, 'pregunta')} en ${cuenta(grupos.length, 'convocatoria')} (plegadas; ${hechas.hechas} hechas, ${hechas.acertadas} acertadas)\n` +
      (siguiente ? `Siguiente sin hacer: ${siguiente.id}\n` : 'Todas hechas.\n') +
      lista.preguntas.map((q) => `${q.id}: ${SIGNO_ESTADO[estadoDe(respuestas[q.id])]} ${q.enunciado.slice(0, 80)}`).join('\n');
    let abierto = null;
    const bloque = (g) => {
      const d = h('details.conv-grupo', { open: abrir === g.conv, 'data-conv': g.conv },
        h('summary', { 'aria-label': rotuloGrupo(g, respuestas) }, h('span.conv-tit', convocatoriaCorta(g.titulo)), h('span.conv-cont', contadoresGrupo(g, respuestas))),
        h('ol.qlist', g.preguntas.map((q, i) => {
          const e = estadoDe(respuestas[q.id]);
          return h('li', h('a.qfila', { href: enlace(q) },
            h('span', { class: `qestado ${e}`, 'aria-hidden': 'true' }, SIGNO_ESTADO[e]), h('span.solo-lector', RETULO_ESTADO[e]),
            h('strong', `Pregunta ${q.numero ?? i + 1}`), ' ', h('span.qtexto', primerasPalabras(q.enunciado, 8))));
        })));
      if (abrir === g.conv) abierto = d;
      return d;
    };
    setChildren(el,
      volver(lista.id === 'carta' ? 'Ejercicios de carta' : 'Examen', lista.id === 'carta' ? tlink(tit, ['carta']) : tlink(tit, ['examenes'])),
      h('h1', lista.titulo),
      h('p.muted', 'Preguntas reales de exámenes anteriores, por convocatoria. Las que has hecho llevan ✓ o ✗.'),
      siguiente
        ? [h('a.btn.grande.lista-seguir', { href: enlace(siguiente) }, 'Seguir con la siguiente sin hacer'),
          h('p.muted.small.lista-seguir-nota', `La siguiente: pregunta ${siguiente.numero ?? lista.preguntas.indexOf(siguiente) + 1} · ${convocatoriaCorta(siguiente.convocatoria)}.`)]
        : h('p.ok', conIcono('ok', 'Has hecho todas las preguntas de esta lista.')),
      h('div.conv-grupos', grupos.map(bloque)),
    );
    if (abierto) requestAnimationFrame(() => { abierto.scrollIntoView({ block: 'start' }); abierto.querySelector('summary')?.focus({ preventScroll: true }); });
  }).catch((e) => setChildren(el, h('p.warn', `No se pudieron cargar los exámenes: ${e.message}`)));
  return { el, summary: () => summaryText };
}

/** #/q/<id>[?l=<lista>] — una pregunta real de examen, de cualquier eje: resolverla y verla resuelta en la carta. */
export function preguntaView({ ctx, progress, params: route }) {
  const el = h('div.exams', h('p.muted', 'Cargando preguntas…'));
  let summaryText = 'VISTA exámenes (cargando)';
  const qid = route.parts[1];
  let refrescar = null; // el resumen se rehace al pedirlo (el paso a paso y la carta por intención avanzan sin avisar)

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
    // Las tres maneras de hacerla, además de «Solo la respuesta», se eligen en un selector (H-73) y se abren en su panel,
    // justo debajo del enunciado; con ?guiado=1, ?papel=1 o ?traza=1 se abre el que se pide. Nunca en un examen.
    //  - «Paso a paso» (src/ui/guiado.js): la app pide cada paso y lo corrige.
    //  - «En papel» (R-58, src/ui/papel.js): el alumno resuelve en su hoja y la app corrige por pasos.
    //  - «En la carta» (R-54, src/ui/intencion.js): elige qué trazar y la app lo dibuja. Solo si hay algo que trazar.
    const conGuiado = !!run && guiadoDisponible(q, run.sol, ctx.chart);
    const guiadoBox = h('div.guiado-box', { hidden: true });
    let guiado = null;
    const conPapel = !!run && papelDisponible(q, run.sol, ctx.chart);
    const papelBox = h('div.papel-box', { hidden: true });
    let papel = null;
    const conTraza = !!run && run.k.items.length > 0 && intencionDisponible(q, run.sol, ctx.chart);
    const trazaBox = h('div.intencion-box', { hidden: true });
    let traza = null;
    const disponibles = ['respuesta', ...(conGuiado ? ['guiado'] : []), ...(conPapel ? ['papel'] : []), ...(conTraza ? ['traza'] : [])];
    let modo = 'respuesta';
    const refresh = () => {
      summaryText = examQuestionSummary(q, choice, run && {
        steps: run.k.steps, values: run.values.map((v) => quantity(v.kind).format(v.value)), choice: run.pick.choice,
      }, { eje: eje.nombre, titulacion: TITULACIONES[q.tit]?.sigla });
      if (choice && result.childElementCount) { const d = diagnosticoTexto(q, choice, ctx.chart); if (d) summaryText += `\n${d}`; }
      if (guiado) summaryText += `\n${guiado.summary()}`;
      if (papel) summaryText += `\n${papel.summary()}`;
      if (traza) summaryText += `\n${traza.summary()}`;
      aiPre.textContent = summaryText;
    };
    refrescar = refresh;

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

    // «Solo la respuesta»: las opciones y «Comprobar». Se traslada a la mesa de cartas cuando se abre.
    let ws = null;
    const answerBlock = h('div.answer-block', options, h('div.actions', h('button', { type: 'button', onclick: verify }, 'Comprobar')), result);
    const factor = () => progress.settings().toleranceFactor ?? 1;
    const alElegir = (letra, ok) => { choice = letra; progress.recordExam(q.id, { choice: letra, ok }); refresh(); };
    const verSolucion = () => { showSolution(); if (ws && currentWorkspace() === ws) ws.show('tutorial'); };

    const sinModos = (query) => { const { guiado: _g, papel: _p, traza: _t, ...resto } = query; return resto; };
    let selector = null;
    /** Pone el modo elegido (y su panel bajo el enunciado) y deja la dirección con su parámetro, sin añadir historial. */
    function ponModo(nuevo, { url = true } = {}) {
      if (!disponibles.includes(nuevo)) nuevo = 'respuesta';
      if (nuevo !== 'respuesta' && ws && currentWorkspace() === ws) ws.close();
      guiado = null; papel = null; traza = null;
      for (const caja of [guiadoBox, papelBox, trazaBox]) { caja.replaceChildren(); caja.hidden = true; }
      modo = nuevo;
      if (nuevo === 'guiado') {
        const w = run.k.items.length ? chartWidget(ctx.chart, { items: run.k.items, focus: run.k.focus, step: 0 }) : null;
        guiado = guiadoPanel({ q, sol: run.sol, chart: ctx.chart, dibujar: (n) => w?.setStep(n), carta: () => w, factor: factor(), glosas,
          onOpcion: alElegir, ejemplos: ejemplosDe({ q, sol: run.sol, banco, chart: ctx.chart, factor: factor(), glosas }) });
        setChildren(guiadoBox, guiado.el, w ? h('div.guiado-carta', w.el) : null);
        guiadoBox.hidden = false;
      } else if (nuevo === 'papel') {
        papel = papelPanel({ q, sol: run.sol, chart: ctx.chart, factor: factor(), tit: q.tit, onGuiado: conGuiado ? () => cambiarModo('guiado') : null, onCorregido: () => refresh() });
        papelBox.replaceChildren(papel.el);
        papelBox.hidden = false;
      } else if (nuevo === 'traza') {
        traza = intencionPanel({ q, sol: run.sol, chart: ctx.chart, tit: q.tit, onGuiado: conGuiado ? () => cambiarModo('guiado') : null });
        trazaBox.replaceChildren(traza.el);
        trazaBox.hidden = false;
      }
      answerBlock.hidden = nuevo !== 'respuesta';
      selector?.sync(nuevo);
      if (url) navigate(['q', q.id], { ...sinModos(route.query), ...(nuevo === 'respuesta' ? {} : { [nuevo]: '1' }) }, { replace: true });
      refresh();
    }
    /** Lo elige el alumno (selector o atajo de otro modo): se recuerda para las siguientes preguntas. */
    function cambiarModo(nuevo) {
      ponModo(nuevo);
      try { progress.setSetting('modoPregunta', nuevo); } catch { /* sin almacén: solo esta pregunta */ }
    }

    const examOutroText = () => `${run.values.map((v) => quantity(v.kind).format(v.value)).join(', ')}${run.pick.choice ? `, que corresponde a la opción ${run.pick.choice}` : ''}`;
    const examOutro = () => narrateOutro(examOutroText());
    const openTable = (tab) => {
      if (modo !== 'respuesta') ponModo('respuesta'); // en la mesa, el paso a paso va en su pestaña
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
    const hayCarta = !!run?.k.items.length;

    // El selector de modo: un solo grupo de botones de radio (las flechas mueven la elección). Solo si hay más de una manera.
    const NOMBRES_MODO = { respuesta: 'Solo la respuesta', guiado: 'Paso a paso', papel: 'En papel', traza: 'En la carta' };
    if (disponibles.length > 1) {
      const nombre = `modo-${q.id}`;
      const radios = disponibles.map((m) => h('input', { type: 'radio', name: nombre, value: m, checked: m === 'respuesta', onchange: () => cambiarModo(m) }));
      selector = {
        el: h('fieldset.modo-selector', h('legend', '¿Cómo quieres hacerla?'),
          h('div.modo-opciones', disponibles.map((m, i) => h('label.modo-op', radios[i], h('span.modo-nombre', NOMBRES_MODO[m]))))),
        sync: (m) => radios.forEach((r) => { r.checked = r.value === m; }),
      };
    }

    // Barra de herramientas compacta: chuleta, calculadora, bloc, carta y el menú «⋯» con lo demás.
    const burbuja = hayCarta ? burbujaCarta(progress) : null;
    const botonCarta = hayCarta ? h('span.herr-carta-hueco',
      h('button.secondary.small.boton-carta', { type: 'button', title: 'Resolver en la carta, a pantalla completa', 'aria-label': 'Resolver en la carta, a pantalla completa', ...(burbuja ? { 'aria-describedby': 'burbuja-carta' } : {}),
        onclick: () => { burbuja?.cerrar(); openTable('ejercicio'); } }, icono('mapa'), 'Carta'),
      burbuja?.el) : null;
    // Lo que no es la tarea (la fuente, las notas, avisar de un error, el texto para asistentes de IA) va en el menú.
    const abrirExtra = (nodo) => {
      nodo.hidden = false;
      if (nodo.tagName === 'DETAILS') nodo.open = true;
      requestAnimationFrame(() => { nodo.scrollIntoView({ block: 'start' }); (nodo.querySelector('summary') ?? nodo).focus({ preventScroll: true }); });
    };
    const notasEl = q.notas ? h('section.extra-fuente', { hidden: true, tabindex: '-1', 'aria-label': 'Notas sobre la fuente' },
      h('h2', 'Notas sobre la fuente'), h('p.small', q.notas),
      h('button.small.secondary', { type: 'button', onclick: () => { notasEl.hidden = true; } }, 'Cerrar')) : null;
    // `#ai-context` sigue en la página (llms.txt) aunque no se vea: «Para asistentes de IA», en el menú, lo enseña.
    const aiEl = h('details.ai-context#ai-context', { hidden: true }, h('summary', 'Para asistentes de IA'),
      h('p.muted.small', h('button.small', { type: 'button', onclick: () => copyText(summaryText) }, 'Copiar')), aiPre);
    const tema = accionTema(q);
    const menu = menuAcciones({ etiqueta: 'Más opciones de esta pregunta', items: [
      { texto: 'Ver la solución sin intentarlo', icono: 'bombilla', onclick: verSolucion },
      hayCarta ? { texto: 'Ver la resolución en la carta', icono: 'clase', onclick: () => openTable('tutorial') } : null,
      q.fuentes?.examen ? { texto: 'Fuente: el examen', icono: 'enlace', href: q.fuentes.examen, externo: true } : null,
      q.fuentes?.plantilla ? { texto: 'Fuente: la plantilla', icono: 'enlace', href: q.fuentes.plantilla, externo: true } : null,
      notasEl ? { texto: 'Notas sobre la fuente', icono: 'libro', onclick: () => abrirExtra(notasEl) } : null,
      tema ? { nodo: tema } : null,
      { nodo: avisoError(`Pregunta ${q.id} (${q.convocatoria ?? lista.titulo})`, q.enunciado.slice(0, 120)) },
      { texto: 'Para asistentes de IA', icono: 'texto', onclick: () => abrirExtra(aiEl) },
    ] });
    const herramientas = h('div.herr-carta', { role: 'group', 'aria-label': 'Herramientas' }, ayudas.barra, botonBloc(bloc, { texto: 'Bloc' }), botonCarta, menu.el);

    // Si se pide por la dirección un modo que esta pregunta no tiene (p. ej. ?traza=1 en una de mareas, sin trazo), se dice en una línea.
    const pedido = ['guiado', 'papel', 'traza'].find((m) => route.query[m] === '1') ?? null;
    const noHay = !!pedido && !disponibles.includes(pedido);
    const inicial = pedido ? (noHay ? (conGuiado ? 'guiado' : 'respuesta') : pedido) : (() => {
      const recordado = progress.settings().modoPregunta;
      return recordado && disponibles.includes(recordado) ? recordado : 'respuesta';
    })();
    const avisoModo = noHay ? h('p.modo-aviso', { role: 'status' }, conIcono('aviso',
      `${pedido === 'traza' ? 'Esta pregunta no tiene trazado en la carta.' : 'Esa forma de hacerla no está disponible en esta pregunta.'}${inicial === 'guiado' ? ' Te abro el paso a paso.' : ''}`)) : null;

    const enunciadoEl = h('p', q.enunciado);
    glosar(enunciadoEl, glosas);
    // La miga lleva a la convocatoria de esta pregunta dentro de la lista, ya abierta (?c=).
    const migaLista = volver(`${convocatoriaCorta(q.convocatoria)} · lista`, tlink(q.tit, ['examenes', lista.id], q.conv ? { c: q.conv } : undefined));
    setChildren(el,
      migaLista,
      h('header.pregunta-cab', h('h1', `${titulacion} · ${q.numero ? `pregunta ${q.numero}` : q.convocatoria}`),
        h('p.pregunta-sub.muted.small', `${convocatoriaCorta(q.convocatoria)} · ${eje.nombre}`, q.anulada ? [' ', h('span.badge.warn', 'Anulada')] : null)),
      herramientas,
      ayudas.panel,
      q.enunciado_comun ? h('section.statement.common', h('h2', 'Enunciado común'), h('p', q.enunciado_comun)) : null,
      h('section.statement', enunciadoEl),
      avisoModo,
      selector?.el,
      guiadoBox,
      papelBox,
      trazaBox,
      answerBlock,
      h('div.actions',
        prev ? h('a.btn.secondary', { href: enLista(prev) }, '← Anterior') : null,
        next ? h('a.btn.secondary', { href: enLista(next) }, 'Siguiente →') : null,
      ),
      solution,
      notasEl,
      aiEl,
    );
    refresh();
    ponModo(inicial, { url: !!pedido || inicial !== 'respuesta' });
  }

  return { el, summary: () => { if (currentWorkspace()) return currentWorkspace().summary(); refrescar?.(); return summaryText; } };
}
